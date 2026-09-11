import { useEffect, useRef, useState } from "react";
import socket from "../../../services/socket.jsx";

export default function VoiceCall({
    conversationId,
    targetUserId,
    isIncoming,
    callerId,
    onClose
}) {
    const [callStatus, setCallStatus] = useState(
        isIncoming ? "incoming" : "calling"
    );
    const [isMuted, setIsMuted] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callError, setCallError] = useState("");

    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const iceCandidateQueueRef = useRef([]);

    const remoteUserId = isIncoming ? callerId : targetUserId;

    function createPeerConnection() {
        const peerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302"
                }
            ]
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    targetUserId: remoteUserId,
                    conversationId,
                    candidate: event.candidate
                });
            }
        };

        peerConnection.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
                remoteAudioRef.current.volume = 1;
            }
        };

        peerConnection.onconnectionstatechange = () => {
            console.log(
                "WebRTC connection:",
                peerConnection.connectionState
            );

            if (peerConnection.connectionState === "connected") {
                setCallStatus("connected");
                setCallError("");
            }

            if (peerConnection.connectionState === "failed") {
                setCallError(
                    "Unable to establish the voice connection."
                );
                setCallStatus("ended");
            }

            if (
                peerConnection.connectionState === "disconnected" ||
                peerConnection.connectionState === "closed"
            ) {
                setCallStatus("ended");
            }
        };

        peerConnectionRef.current = peerConnection;

        return peerConnection;
    }

    async function getMicrophone() {
        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    },
                    video: false
                });

            localStreamRef.current = stream;

            return stream;
        } catch (error) {
            console.error(
                "Microphone permission error:",
                error
            );

            setCallError(
                "Microphone permission is required to make a voice call."
            );

            setCallStatus("ended");

            return null;
        }
    }

    async function processIceCandidateQueue() {
        const peerConnection =
            peerConnectionRef.current;

        if (!peerConnection) {
            return;
        }

        if (!peerConnection.remoteDescription) {
            return;
        }

        const candidates =
            iceCandidateQueueRef.current;

        iceCandidateQueueRef.current = [];

        for (const candidate of candidates) {
            try {
                await peerConnection.addIceCandidate(
                    new RTCIceCandidate(candidate)
                );
            } catch (error) {
                console.error(
                    "Queued ICE candidate error:",
                    error
                );
            }
        }
    }

    async function startCall() {
        try {
            setCallStatus("calling");

            const stream =
                await getMicrophone();

            if (!stream) {
                return;
            }

            const peerConnection =
                createPeerConnection();

            stream.getTracks().forEach((track) => {
                peerConnection.addTrack(
                    track,
                    stream
                );
            });

            socket.emit(
                "call-user",
                {
                    conversationId,
                    targetUserId
                },
                (response) => {
                    if (!response?.success) {
                        console.error(
                            "Call failed:",
                            response?.message
                        );

                        setCallError(
                            response?.message ||
                                "Unable to start the call."
                        );

                        endCall();
                    }
                }
            );
        } catch (error) {
            console.error(
                "Start call error:",
                error
            );

            setCallError(
                "Unable to start the voice call."
            );

            setCallStatus("ended");
        }
    }

    async function acceptCall() {
        try {
            setCallStatus("connecting");

            const stream =
                await getMicrophone();

            if (!stream) {
                return;
            }

            const peerConnection =
                createPeerConnection();

            stream.getTracks().forEach((track) => {
                peerConnection.addTrack(
                    track,
                    stream
                );
            });

            socket.emit(
                "call-accepted",
                {
                    callerId,
                    conversationId
                }
            );
        } catch (error) {
            console.error(
                "Accept call error:",
                error
            );

            setCallError(
                "Unable to accept the voice call."
            );

            setCallStatus("ended");
        }
    }

    function rejectCall() {
        socket.emit(
            "call-rejected",
            {
                callerId,
                conversationId
            }
        );

        cleanupCall();

        setCallStatus("ended");

        if (onClose) {
            onClose();
        }
    }

   function endCall() {
        if (remoteUserId) {
            socket.emit(
                "call-ended",
                {
                    targetUserId: remoteUserId,
                    conversationId
                }
            );
        }

        cleanupCall();
        setCallStatus("ended");

        setTimeout(() => {
            if (onClose) {
                onClose();
            }
        }, 1500);
    }

    function cleanupCall() {
        if (localStreamRef.current) {
            localStreamRef.current
                .getTracks()
                .forEach((track) => {
                    track.stop();
                });
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.close();
        }

        if (remoteAudioRef.current) {
            remoteAudioRef.current.pause();
            remoteAudioRef.current.srcObject = null;
        }

        peerConnectionRef.current = null;
        localStreamRef.current = null;
        iceCandidateQueueRef.current = [];

        setIsMuted(false);
    }

    function toggleMute() {
        if (!localStreamRef.current) {
            return;
        }

        const audioTrack =
            localStreamRef.current.getAudioTracks()[0];

        if (!audioTrack) {
            return;
        }

        audioTrack.enabled =
            !audioTrack.enabled;

        setIsMuted(!audioTrack.enabled);
    }

    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes
            .toString()
            .padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    }

    useEffect(() => {
        if (callStatus !== "connected") {
            return;
        }

        const timer = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [callStatus]);

    useEffect(() => {
        async function handleCallAccepted(data) {
            if (
                data.conversationId?.toString() !==
                conversationId?.toString()
            ) {
                return;
            }

            try {
                setCallStatus("connecting");

                const peerConnection =
                    peerConnectionRef.current;

                if (!peerConnection) {
                    return;
                }

                const offer =
                    await peerConnection.createOffer();

                await peerConnection.setLocalDescription(
                    offer
                );

                socket.emit(
                    "webrtc-offer",
                    {
                        targetUserId,
                        conversationId,
                        offer
                    }
                );
            } catch (error) {
                console.error(
                    "Offer creation error:",
                    error
                );

                setCallError(
                    "Unable to create the voice connection."
                );

                setCallStatus("ended");
            }
        }

        function handleCallRejected(data) {
            if (
                data.conversationId?.toString() !==
                conversationId?.toString()
            ) {
                return;
            }

            cleanupCall();

            setCallStatus("rejected");
        }

        function handleCallEnded(data) {
            if (
                data.conversationId?.toString() !==
                conversationId?.toString()
            ) {
                return;
            }

            cleanupCall();
            setCallStatus("ended");

            setTimeout(() => {
                if (onClose) {
                    onClose();
                }
            }, 1500);
        }

        async function handleWebRTCOffer(data) {
            if (
                data.conversationId?.toString() !==
                conversationId?.toString()
            ) {
                return;
            }

            try {
                const peerConnection =
                    peerConnectionRef.current;

                if (!peerConnection) {
                    return;
                }

                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(
                        data.offer
                    )
                );

                await processIceCandidateQueue();

                const answer =
                    await peerConnection.createAnswer();

                await peerConnection.setLocalDescription(
                    answer
                );

                socket.emit(
                    "webrtc-answer",
                    {
                        targetUserId:
                            data.callerId,
                        conversationId,
                        answer
                    }
                );
            } catch (error) {
                console.error(
                    "WebRTC offer error:",
                    error
                );

                setCallError(
                    "Unable to establish the voice connection."
                );

                setCallStatus("ended");
            }
        }

        async function handleWebRTCAnswer(data) {
            if (
                data.conversationId?.toString() !==
                conversationId?.toString()
            ) {
                return;
            }

            try {
                const peerConnection =
                    peerConnectionRef.current;

                if (!peerConnection) {
                    return;
                }

                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(
                        data.answer
                    )
                );

                await processIceCandidateQueue();
            } catch (error) {
                console.error(
                    "WebRTC answer error:",
                    error
                );

                setCallError(
                    "Unable to complete the voice connection."
                );

                setCallStatus("ended");
            }
        }

        async function handleIceCandidate(data) {
            if (
                data.conversationId?.toString() !==
                conversationId?.toString()
            ) {
                return;
            }

            try {
                const peerConnection =
                    peerConnectionRef.current;

                if (!peerConnection) {
                    return;
                }

                const candidate =
                    new RTCIceCandidate(
                        data.candidate
                    );

                if (
                    !peerConnection.remoteDescription
                ) {
                    iceCandidateQueueRef.current.push(
                        data.candidate
                    );

                    console.log(
                        "ICE candidate queued"
                    );

                    return;
                }

                await peerConnection.addIceCandidate(
                    candidate
                );

                console.log(
                    "ICE candidate added"
                );
            } catch (error) {
                console.error(
                    "ICE candidate error:",
                    error
                );
            }
        }

        socket.on(
            "call-accepted",
            handleCallAccepted
        );

        socket.on(
            "call-rejected",
            handleCallRejected
        );

        socket.on(
            "call-ended",
            handleCallEnded
        );

        socket.on(
            "webrtc-offer",
            handleWebRTCOffer
        );

        socket.on(
            "webrtc-answer",
            handleWebRTCAnswer
        );

        socket.on(
            "ice-candidate",
            handleIceCandidate
        );

        return () => {
            socket.off(
                "call-accepted",
                handleCallAccepted
            );

            socket.off(
                "call-rejected",
                handleCallRejected
            );

            socket.off(
                "call-ended",
                handleCallEnded
            );

            socket.off(
                "webrtc-offer",
                handleWebRTCOffer
            );

            socket.off(
                "webrtc-answer",
                handleWebRTCAnswer
            );

            socket.off(
                "ice-candidate",
                handleIceCandidate
            );
        };
    }, [
        conversationId,
        targetUserId,
        callerId
    ]);

    useEffect(() => {
        if (!isIncoming) {
            startCall();
        }
    }, []);

    useEffect(() => {
        return () => {
            cleanupCall();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-[90%] max-w-sm rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-xl text-center">

                <audio
                    ref={remoteAudioRef}
                    autoPlay
                    playsInline
                    controls={false}
                />

                {callStatus === "calling" && (
                    <>
                        <h3 className="text-xl font-bold">
                            Calling...
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Waiting for the other person to accept
                        </p>

                        <button
                            type="button"
                            onClick={endCall}
                            className="mt-6 px-5 py-2 rounded-xl bg-red-600 text-white"
                        >
                            Cancel Call
                        </button>
                    </>
                )}

                {callStatus === "incoming" && (
                    <>
                        <h3 className="text-xl font-bold">
                            Incoming Voice Call
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Someone is calling you
                        </p>

                        <div className="flex justify-center gap-3 mt-6">

                            <button
                                type="button"
                                onClick={rejectCall}
                                className="px-5 py-2 rounded-xl bg-red-600 text-white"
                            >
                                Reject
                            </button>

                            <button
                                type="button"
                                onClick={acceptCall}
                                className="px-5 py-2 rounded-xl bg-green-600 text-white"
                            >
                                Accept
                            </button>

                        </div>
                    </>
                )}

                {callStatus === "connecting" && (
                    <>
                        <h3 className="text-xl font-bold">
                            Connecting...
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Establishing voice connection
                        </p>

                        <button
                            type="button"
                            onClick={endCall}
                            className="mt-6 px-5 py-2 rounded-xl bg-red-600 text-white"
                        >
                            End Call
                        </button>
                    </>
                )}

                {callStatus === "connected" && (
                    <>
                        <h3 className="text-xl font-bold">
                            Voice Call
                        </h3>

                        <p className="mt-2 text-sm text-green-600">
                            Connected
                        </p>

                        <p className="mt-2 text-lg font-semibold">
                            {formatDuration(callDuration)}
                        </p>

                        <div className="flex justify-center gap-3 mt-6">

                            <button
                                type="button"
                                onClick={toggleMute}
                                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-zinc-700"
                            >
                                {isMuted ? "Unmute" : "Mute"}
                            </button>

                            <button
                                type="button"
                                onClick={endCall}
                                className="px-5 py-2 rounded-xl bg-red-600 text-white"
                            >
                                End Call
                            </button>

                        </div>
                    </>
                )}

                {callError && (
                    <p className="mt-4 text-sm text-red-600">
                        {callError}
                    </p>
                )}

                {callStatus === "rejected" && (
                    <>
                        <h3 className="text-xl font-bold">
                            Call Rejected
                        </h3>

                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-6 px-5 py-2 rounded-xl bg-slate-200"
                        >
                            Close
                        </button>
                    </>
                )}

                {callStatus === "ended" && (
                    <>
                        <h3 className="text-xl font-bold">
                            Call Ended
                        </h3>

                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-6 px-5 py-2 rounded-xl bg-slate-200"
                        >
                            Close
                        </button>
                    </>
                )}

            </div>

        </div>
    );
}