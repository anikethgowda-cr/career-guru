import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
    fetchAssessmentById,
    createAssessmentAttempt,
    submitAssessment
} from "../../../slices/user/UserAssessmentSlice";

function Interview() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { selectedAssessment, loading, error } = useSelector(
        (state) => state.userAssessment
    );

    const attempt = useSelector(
        (state) => state.userAssessment.attempt
    );

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [cameraStarted, setCameraStarted] = useState(false);
    const [mediaError, setMediaError] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoURL, setRecordedVideoURL] = useState("");
    const [recordingTime, setRecordingTime] = useState(0);

    // Per-question transcripts storage keyed by questionId
    const [transcriptsByQuestion, setTranscriptsByQuestion] = useState({});
    const [isListening, setIsListening] = useState(false);
    const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
    const [isSpeakingIntroduction, setIsSpeakingIntroduction] = useState(false);
    const [introductionCompleted, setIntroductionCompleted] = useState(false);

    const [speechError, setSpeechError] = useState("");
    const [isFinishing, setIsFinishing] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState("");

    const videoRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const recordedVideoBlobRef = useRef(null);
    const recordingTimerRef = useRef(null);
    const speechRecognitionRef = useRef(null);
    const activeUtteranceRef = useRef(null);
    const transcriptsByQuestionRef = useRef({});
    const activeQuestionIdRef = useRef(null);
    const isSpeakingQuestionRef = useRef(false);
    const interviewFinishedRef = useRef(false);

    const introductionPlayedRef = useRef(false);

    useEffect(() => {
        if (assessmentId) {
            dispatch(fetchAssessmentById(assessmentId));
        }
    }, [assessmentId, dispatch]);

    // Restore attempt if page is refreshed directly
    useEffect(() => {
        if (assessmentId && !attempt) {
            dispatch(createAssessmentAttempt(assessmentId));
        }
    }, [assessmentId, attempt, dispatch]);

    const questions = selectedAssessment?.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    const candidateName =
        selectedAssessment?.studentId?.username || "Candidate";

    const mentorName =
        selectedAssessment?.mentorId?.username || "your mentor";

    const delay = (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    const attachVideoStream = useCallback((node) => {
        videoRef.current = node;
        if (node && mediaStreamRef.current) {
            node.muted = true;
            node.defaultMuted = true;
            node.playsInline = true;
            if (node.srcObject !== mediaStreamRef.current) {
                node.srcObject = mediaStreamRef.current;
            }
            node.play().catch((err) => {
                console.log("Video play error in ref callback:", err);
            });
        }
    }, []);

    const startCamera = async () => {
        try {
            setMediaError("");

            let stream;
            try {
                // Try standard webcam first
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
            } catch (simpleErr) {
                console.warn("Retrying with ideal resolution constraints:", simpleErr);
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: "user"
                    },
                    audio: true
                });
            }

            mediaStreamRef.current = stream;
            setCameraStarted(true);

            if (videoRef.current) {
                videoRef.current.muted = true;
                videoRef.current.defaultMuted = true;
                videoRef.current.playsInline = true;
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch((err) => {
                    console.log("Video play error on startCamera:", err);
                });
            }

            startRecording(stream);
        } catch (err) {
            console.error("Camera access error:", err);
            setMediaError(
                "Unable to access camera or microphone. Please allow camera permissions and ensure no other application is using them."
            );
        }
    };

    useEffect(() => {
        if (
            cameraStarted &&
            videoRef.current &&
            mediaStreamRef.current
        ) {
            videoRef.current.muted = true;
            videoRef.current.defaultMuted = true;
            videoRef.current.playsInline = true;
            if (videoRef.current.srcObject !== mediaStreamRef.current) {
                videoRef.current.srcObject = mediaStreamRef.current;
            }
            videoRef.current.play().catch((err) => {
                console.log("Video play error in effect:", err);
            });
        }
    }, [cameraStarted, introductionCompleted, currentQuestionIndex]);

    const startRecording = (stream) => {
        try {
            recordedChunksRef.current = [];

            let recorder = null;
            const candidateTypes = [
                "video/webm;codecs=vp8,opus",
                "video/webm;codecs=vp9,opus",
                "video/webm;codecs=h264,opus",
                "video/webm",
                "video/mp4"
            ];

            for (const mime of candidateTypes) {
                if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
                    try {
                        recorder = new MediaRecorder(stream, { mimeType: mime });
                        console.log("MediaRecorder successfully created with:", mime);
                        break;
                    } catch (e) {
                        console.warn(`MediaRecorder failed with ${mime}:`, e);
                    }
                }
            }

            // Ultimate fallback without options if specific types failed
            if (!recorder) {
                try {
                    recorder = new MediaRecorder(stream);
                    console.log("MediaRecorder created with default browser settings");
                } catch (fallbackErr) {
                    console.error("Default MediaRecorder constructor failed:", fallbackErr);
                    setMediaError("Video recording is not supported in this browser.");
                    return;
                }
            }

            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                    console.log(`Video chunk received: ${event.data.size} bytes. Total chunks: ${recordedChunksRef.current.length}`);
                }
            };

            recorder.onerror = (event) => {
                console.error("MediaRecorder error event:", event);
            };

            recorder.onstop = async () => {
                console.log("Recorder stopped. Assembling final blob from", recordedChunksRef.current.length, "chunks");
                const mimeType = recorder.mimeType || "video/webm";
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });

                recordedVideoBlobRef.current = blob;
                setIsRecording(false);

                console.log("Final video created. Size:", blob.size, "Type:", blob.type);

                // Stop camera and microphone tracks after final video blob is safely created
                stopCamera();

                // Auto-submit the interview recording and answers
                await submitInterview(blob);
            };

            recorder.start(1000);

            setIsRecording(true);
            setRecordingTime(0);

            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }

            recordingTimerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            console.log("Video recording started successfully. State:", recorder.state);
        } catch (err) {
            console.error("Critical error in startRecording:", err);
            setMediaError("Unable to start video recording: " + (err.message || "Unknown error"));
        }
    };

    const stopRecording = () => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            mediaRecorderRef.current.stop();
        }

        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
    };

    const stopCamera = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => {
                track.stop();
            });
            mediaStreamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraStarted(false);
    };

    const speakText = (text, type = "question") => {
        return new Promise((resolve) => {
            if (!window.speechSynthesis) {
                resolve();
                return;
            }

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            activeUtteranceRef.current = utterance;

            utterance.lang = "en-IN";
            utterance.rate = 0.9;
            utterance.pitch = 1;

            utterance.onstart = () => {
                if (type === "introduction") {
                    setIsSpeakingIntroduction(true);
                } else {
                    setIsSpeakingQuestion(true);
                }
            };

            utterance.onend = () => {
                activeUtteranceRef.current = null;
                setIsSpeakingIntroduction(false);
                setIsSpeakingQuestion(false);
                resolve();
            };

            utterance.onerror = (event) => {
                console.log("Speech synthesis error:", event);
                activeUtteranceRef.current = null;
                setIsSpeakingIntroduction(false);
                setIsSpeakingQuestion(false);
                resolve();
            };

            window.speechSynthesis.speak(utterance);
        });
    };

    const speakIntroduction = async () => {
        const introduction = `
            Good morning, ${candidateName}.
            My name is CareerGuru AI, and I am your AI assistant conducting this interview on behalf of ${mentorName}.
            This interview is for practice purposes, so don't worry too much about the score.
            Vedio recording is Done for Qualtitypurpose make sure u make acess to camera and mmicrophone before starting the Assessment
            Just relax and answer the questions to the best of your ability.
            All the best, and let's begin.
        `;

        await speakText(introduction, "introduction");
        await delay(1500);
        setIntroductionCompleted(true);
    };

    const startSpeechRecognition = (questionId) => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSpeechError(
                "Speech recognition is not supported in this browser."
            );
            return;
        }

        stopSpeechRecognition();

        setSpeechError("");
        setIsListening(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN";

        // Capture existing text for this question before starting this recognition session
        const baseTranscript =
            transcriptsByQuestionRef.current[String(questionId)] || "";

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            // Guard: If question has switched or interview has completed, ignore
            if (
                activeQuestionIdRef.current !== String(questionId) ||
                interviewFinishedRef.current
            ) {
                return;
            }

            let sessionFinalTranscript = "";
            let sessionInterimTranscript = "";

            for (let i = 0; i < event.results.length; i++) {
                const item = event.results[i];
                if (item.isFinal) {
                    sessionFinalTranscript += item[0].transcript + " ";
                } else {
                    sessionInterimTranscript += item[0].transcript;
                }
            }

            const prefix = baseTranscript ? baseTranscript.trim() + " " : "";
            const currentFinal = (prefix + sessionFinalTranscript).trim();
            const totalTranscript = (
                currentFinal + (sessionInterimTranscript ? " " + sessionInterimTranscript : "")
            ).trim();

            // Save finalized transcript to ref
            transcriptsByQuestionRef.current[String(questionId)] =
                currentFinal || totalTranscript;

            // Update state so the UI displays the transcript for this question
            setTranscriptsByQuestion((prev) => ({
                ...prev,
                [String(questionId)]: totalTranscript
            }));
        };

        recognition.onerror = (event) => {
            console.log("Speech recognition error:", event.error);

            if (event.error === "not-allowed") {
                setSpeechError("Microphone permission was denied.");
            } else if (event.error === "no-speech") {
                return;
            } else {
                setSpeechError("Speech recognition encountered an error.");
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            // Restart only if still on the same question and AI is not speaking
            if (
                activeQuestionIdRef.current === String(questionId) &&
                !interviewFinishedRef.current &&
                !isSpeakingQuestionRef.current
            ) {
                try {
                    recognition.start();
                } catch (err) {
                    // Ignore restart race condition
                }
            }
        };

        speechRecognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (err) {
            console.log("Recognition start error:", err);
        }
    };

    const stopSpeechRecognition = () => {
        if (speechRecognitionRef.current) {
            const recognition = speechRecognitionRef.current;
            // Detach listeners immediately to prevent any late events
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
            try {
                recognition.abort();
            } catch (err) {
                console.log("Recognition abort error:", err);
            }
            speechRecognitionRef.current = null;
        }

        setIsListening(false);
    };

    const handleTranscriptChange = (newText) => {
        if (!currentQuestion) return;
        const qId = String(currentQuestion._id);
        transcriptsByQuestionRef.current[qId] = newText;
        setTranscriptsByQuestion((prev) => ({
            ...prev,
            [qId]: newText
        }));
    };

    const handleToggleListening = () => {
        if (!currentQuestion || isSpeakingQuestion) return;
        if (isListening) {
            stopSpeechRecognition();
        } else {
            startSpeechRecognition(currentQuestion._id);
        }
    };

    /*
     * Assembles the final responses array for every question
     * in the assessment with its own isolated transcript.
     */
    const buildFinalResponses = () => {
        return questions.map((q) => ({
            questionId: q._id,
            question: q.question,
            transcript: (
                transcriptsByQuestionRef.current[String(q._id)] || ""
            ).trim()
        }));
    };

    const handleStartInterview = async () => {
        await startCamera();
        setInterviewStarted(true);
    };

    const handleNextQuestion = () => {
        if (!currentQuestion) {
            return;
        }

        stopSpeechRecognition();
        window.speechSynthesis?.cancel();
        setIsSpeakingQuestion(false);
        isSpeakingQuestionRef.current = false;
        setSpeechError("");

        // Move to next question
        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handleFinishInterview = () => {
        console.log("Finish Interview clicked");

        setIsFinishing(true);
        interviewFinishedRef.current = true;
        activeQuestionIdRef.current = null;

        stopSpeechRecognition();
        window.speechSynthesis?.cancel();

        setIsSpeakingQuestion(false);
        isSpeakingQuestionRef.current = false;
        setIsSpeakingIntroduction(false);
        setIsListening(false);
        setSpeechError("");

        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            // Normal flow: stopping the recorder triggers recorder.onstop
            stopRecording();
        } else {
            console.warn("MediaRecorder was not active on finish. Proceeding with available video.");
            stopCamera();
            const fallbackBlob =
                recordedVideoBlobRef.current ||
                (recordedChunksRef.current.length > 0
                    ? new Blob(recordedChunksRef.current, { type: "video/webm" })
                    : new Blob([], { type: "video/webm" }));
            submitInterview(fallbackBlob);
        }
    };

    const submitInterview = async (videoBlob) => {
        try {
            setSubmitLoading(true);
            setSubmitError("");
            setSubmitSuccess("");

            if (!attempt?._id) {
                setSubmitError("Assessment attempt was not found.");
                setSubmitLoading(false);
                return;
            }

            const blobToUpload = videoBlob || recordedVideoBlobRef.current;

            if (!blobToUpload) {
                setSubmitError("Interview video is not available.");
                setSubmitLoading(false);
                return;
            }

            const finalResponses = buildFinalResponses();

            console.log("Final responses to submit:", finalResponses);

            const formData = new FormData();
            formData.append("attemptId", attempt._id);
            formData.append("responses", JSON.stringify(finalResponses));
            formData.append(
                "video",
                blobToUpload,
                "interview.webm"
            );

            const response = await dispatch(submitAssessment(formData)).unwrap();

            if (response.success) {
                setSubmitSuccess("Assessment submitted successfully.");
                console.log("Submitted responses successfully. Redirecting to reports...");
                navigate("/user/assessment-report");
            }
        } catch (err) {
            console.log("Submit interview error:", err);
            setSubmitError(
                err?.message ||
                err?.response?.data?.message ||
                "Failed to submit assessment."
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    // AI introduction effect
    useEffect(() => {
        if (
            !interviewStarted ||
            !cameraStarted ||
            introductionPlayedRef.current
        ) {
            return;
        }

        if (!questions.length) {
            return;
        }

        introductionPlayedRef.current = true;
        speakIntroduction();

        return () => {
            window.speechSynthesis?.cancel();
        };
    }, [interviewStarted, cameraStarted, questions.length]);

    // Question speech + speech recognition
    useEffect(() => {
        if (
            !interviewStarted ||
            !cameraStarted ||
            !introductionCompleted ||
            !currentQuestion ||
            interviewFinishedRef.current
        ) {
            return;
        }

        let cancelled = false;
        const currentQId = String(currentQuestion._id);
        activeQuestionIdRef.current = currentQId;

        const startQuestion = async () => {
            stopSpeechRecognition();
            setSpeechError("");

            // Wait 1.5 seconds before AI reads question
            await delay(1500);

            if (cancelled) {
                return;
            }

            // Speak question aloud
            isSpeakingQuestionRef.current = true;
            setIsSpeakingQuestion(true);
            await speakText(currentQuestion.question, "question");
            isSpeakingQuestionRef.current = false;
            setIsSpeakingQuestion(false);

            if (cancelled) {
                return;
            }

            // Start recognition automatically after AI finishes speaking
            startSpeechRecognition(currentQId);
        };

        startQuestion();

        return () => {
            cancelled = true;
            window.speechSynthesis?.cancel();
            stopSpeechRecognition();
            setIsSpeakingQuestion(false);
            isSpeakingQuestionRef.current = false;
        };
    }, [
        currentQuestionIndex,
        interviewStarted,
        cameraStarted,
        introductionCompleted
    ]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }

            if (
                mediaRecorderRef.current &&
                mediaRecorderRef.current.state !== "inactive"
            ) {
                mediaRecorderRef.current.stop();
            }

            if (speechRecognitionRef.current) {
                try {
                    speechRecognitionRef.current.stop();
                } catch (err) {
                    console.log(err);
                }
            }

            window.speechSynthesis?.cancel();

            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((track) => {
                    track.stop();
                });
            }

            if (recordedVideoURL) {
                URL.revokeObjectURL(recordedVideoURL);
            }
        };
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#16171d] px-4 text-slate-900 dark:text-white transition-colors duration-300">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-950"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400">
                        Preparing your assessment studio...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#16171d] px-4 text-slate-900 dark:text-white transition-colors duration-300">
                <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/60 p-8 text-center shadow-sm space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assessment Error</h2>
                    <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                    <button
                        type="button"
                        onClick={() => navigate("/user/assessment")}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 rounded-xl transition cursor-pointer"
                    >
                        Return to Assessments
                    </button>
                </div>
            </div>
        );
    }

    if (!selectedAssessment) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#16171d] px-4 text-slate-900 dark:text-white">
                <div className="text-center space-y-3">
                    <p className="text-base font-semibold text-slate-600 dark:text-zinc-400">Assessment not found.</p>
                    <button
                        type="button"
                        onClick={() => navigate("/user/assessment")}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-xs font-semibold text-white transition shadow-xs cursor-pointer"
                    >
                        Back to Assessments
                    </button>
                </div>
            </div>
        );
    }

    // Welcome / Pre-Interview Briefing Stage
    if (!interviewStarted) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#16171d] px-4 py-8 text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden">
                <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 p-6 sm:p-10 shadow-sm space-y-8 text-left">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            AI Interview Assessment Studio
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {selectedAssessment.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                            Welcome, <span className="font-semibold text-slate-800 dark:text-zinc-200">{candidateName}</span>. Your mock interview session is ready.
                        </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/50 text-center">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block uppercase tracking-wider">Target Role</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 block truncate">{selectedAssessment.targetRole}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/50 text-center">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block uppercase tracking-wider">Difficulty</span>
                            <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 mt-1 block capitalize">{selectedAssessment.difficulty}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/50 text-center">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block uppercase tracking-wider">Questions</span>
                            <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">{questions.length} Rounds</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/50 text-center">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block uppercase tracking-wider">Assigned By</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mt-1 block truncate">{mentorName}</span>
                        </div>
                    </div>

                    {/* Interview System Checklist */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-4">
                        <h2 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pre-Flight Interview Setup & Guidelines
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-zinc-300">
                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                                <span><strong>Live Video & Audio:</strong> Camera & mic stream recorded to Cloudinary for playback.</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                                <span><strong>Voice Guidance:</strong> AI reads each interview question aloud clearly.</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                                <span><strong>Auto Speech-to-Text:</strong> Real-time transcription captures your verbal answers.</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                                <span><strong>AI Assessment Report:</strong> Scoring and recording playback generated upon finish.</span>
                            </div>
                        </div>
                    </div>

                    {mediaError && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{mediaError}</span>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        type="button"
                        onClick={handleStartInterview}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                        <span>Start Live Assessment</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    // Processing & Submitting screen
    if (isFinishing || submitLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#16171d] px-4 text-slate-900 dark:text-white transition-colors duration-300">
                <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 p-8 sm:p-10 text-center shadow-sm space-y-6">
                    <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-950"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                        <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {submitLoading
                                ? "Submitting Interview Assessment..."
                                : "Processing Interview Recording..."}
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                            Uploading candidate video recording and compiling question responses. Please do not close this window.
                        </p>
                    </div>

                    {submitError && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400 space-y-3">
                            <p>{submitError}</p>
                            <button
                                type="button"
                                onClick={() => submitInterview(recordedVideoBlobRef.current)}
                                className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition"
                            >
                                Retry Submission
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!cameraStarted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#16171d] px-4 text-slate-900 dark:text-white transition-colors duration-300">
                <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 p-8 text-center shadow-sm space-y-5">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Camera Access Required</h2>
                        <p className="text-xs text-slate-600 dark:text-zinc-400">
                            Please grant camera and microphone permissions in your browser to proceed with the assessment.
                        </p>
                    </div>

                    {mediaError && (
                        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400">
                            {mediaError}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={startCamera}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition"
                    >
                        Enable Camera & Microphone
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion && introductionCompleted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#16171d] text-slate-900 dark:text-white">
                <p className="text-slate-500 dark:text-zinc-400 text-sm">No questions available for this assessment.</p>
            </div>
        );
    }

    const currentTranscript =
        (currentQuestion ? transcriptsByQuestion[String(currentQuestion._id)] : "") || "";
    const isCurrentAnswerEmpty = !currentTranscript.trim();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#16171d] px-4 sm:px-6 py-6 text-slate-900 dark:text-white flex flex-col justify-between transition-colors duration-300">
            <div className="mx-auto w-full max-w-6xl space-y-6">
                {/* Top Interactive Studio Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 shadow-xs">
                    <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                {selectedAssessment.targetRole}
                            </span>
                            <span className="text-slate-400 dark:text-slate-600">•</span>
                            <span className="text-xs text-slate-500 dark:text-zinc-400 capitalize">
                                {selectedAssessment.difficulty} Difficulty
                            </span>
                        </div>
                        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                            {selectedAssessment.title}
                        </h1>
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Recording status */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-semibold">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span>REC {formatTime(recordingTime)}</span>
                        </div>

                        {/* Listening Sound Wave indicator */}
                        {introductionCompleted && isListening && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                                <div className="flex items-center gap-0.5 h-3">
                                    <span className="w-0.5 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                                    <span className="w-0.5 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                                    <span className="w-0.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                                </div>
                                <span>Listening to answer...</span>
                            </div>
                        )}

                        {/* AI speaking pill */}
                        {((introductionCompleted && isSpeakingQuestion) || isSpeakingIntroduction) && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                <span>AI Speaking</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Studio Grid */}
                <div className="grid gap-6 lg:grid-cols-12 items-start">
                    {/* Left Column: Persistent Camera Stream */}
                    <div className="lg:col-span-4 space-y-3">
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-[#E2E8F0] dark:border-zinc-800 shadow-xs">
                            <video
                                ref={attachVideoStream}
                                autoPlay
                                muted
                                playsInline
                                onLoadedMetadata={(e) => {
                                    e.currentTarget.play().catch(() => {});
                                }}
                                className="absolute inset-0 h-full w-full object-cover -scale-x-100"
                            />

                            {/* Camera overlay pills */}
                            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                <span>LIVE</span>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-[11px] text-slate-300 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                <span className="truncate">{candidateName}</span>
                                <span className="text-emerald-400 font-semibold">HD</span>
                            </div>
                        </div>

                        {/* Question Progress bar */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 shadow-xs space-y-2 text-left">
                            <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                                <span className="font-medium">Interview Progress</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {introductionCompleted
                                        ? `${currentQuestionIndex + 1} of ${questions.length}`
                                        : "Introduction"}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                                    style={{
                                        width: introductionCompleted
                                            ? `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                                            : "5%"
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Interviewer Stage & Question Studio */}
                    <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 border-t-4 border-t-indigo-500 p-6 sm:p-8 shadow-xs flex flex-col justify-between min-h-[480px] text-left">
                        {!introductionCompleted ? (
                            /* AI Introduction Stage */
                            <div className="flex flex-col items-center justify-center my-auto py-12 text-center space-y-6">
                                <div className="relative w-22 h-22 flex items-center justify-center">
                                    <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping"></div>
                                    <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-3xl shadow-sm text-white">
                                        🤖
                                    </div>
                                </div>

                                <div className="space-y-2 max-w-md">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                        CareerGuru AI Interviewer
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                                        {isSpeakingIntroduction
                                            ? "Please listen carefully as the AI introduces the interview format."
                                            : "Initializing your interview questions..."}
                                    </p>
                                </div>

                                {isSpeakingIntroduction && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.15s]"></span>
                                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.3s]"></span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Active Question Studio */
                            <div className="space-y-6 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                    {/* Question Header */}
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-bold text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs">
                                            Question {currentQuestionIndex + 1} of {questions.length}
                                        </div>
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                                            {currentQuestion?.question}
                                        </h2>
                                    </div>

                                    {/* Real-time Voice Answer Capture Box */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                                            <span className="font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                                                </svg>
                                                Live Answer Transcript
                                            </span>

                                            {/* Mic Toggle & Status Button */}
                                            <div className="flex items-center gap-2">
                                                {isListening ? (
                                                    <button
                                                        type="button"
                                                        onClick={handleToggleListening}
                                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition cursor-pointer"
                                                        title="Click to pause microphone"
                                                    >
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        <span>Mic Active (Click to Pause)</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleToggleListening}
                                                        disabled={isSpeakingQuestion}
                                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-950/60 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                        title="Click to resume microphone"
                                                    >
                                                        <svg className="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                                                        </svg>
                                                        <span>Mic Paused (Click to Speak)</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Editable Transcript Textarea */}
                                        <div className="relative rounded-2xl bg-slate-50 dark:bg-zinc-950/70 border border-[#E2E8F0] dark:border-zinc-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                            <textarea
                                                value={currentTranscript}
                                                onChange={(e) => handleTranscriptChange(e.target.value)}
                                                placeholder={
                                                    isSpeakingQuestion
                                                        ? "Please listen. The AI interviewer is speaking..."
                                                        : isListening
                                                        ? "Speak clearly into your microphone... Spoken words will appear here in real time. (You can also type or edit anytime)"
                                                        : "Speak or type your answer here..."
                                                }
                                                rows={7}
                                                className="w-full bg-transparent p-4 sm:p-5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 leading-relaxed focus:outline-hidden resize-none"
                                            />

                                            {/* Micro status footer */}
                                            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200/80 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-100/60 dark:bg-zinc-900/60 rounded-b-2xl">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5 text-indigo-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Spoken words auto-transcribe. Click to edit or add keywords anytime.
                                                </span>
                                                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                                                    {currentTranscript.trim() ? `${currentTranscript.trim().split(/\s+/).length} words` : "0 words"}
                                                </span>
                                            </div>
                                        </div>

                                        {speechError && (
                                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400 flex items-center justify-between">
                                                <span>{speechError}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSpeechError("")}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 font-bold"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Studio Controls: Next Question or Finish Interview */}
                                <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                                        {isCurrentAnswerEmpty
                                            ? "Speak or type your answer to proceed"
                                            : "Answer captured ✓"}
                                    </span>

                                    {currentQuestionIndex + 1 < questions.length ? (
                                        <button
                                            type="button"
                                            onClick={handleNextQuestion}
                                            disabled={isCurrentAnswerEmpty || isSpeakingQuestion}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <span>Next Question</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleFinishInterview}
                                            disabled={isCurrentAnswerEmpty || isSpeakingQuestion}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <span>Finish & Submit Interview</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Interview;
