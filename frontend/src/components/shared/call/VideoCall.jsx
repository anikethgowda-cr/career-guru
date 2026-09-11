import { useEffect, useRef, useState } from "react";
import socket from "../../../services/socket.jsx";

export default function VideoCall({
    conversationId,
    targetUserId,
    isIncoming,
    callerId,
    callerName,
    recipientName,
    onAccepted,
    onClose
}) {
    const [callStatus, setCallStatus] = useState(
        isIncoming ? "incoming" : "calling"
    );
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [interruptedMessage, setInterruptedMessage] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSelfViewHidden, setIsSelfViewHidden] = useState(false);

    const callContainerRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const screenTrackRef = useRef(null);
    const cameraTrackRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const iceCandidateQueueRef = useRef([]);
    const hasCleanedUpRef = useRef(false);

    const remoteUserId = isIncoming ? callerId : targetUserId;

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            callContainerRef.current?.requestFullscreen?.().catch((err) => {
                console.warn("Fullscreen request failed:", err);
            });
        } else {
            document.exitFullscreen?.().catch((err) => {
                console.warn("Exit fullscreen failed:", err);
            });
        }
    }

    function getIceServers() {
        const servers = [
            {
                urls: "stun:stun.l.google.com:19302"
            }
        ];

        const turnUrl = import.meta.env.VITE_TURN_URL;
        const turnUsername = import.meta.env.VITE_TURN_USERNAME;
        const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

        if (turnUrl) {
            servers.push({
                urls: turnUrl,
                username: turnUsername || undefined,
                credential: turnCredential || undefined
            });
        }

        return servers;
    }

    function createPeerConnection() {
        const peerConnection = new RTCPeerConnection({
            iceServers: getIceServers()
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && remoteUserId) {
                socket.emit("ice-candidate", {
                    targetUserId: remoteUserId,
                    conversationId,
                    candidate: event.candidate
                });
            }
        };

        peerConnection.ontrack = (event) => {
            console.log("Remote track received:", event.track.kind, event.track.id, event.streams);

            const inboundStream =
                event.streams && event.streams[0] ? event.streams[0] : null;

            if (inboundStream) {
                remoteStreamRef.current = inboundStream;
            } else {
                if (!remoteStreamRef.current) {
                    remoteStreamRef.current = new MediaStream();
                }
                const existingTrack = remoteStreamRef.current
                    .getTracks()
                    .find((t) => t.id === event.track.id);

                if (!existingTrack) {
                    remoteStreamRef.current.addTrack(event.track);
                }
            }

            if (remoteVideoRef.current) {
                if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
                    remoteVideoRef.current.srcObject = remoteStreamRef.current;
                }
                remoteVideoRef.current.play?.().catch((err) => {
                    console.warn("Remote video auto-play prevented:", err);
                });
            }
        };

        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState;
            console.log("WebRTC connectionState:", state);

            if (state === "connected") {
                setCallStatus("connected");
                setInterruptedMessage("");
                setErrorMessage("");
            } else if (state === "disconnected") {
                setInterruptedMessage("Connection temporarily interrupted. Reconnecting...");
            } else if (state === "failed") {
                setInterruptedMessage("");
                setErrorMessage("WebRTC connection failed. Please check network/firewall.");
                setCallStatus("failed");
            } else if (state === "closed") {
                setCallStatus("ended");
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            const state = peerConnection.iceConnectionState;
            console.log("WebRTC iceConnectionState:", state);

            if (state === "connected" || state === "completed") {
                setCallStatus("connected");
                setInterruptedMessage("");
            } else if (state === "disconnected") {
                setInterruptedMessage("Connection temporarily interrupted. Reconnecting...");
            } else if (state === "failed") {
                setInterruptedMessage("");
                setErrorMessage("Connection failed. Check network or firewall.");
                setCallStatus("failed");
            }
        };

        peerConnectionRef.current = peerConnection;
        return peerConnection;
    }

    async function getMedia() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30, max: 30 }
                }
            });

            console.log("Local media stream obtained:", stream);
            localStreamRef.current = stream;

            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                cameraTrackRef.current = videoTrack;
                videoTrack.onmute = () => {
                    console.warn("Local video track muted (camera hardware contention/lock)");
                };
                videoTrack.onunmute = () => {
                    console.log("Local video track unmuted");
                };
            }

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.play?.().catch((err) => {
                    console.warn("Local video play prevented:", err);
                });
            }

            return stream;
        } catch (error) {
            console.error("Camera/microphone error:", error.name, error.message);
            let userMsg = "Failed to access camera and microphone.";

            if (
                error.name === "NotAllowedError" ||
                error.name === "PermissionDeniedError"
            ) {
                userMsg = "Camera and microphone permissions were denied. Please allow permissions in your browser.";
            } else if (
                error.name === "NotFoundError" ||
                error.name === "DevicesNotFoundError"
            ) {
                userMsg = "No camera or microphone found on this device.";
            } else if (
                error.name === "NotReadableError" ||
                error.name === "TrackStartError"
            ) {
                userMsg = "Camera is already in use by another application or browser window.";
            }

            setErrorMessage(userMsg);
            setCallStatus("failed");
            return null;
        }
    }

    async function processIceCandidateQueue() {
        const peerConnection = peerConnectionRef.current;
        if (!peerConnection || !peerConnection.remoteDescription) {
            return;
        }

        const candidates = [...iceCandidateQueueRef.current];
        iceCandidateQueueRef.current = [];

        for (const candidate of candidates) {
            try {
                if (candidate) {
                    await peerConnection.addIceCandidate(
                        new RTCIceCandidate(candidate)
                    );
                }
            } catch (error) {
                console.error("Queued ICE candidate error:", error);
            }
        }
    }

    async function startCall() {
        try {
            setCallStatus("calling");
            const stream = await getMedia();
            if (!stream) {
                return;
            }

            const peerConnection = createPeerConnection();

            stream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, stream);
            });

            socket.emit(
                "call-user",
                {
                    conversationId,
                    targetUserId,
                    callType: "video"
                },
                (response) => {
                    if (!response?.success) {
                        console.error("Call failed:", response?.message);
                        setErrorMessage(
                            response?.message || "Unable to reach user."
                        );
                        cleanupCall();
                        setCallStatus("failed");
                    }
                }
            );
        } catch (error) {
            console.error("Start video call error:", error);
            setErrorMessage("Failed to start the video call.");
            setCallStatus("failed");
        }
    }

    async function acceptCall() {
        if (onAccepted) onAccepted();
        try {
            setCallStatus("connecting");
            const stream = await getMedia();
            if (!stream) {
                return;
            }

            const peerConnection = createPeerConnection();

            stream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, stream);
            });

            // Process any early candidates that arrived before peerConnection was created
            await processIceCandidateQueue();

            socket.emit("call-accepted", {
                callerId,
                conversationId
            });
        } catch (error) {
            console.error("Accept video call error:", error);
            setErrorMessage("Failed to accept video call.");
            setCallStatus("failed");
        }
    }

    function rejectCall() {
        if (onAccepted) onAccepted();
        socket.emit("call-rejected", {
            callerId,
            conversationId
        });

        cleanupCall();
        if (onClose) onClose();
    }

    function endCall() {
        if (remoteUserId) {
            socket.emit("call-ended", {
                targetUserId: remoteUserId,
                conversationId
            });
        }

        cleanupCall();
        setCallStatus("ended");

        setTimeout(() => {
            if (onClose) onClose();
        }, 1500);
    }

    function cleanupCall() {
        if (hasCleanedUpRef.current) return;
        hasCleanedUpRef.current = true;

        if (screenTrackRef.current) {
            screenTrackRef.current.stop();
            screenTrackRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }

        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach((track) => track.stop());
            remoteStreamRef.current = null;
        }

        cameraTrackRef.current = null;

        if (peerConnectionRef.current) {
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.onconnectionstatechange = null;
            peerConnectionRef.current.oniceconnectionstatechange = null;
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        iceCandidateQueueRef.current = [];
        setIsMuted(false);
        setIsCameraOff(false);
        setIsScreenSharing(false);
        setIsRemoteScreenSharing(false);
        setInterruptedMessage("");
    }

    function toggleMute() {
        if (!localStreamRef.current) return;

        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (!audioTrack) return;

        const nextState = !audioTrack.enabled;
        audioTrack.enabled = nextState;
        setIsMuted(!nextState);
    }

    function toggleCamera() {
        if (!localStreamRef.current) return;

        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (!videoTrack) return;

        const nextState = !videoTrack.enabled;
        videoTrack.enabled = nextState;
        setIsCameraOff(!nextState);
    }

    async function startScreenShare() {
        if (!navigator.mediaDevices?.getDisplayMedia) {
            setErrorMessage("Screen sharing is not supported in this browser.");
            return;
        }

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });

            const screenTrack = screenStream.getVideoTracks()[0];
            if (!screenTrack) return;

            screenTrackRef.current = screenTrack;

            const peerConnection = peerConnectionRef.current;
            if (peerConnection) {
                const senders = peerConnection.getSenders();
                const videoSender = senders.find(
                    (s) => s.track && s.track.kind === "video"
                );
                if (videoSender) {
                    await videoSender.replaceTrack(screenTrack);
                }
            }

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;
            }

            setIsScreenSharing(true);

            if (remoteUserId) {
                socket.emit("screen-share-status", {
                    conversationId,
                    targetUserId: remoteUserId,
                    isSharing: true
                });
            }

            screenTrack.onended = () => {
                stopScreenShare();
            };
        } catch (error) {
            console.warn("Screen share error:", error.name, error.message);
            if (error.name === "NotAllowedError") {
                console.log("User cancelled screen sharing picker.");
            } else {
                setErrorMessage("Screen sharing error: " + error.message);
            }
        }
    }

    async function stopScreenShare() {
        try {
            const peerConnection = peerConnectionRef.current;
            const originalCameraTrack = cameraTrackRef.current;

            if (peerConnection && originalCameraTrack) {
                const senders = peerConnection.getSenders();
                const videoSender = senders.find(
                    (s) => s.track && s.track.kind === "video"
                );
                if (videoSender) {
                    await videoSender.replaceTrack(originalCameraTrack);
                }
            }

            if (screenTrackRef.current) {
                screenTrackRef.current.stop();
                screenTrackRef.current = null;
            }

            if (localVideoRef.current && localStreamRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }

            setIsScreenSharing(false);

            if (remoteUserId) {
                socket.emit("screen-share-status", {
                    conversationId,
                    targetUserId: remoteUserId,
                    isSharing: false
                });
            }
        } catch (error) {
            console.error("Stop screen share error:", error);
        }
    }

    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    }

    useEffect(() => {
        if (callStatus !== "connected") return;

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
                data.conversationId?.toString() !== conversationId?.toString()
            ) {
                return;
            }

            try {
                setCallStatus("connecting");
                const peerConnection = peerConnectionRef.current;
                if (!peerConnection) return;

                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);

                socket.emit("webrtc-offer", {
                    targetUserId: remoteUserId,
                    conversationId,
                    offer
                });
            } catch (error) {
                console.error("Offer creation error:", error);
                setErrorMessage("Failed to establish video connection.");
                setCallStatus("failed");
            }
        }

        function handleCallRejected(data) {
            if (
                data.conversationId?.toString() !== conversationId?.toString()
            ) {
                return;
            }

            cleanupCall();
            setCallStatus("rejected");
        }

        function handleCallEnded(data) {
            if (
                data.conversationId?.toString() !== conversationId?.toString()
            ) {
                return;
            }

            cleanupCall();
            setCallStatus("ended");

            setTimeout(() => {
                if (onClose) onClose();
            }, 1500);
        }

        async function handleWebRTCOffer(data) {
            if (
                data.conversationId?.toString() !== conversationId?.toString()
            ) {
                return;
            }

            try {
                const peerConnection = peerConnectionRef.current;
                if (!peerConnection) return;

                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(data.offer)
                );

                await processIceCandidateQueue();

                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                socket.emit("webrtc-answer", {
                    targetUserId: data.callerId,
                    conversationId,
                    answer
                });
            } catch (error) {
                console.error("WebRTC offer error:", error);
                setErrorMessage("Failed to negotiate video call offer.");
                setCallStatus("failed");
            }
        }

        async function handleWebRTCAnswer(data) {
            if (
                data.conversationId?.toString() !== conversationId?.toString()
            ) {
                return;
            }

            try {
                const peerConnection = peerConnectionRef.current;
                if (!peerConnection) return;

                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(data.answer)
                );

                await processIceCandidateQueue();
            } catch (error) {
                console.error("WebRTC answer error:", error);
                setErrorMessage("Failed to negotiate video call answer.");
                setCallStatus("failed");
            }
        }

        async function handleIceCandidate(data) {
            if (
                data.conversationId?.toString() !== conversationId?.toString()
            ) {
                return;
            }

            try {
                const peerConnection = peerConnectionRef.current;

                if (!peerConnection || !peerConnection.remoteDescription) {
                    iceCandidateQueueRef.current.push(data.candidate);
                    return;
                }

                if (data.candidate) {
                    await peerConnection.addIceCandidate(
                        new RTCIceCandidate(data.candidate)
                    );
                }
            } catch (error) {
                console.error("ICE candidate error:", error);
            }
        }

        function handleScreenShareStatus(data) {
            if (
                data.conversationId?.toString() !== conversationId?.toString()
            ) {
                return;
            }

            setIsRemoteScreenSharing(!!data.isSharing);
        }

        function handleSocketDisconnect() {
            setInterruptedMessage("Signaling connection lost. Reconnecting...");
        }

        function handleSocketConnect() {
            setInterruptedMessage("");
            if (conversationId) {
                socket.emit("joinConversation", { conversationId }, () => { });
            }
        }

        socket.on("call-accepted", handleCallAccepted);
        socket.on("call-rejected", handleCallRejected);
        socket.on("call-ended", handleCallEnded);
        socket.on("webrtc-offer", handleWebRTCOffer);
        socket.on("webrtc-answer", handleWebRTCAnswer);
        socket.on("ice-candidate", handleIceCandidate);
        socket.on("screen-share-status", handleScreenShareStatus);
        socket.on("disconnect", handleSocketDisconnect);
        socket.on("connect", handleSocketConnect);

        return () => {
            socket.off("call-accepted", handleCallAccepted);
            socket.off("call-rejected", handleCallRejected);
            socket.off("call-ended", handleCallEnded);
            socket.off("webrtc-offer", handleWebRTCOffer);
            socket.off("webrtc-answer", handleWebRTCAnswer);
            socket.off("ice-candidate", handleIceCandidate);
            socket.off("screen-share-status", handleScreenShareStatus);
            socket.off("disconnect", handleSocketDisconnect);
            socket.off("connect", handleSocketConnect);
        };
    }, [conversationId, remoteUserId]);

    useEffect(() => {
        function handleFullscreenChange() {
            setIsFullscreen(!!document.fullscreenElement);
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

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

    useEffect(() => {
        if (!isSelfViewHidden && localVideoRef.current) {
            const activeStream =
                isScreenSharing && screenTrackRef.current
                    ? new MediaStream([screenTrackRef.current])
                    : localStreamRef.current;

            if (activeStream && localVideoRef.current.srcObject !== activeStream) {
                localVideoRef.current.srcObject = activeStream;
            }
            localVideoRef.current.play?.().catch((err) => {
                console.warn("Local video play on retrieve error:", err);
            });
        }
    }, [isSelfViewHidden, isScreenSharing]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs transition-all duration-300 ${
                isFullscreen ? "p-0" : "p-2 sm:p-4"
            }`}
        >
            <div
                ref={callContainerRef}
                className={`relative w-full transition-all duration-300 ${
                    isFullscreen
                        ? "h-full w-full rounded-none max-w-none border-0"
                        : "max-w-4xl h-[80vh] max-h-[850px] rounded-2xl border border-zinc-800"
                } bg-zinc-950 overflow-hidden shadow-2xl flex flex-col`}
            >
                {/* Main Remote Video */}
                <div className="relative flex-1 w-full h-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className={`w-full h-full ${isRemoteScreenSharing
                            ? "object-contain bg-black"
                            : "object-cover"
                            }`}
                    />

                    {/* Floating Local Video Preview (Compact, Sleek & Minimizable) */}
                    <div
                        className={`absolute top-4 right-4 z-20 w-24 h-16 sm:w-32 sm:h-22 md:w-36 md:h-26 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-zinc-900 backdrop-blur-md group transition-all ${
                            isSelfViewHidden ? "hidden pointer-events-none" : "block"
                        }`}
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {isCameraOff && !isScreenSharing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 text-zinc-400 text-[10px] font-medium">
                                Camera Off
                            </div>
                        )}
                        <span className="absolute bottom-1 left-1.5 text-[9px] text-white/80 bg-black/60 px-1 py-0.5 rounded leading-none">
                            {isScreenSharing ? "Screen" : "You"}
                        </span>
                        {/* Quick remove/minimize button */}
                        <button
                            type="button"
                            onClick={() => setIsSelfViewHidden(true)}
                            title="Hide self-view"
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center text-[10px] font-bold opacity-75 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Top Fullscreen Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        className={`absolute top-4 ${
                            !isSelfViewHidden
                                ? "right-30 sm:right-38 md:right-42"
                                : "right-4"
                        } z-20 flex items-center justify-center w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-all border border-white/10 backdrop-blur-md cursor-pointer`}
                    >
                        {isFullscreen ? (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 0l5-5m0 0l-5 0m5 0l0 5m-5 11l5 5m0 0l-5 0m5 0l0-5m-11 0l-5 5m0 0l5 0m-5 0l0-5"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                />
                            </svg>
                        )}
                    </button>

                    {/* Notification Overlay: Sharing Screen */}
                    {isScreenSharing && (
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/90 text-white text-xs sm:text-sm font-medium shadow-lg backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            You are sharing your screen
                        </div>
                    )}

                    {isRemoteScreenSharing && !isScreenSharing && (
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600/90 text-white text-xs sm:text-sm font-medium shadow-lg backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            {isIncoming ? "Caller" : "Peer"} is sharing their screen
                        </div>
                    )}

                    {/* Duration badge when connected */}
                    {callStatus === "connected" && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/60 text-white text-xs sm:text-sm font-mono tracking-wider border border-white/10 backdrop-blur-md">
                            {formatDuration(callDuration)}
                        </div>
                    )}

                    {/* Temporary Network Interruption Banner */}
                    {interruptedMessage && (
                        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-amber-500/90 text-white text-xs sm:text-sm font-medium shadow-xl backdrop-blur-md animate-pulse">
                            {interruptedMessage}
                        </div>
                    )}

                    {/* Calling State */}
                    {callStatus === "calling" && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md text-white px-4 text-center">
                            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-6"></div>
                            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                                Calling...
                            </h3>
                            <p className="mt-2 text-sm text-zinc-400">
                                {recipientName
                                    ? `Waiting for ${recipientName} to accept the video call`
                                    : "Waiting for the other person to accept the video call"}
                            </p>
                            <button
                                type="button"
                                onClick={endCall}
                                className="mt-8 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-medium transition-all shadow-lg shadow-red-600/30"
                            >
                                Cancel Call
                            </button>
                        </div>
                    )}

                    {/* Incoming Call State */}
                    {callStatus === "incoming" && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/85 backdrop-blur-md text-white px-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 mb-4 animate-bounce">
                                <svg
                                    className="w-8 h-8"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold">
                                Incoming Video Call
                            </h3>
                            <p className="mt-2 text-sm text-zinc-400">
                                {callerName
                                    ? `${callerName} wants to start a video session with you`
                                    : "Someone wants to start a video session with you"}
                            </p>
                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={rejectCall}
                                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-medium transition-all shadow-lg shadow-red-600/30"
                                >
                                    Reject
                                </button>
                                <button
                                    type="button"
                                    onClick={acceptCall}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium transition-all shadow-lg shadow-emerald-600/30 animate-pulse"
                                >
                                    Accept Call
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Connecting State */}
                    {callStatus === "connecting" && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs text-white">
                            <div className="w-12 h-12 rounded-full border-3 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4"></div>
                            <h3 className="text-lg font-semibold">
                                Connecting...
                            </h3>
                            <p className="mt-1 text-xs text-zinc-400">
                                Establishing secure peer-to-peer connection
                            </p>
                        </div>
                    )}

                    {/* Rejected State */}
                    {callStatus === "rejected" && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/90 text-white text-center px-4">
                            <h3 className="text-xl font-bold">Call Declined</h3>
                            <p className="mt-2 text-sm text-zinc-400">
                                The call was declined by the user.
                            </p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-6 px-6 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {/* Ended State */}
                    {callStatus === "ended" && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/90 text-white text-center px-4">
                            <h3 className="text-xl font-bold">Call Ended</h3>
                            <p className="mt-2 text-sm text-zinc-400 font-mono">
                                Total duration: {formatDuration(callDuration)}
                            </p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-6 px-6 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {/* Failed State */}
                    {callStatus === "failed" && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/90 text-white text-center px-6">
                            <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mb-3">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-red-400">
                                Connection Error
                            </h3>
                            <p className="mt-2 text-sm text-zinc-300 max-w-md">
                                {errorMessage ||
                                    "Unable to complete the video connection."}
                            </p>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="button"
                                    onClick={endCall}
                                    className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
                                >
                                    End Call
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Control Bar for Connected State */}
                {callStatus === "connected" && (
                    <div className="p-3 sm:p-4 bg-zinc-900/90 border-t border-zinc-800/80 backdrop-blur-md flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 z-20">
                        {/* Mute Button */}
                        <button
                            type="button"
                            onClick={toggleMute}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 ${isMuted
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700"
                                }`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMuted ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                    />
                                )}
                            </svg>
                            <span>{isMuted ? "Unmute" : "Mute"}</span>
                        </button>

                        {/* Camera Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleCamera}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 ${isCameraOff
                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700"
                                }`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isCameraOff ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                )}
                            </svg>
                            <span>{isCameraOff ? "Camera On" : "Camera Off"}</span>
                        </button>

                        {/* Screen Share Button */}
                        <button
                            type="button"
                            onClick={
                                isScreenSharing ? stopScreenShare : startScreenShare
                            }
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 ${isScreenSharing
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/30"
                                : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700"
                                }`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            <span>
                                {isScreenSharing
                                    ? "Stop Sharing"
                                    : "Share Screen"}
                            </span>
                        </button>

                        {/* Remove / Retrieve Self View Button */}
                        <button
                            type="button"
                            onClick={() => setIsSelfViewHidden(!isSelfViewHidden)}
                            title={isSelfViewHidden ? "Show my camera preview" : "Hide my camera preview"}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 ${isSelfViewHidden
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/30"
                                : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700"
                                }`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isSelfViewHidden ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                                    />
                                )}
                            </svg>
                            <span>{isSelfViewHidden ? "Retrieve Self" : "Remove Self"}</span>
                        </button>

                        {/* Full Screen Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 ${isFullscreen
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/30"
                                : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700"
                                }`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isFullscreen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 0l5-5m0 0l-5 0m5 0l0 5m-5 11l5 5m0 0l-5 0m5 0l0-5m-11 0l-5 5m0 0l5 0m-5 0l0-5"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                    />
                                )}
                            </svg>
                            <span>{isFullscreen ? "Exit Full" : "Full Screen"}</span>
                        </button>

                        {/* End Call Button */}
                        <button
                            type="button"
                            onClick={endCall}
                            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-red-600/30"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                                />
                            </svg>
                            <span>End Call</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}