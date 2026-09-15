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
                console.log("Submitted responses successfully. Redirecting...");
                navigate("/user/assessment");
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
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-lg font-medium text-gray-700">
                    Loading assessment...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="rounded-lg bg-white p-8 shadow-md">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!selectedAssessment) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-700">Assessment not found.</p>
            </div>
        );
    }

    if (!interviewStarted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">
                        {selectedAssessment.title}
                    </h1>

                    <p className="mb-6 text-gray-600">
                        Welcome, {candidateName}.
                    </p>

                    <div className="mb-6 rounded-lg bg-gray-50 p-5">
                        <div className="mb-3">
                            <span className="font-semibold text-gray-800">
                                Target Role:
                            </span>{" "}
                            {selectedAssessment.targetRole}
                        </div>

                        <div className="mb-3">
                            <span className="font-semibold text-gray-800">
                                Difficulty:
                            </span>{" "}
                            {selectedAssessment.difficulty}
                        </div>

                        <div>
                            <span className="font-semibold text-gray-800">
                                Questions:
                            </span>{" "}
                            {questions.length}
                        </div>
                    </div>

                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
                        <h2 className="mb-2 text-lg font-semibold text-blue-900">
                            Before you begin
                        </h2>

                        <ul className="space-y-2 text-sm text-blue-800">
                            <li>• Your camera and microphone will be used.</li>
                            <li>• The entire interview will be recorded.</li>
                            <li>• Each question will be read aloud.</li>
                            <li>• Speech recognition will automatically capture your answer.</li>
                            <li>• You can review the recorded video before submitting.</li>
                        </ul>
                    </div>

                    {mediaError && (
                        <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                            {mediaError}
                        </div>
                    )}

                    <button
                        onClick={handleStartInterview}
                        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Start Interview
                    </button>
                </div>
            </div>
        );
    }

    // Processing & Submitting screen (shows during finishing and uploading)
    if (isFinishing || submitLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <svg
                            className="h-8 w-8 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    </div>

                    <h2 className="mb-2 text-xl font-bold text-gray-900">
                        {submitLoading
                            ? "Submitting Interview..."
                            : "Processing Interview Video..."}
                    </h2>

                    <p className="text-sm text-gray-600">
                        Please wait while your answers and video recording are being uploaded and saved.
                    </p>

                    {submitError && (
                        <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                            <p className="mb-3">{submitError}</p>
                            <button
                                type="button"
                                onClick={() => submitInterview(recordedVideoBlobRef.current)}
                                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
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
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
                    <h1 className="mb-4 text-2xl font-bold text-gray-900">
                        Camera and Microphone Required
                    </h1>

                    <p className="mb-6 text-gray-600">
                        Please enable your camera and microphone to continue.
                    </p>

                    {mediaError && (
                        <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                            {mediaError}
                        </div>
                    )}

                    <button
                        onClick={startCamera}
                        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                        Enable Camera
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion && introductionCompleted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-700">No questions available.</p>
            </div>
        );
    }

    const currentTranscript =
        (currentQuestion ? transcriptsByQuestion[String(currentQuestion._id)] : "") || "";
    const isCurrentAnswerEmpty = !currentTranscript.trim();

    // Unified Interview Screen (Video persistent in top left, never unmounts)
    return (
        <div className="min-h-screen bg-gray-100 px-4 py-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-4 shadow md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {selectedAssessment.title}
                        </h1>

                        <p className="text-sm text-gray-500">
                            {!introductionCompleted
                                ? "Preparing your interview..."
                                : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                            <span className="h-3 w-3 animate-pulse rounded-full bg-red-600"></span>
                            Recording {formatTime(recordingTime)}
                        </div>

                        {introductionCompleted && isListening && (
                            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-green-600"></span>
                                Listening
                            </div>
                        )}

                        {introductionCompleted && isSpeakingQuestion && (
                            <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                AI Speaking
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Persistent Video displayed small in top left - never unmounts */}
                    <div className="lg:col-span-4">
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
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
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                                LIVE CAMERA
                            </div>
                        </div>
                    </div>

                    {/* Right side: AI Intro or Active Question */}
                    <div className="lg:col-span-8 flex flex-col rounded-2xl bg-white p-6 shadow-lg">
                        {!introductionCompleted ? (
                            <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                                    <span className="text-3xl">🤖</span>
                                </div>

                                <h2 className="mb-3 text-2xl font-bold text-gray-900">
                                    CareerGuru AI
                                </h2>

                                <p className="mb-6 text-gray-600">
                                    {isSpeakingIntroduction
                                        ? "AI is speaking introduction..."
                                        : "Preparing your interview..."}
                                </p>

                                {isSpeakingIntroduction && (
                                    <div className="flex justify-center gap-1">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600"></span>
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:0.15s]"></span>
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:0.3s]"></span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <p className="mb-2 text-sm font-medium text-gray-500">
                                        Question {currentQuestionIndex + 1} of{" "}
                                        {questions.length}
                                    </p>

                                    <h2 className="text-2xl font-bold leading-relaxed text-gray-900">
                                        {currentQuestion?.question}
                                    </h2>
                                </div>

                                <div className="flex-1">
                                    <div className="mb-2 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800">
                                            Your Answer
                                        </h3>

                                        {isListening && (
                                            <span className="text-sm font-medium text-green-600">
                                                Speech captured automatically
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-h-[220px] rounded-xl border border-gray-200 bg-gray-50 p-5">
                                        {currentTranscript ? (
                                            <p className="leading-relaxed text-gray-700 whitespace-pre-wrap">
                                                {currentTranscript}
                                            </p>
                                        ) : (
                                            <p className="text-gray-400">
                                                {isSpeakingQuestion
                                                    ? "Please wait. The question is being read..."
                                                    : "Start speaking. Your answer will be captured automatically."}
                                            </p>
                                        )}
                                    </div>

                                    {speechError && (
                                        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                                            {speechError}
                                        </div>
                                    )}
                                </div>

                                {/* Bottom action button (Previous removed; Next or Finish Interview) */}
                                <div className="mt-6 flex items-center justify-end border-t border-gray-200 pt-5">
                                    {currentQuestionIndex + 1 < questions.length ? (
                                        <button
                                            type="button"
                                            onClick={handleNextQuestion}
                                            disabled={isCurrentAnswerEmpty || isSpeakingQuestion}
                                            className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Next Question
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleFinishInterview}
                                            disabled={isCurrentAnswerEmpty || isSpeakingQuestion}
                                            className="rounded-lg bg-green-600 px-6 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Finish Interview
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Interview;
