import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback
} from "react";
import socket from "../services/socket.jsx";
import VoiceCall from "../components/shared/call/VoiceCall.jsx";
import VideoCall from "../components/shared/call/VideoCall.jsx";

const CallContext = createContext(null);

export function CallProvider({ children }) {
    const [activeCall, setActiveCall] = useState(null);
    const [busyNotice, setBusyNotice] = useState(null);

    const activeCallRef = useRef(activeCall);
    useEffect(() => {
        activeCallRef.current = activeCall;
    }, [activeCall]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            socket.auth = { token };
            if (!socket.connected) {
                socket.connect();
            }
        }
    }, []);

    const ringAudioContextRef = useRef(null);
    const ringIntervalRef = useRef(null);
    const activeOscillatorsRef = useRef([]);

    const stopRingtone = useCallback(() => {
        if (ringIntervalRef.current) {
            clearInterval(ringIntervalRef.current);
            ringIntervalRef.current = null;
        }

        if (activeOscillatorsRef.current.length > 0) {
            activeOscillatorsRef.current.forEach((osc) => {
                try {
                    osc.stop();
                    osc.disconnect();
                } catch (e) { }
            });
            activeOscillatorsRef.current = [];
        }

        if (ringAudioContextRef.current) {
            try {
                if (ringAudioContextRef.current.state !== "closed") {
                    ringAudioContextRef.current.close();
                }
            } catch (err) {
                console.warn("Error closing ringtone AudioContext:", err);
            }
            ringAudioContextRef.current = null;
        }
    }, []);

    const startRingtone = useCallback(() => {
        try {
            stopRingtone();
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            const ctx = new AudioCtx();
            ringAudioContextRef.current = ctx;

            const playPulse = () => {
                if (!ctx || ctx.state === "closed") return;
                if (ctx.state === "suspended") {
                    ctx.resume().catch(() => { });
                }

                const now = ctx.currentTime;
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();

                osc1.type = "sine";
                osc1.frequency.setValueAtTime(440, now); // 440 Hz
                osc2.type = "sine";
                osc2.frequency.setValueAtTime(480, now); // 480 Hz

                gain.gain.setValueAtTime(0.09, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);

                activeOscillatorsRef.current.push(osc1, osc2);

                const removeOsc = (osc) => {
                    activeOscillatorsRef.current = activeOscillatorsRef.current.filter((o) => o !== osc);
                };
                osc1.onended = () => removeOsc(osc1);
                osc2.onended = () => removeOsc(osc2);

                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 1.2);
                osc2.stop(now + 1.2);
            };

            playPulse();
            ringIntervalRef.current = setInterval(playPulse, 2400);
        } catch (err) {
            console.warn("Autoplay / AudioContext tone blocked:", err);
        }
    }, [stopRingtone]);

    const handleCallClose = useCallback(() => {
        stopRingtone();
        setActiveCall(null);
    }, [stopRingtone]);

    // Global listener for incoming calls across any page
    useEffect(() => {
        function handleIncomingCall(data) {
            console.log("Incoming voice call received:", data);
            if (activeCallRef.current) {
                console.log("[Call Busy] User already in active call. Auto-rejecting.");
                socket.emit("call-rejected", {
                    callerId: data.callerId,
                    conversationId: data.conversationId,
                    reason: "busy"
                });
                return;
            }

            startRingtone();
            setActiveCall({
                callType: "voice",
                conversationId: data.conversationId,
                callerId: data.callerId,
                callerName: data.callerName || (data.callerRole === "mentor" ? "Mentor" : "Student"),
                callerRole: data.callerRole,
                isIncoming: true
            });
        }

        function handleIncomingVideoCall(data) {
            console.log("Incoming video call received:", data);
            if (activeCallRef.current) {
                console.log("[Call Busy] User already in active call. Auto-rejecting video call.");
                socket.emit("call-rejected", {
                    callerId: data.callerId,
                    conversationId: data.conversationId,
                    reason: "busy"
                });
                return;
            }

            startRingtone();
            setActiveCall({
                callType: "video",
                conversationId: data.conversationId,
                callerId: data.callerId,
                callerName: data.callerName || (data.callerRole === "mentor" ? "Mentor" : "Student"),
                callerRole: data.callerRole,
                isIncoming: true
            });
        }

        const handleStopRingtoneEvent = () => {
            console.log("[CallContext] Call connected / answered / terminated — stopping ringtone.");
            stopRingtone();
        };

        socket.on("incoming-call", handleIncomingCall);
        socket.on("incoming-video-call", handleIncomingVideoCall);
        socket.on("call-accepted", handleStopRingtoneEvent);
        socket.on("webrtc-offer", handleStopRingtoneEvent);
        socket.on("webrtc-answer", handleStopRingtoneEvent);
        socket.on("call-ended", handleStopRingtoneEvent);
        socket.on("call-rejected", handleStopRingtoneEvent);

        const handleOutgoing = (event) => {
            if (
                event === "call-accepted" ||
                event === "webrtc-offer" ||
                event === "webrtc-answer" ||
                event === "call-ended" ||
                event === "call-rejected"
            ) {
                handleStopRingtoneEvent();
            }
        };

        if (typeof socket.onAnyOutgoing === "function") {
            socket.onAnyOutgoing(handleOutgoing);
        }

        return () => {
            socket.off("incoming-call", handleIncomingCall);
            socket.off("incoming-video-call", handleIncomingVideoCall);
            socket.off("call-accepted", handleStopRingtoneEvent);
            socket.off("webrtc-offer", handleStopRingtoneEvent);
            socket.off("webrtc-answer", handleStopRingtoneEvent);
            socket.off("call-ended", handleStopRingtoneEvent);
            socket.off("call-rejected", handleStopRingtoneEvent);
            if (typeof socket.offAnyOutgoing === "function") {
                socket.offAnyOutgoing(handleOutgoing);
            }
            stopRingtone();
        };
    }, [startRingtone, stopRingtone]);

    const startCall = useCallback(
        ({ conversationId, targetUserId, callType = "voice", recipientName = "" }) => {
            if (activeCallRef.current) {
                setBusyNotice("You are already in an active call session.");
                return;
            }

            stopRingtone();
            setActiveCall({
                conversationId,
                targetUserId,
                callType,
                recipientName,
                isIncoming: false
            });
        },
        [stopRingtone]
    );

    const endActiveCall = useCallback(() => {
        handleCallClose();
    }, [handleCallClose]);

    return (
        <CallContext.Provider
            value={{
                activeCall,
                isCallActive: !!activeCall,
                startCall,
                endActiveCall,
                busyNotice,
                setBusyNotice
            }}
        >
            {children}

            {/* Global Voice Call Modal */}
            {activeCall?.callType === "voice" && (
                <VoiceCall
                    conversationId={activeCall.conversationId}
                    targetUserId={activeCall.targetUserId}
                    callerId={activeCall.callerId}
                    isIncoming={activeCall.isIncoming}
                    onClose={handleCallClose}
                />
            )}

            {/* Global Video Call Modal */}
            {activeCall?.callType === "video" && (
                <VideoCall
                    conversationId={activeCall.conversationId}
                    targetUserId={activeCall.targetUserId}
                    callerId={activeCall.callerId}
                    callerName={activeCall.callerName}
                    recipientName={activeCall.recipientName}
                    isIncoming={activeCall.isIncoming}
                    onAccepted={stopRingtone}
                    onClose={handleCallClose}
                />
            )}

            {/* User Busy Alert Dialog */}
            {busyNotice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-6 text-center space-y-4">
                        <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <svg
                                className="w-7 h-7"
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
                        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                            User is Currently Busy
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                            {busyNotice}
                        </p>
                        <button
                            type="button"
                            onClick={() => setBusyNotice(null)}
                            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}
        </CallContext.Provider>
    );
}

export function useCall() {
    const context = useContext(CallContext);
    if (!context) {
        return {
            activeCall: null,
            isCallActive: false,
            startCall: () => {},
            endActiveCall: () => {},
            busyNotice: null,
            setBusyNotice: () => {}
        };
    }
    return context;
}

export default CallContext;
