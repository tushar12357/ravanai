import React, { useState, useEffect, useRef } from "react";
import { Mic, Send, X, Minimize2, Pause, Volume2, VolumeX } from "lucide-react";
import { MicOff } from "lucide-react";
import axios from "axios";
import { UltravoxSession } from "ultravox-client";
import useSessionStore from "../store/session";
import { useUltravoxStore } from "../store/ultrasession";
import logo from "../assets/logo.png";

const Maya = () => {
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const containerRef = useRef(null);
  const [isGlowing, setIsGlowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speech, setSpeech] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [auto_end_call, setAutoEndCall] = useState(false);
  const [pulseEffects, setPulseEffects] = useState({
    small: false,
    medium: false,
    large: false,
  });
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const { callId, callSessionId, setCallId, setCallSessionId } = useSessionStore();
  const {
    setSession,
    transcripts,
    setTranscripts,
    isListening,
    setIsListening,
    status,
    setStatus,
  } = useUltravoxStore();
  const baseurl = "https://maya.ravan.ai";
  const debugMessages = new Set(["debug"]);
  const orange = "#F97316";
  const creamYellow = "#FFF7ED";

  useEffect(() => {
    if (status === "disconnected") {
      setSpeech("Talk To Maya");
    } else if (status === "connecting") {
      setSpeech("Connecting To Maya");
    } else if (status === "speaking") {
      setSpeech("Ravan is Speaking");
    } else if (status === "connected") {
      setSpeech("Connected To Maya");
    } else if (status === "disconnecting") {
      setSpeech("Ending Conversation With Maya");
    } else if (status === "listening") {
      setSpeech(" Maya is Listening");
    }
  }, [status]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        session.muteSpeaker();
      } else if (document.visibilityState === "visible") {
        session.unmuteSpeaker();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const sessionRef = useRef(null);
  if (!sessionRef.current) {
    sessionRef.current = new UltravoxSession({
      experimentalMessages: debugMessages,
    });

    setSession(sessionRef.current);
  }

  const session = sessionRef.current;

  const end_call = (parameters) => {
    console.log("end_call", parameters.auto_disconnect_call);
    if (parameters.auto_disconnect_call) {
      setAutoEndCall(true);
    }
  };

  // Handle message submission
  const handleSubmit = () => {
    if (status !== "disconnected" && message.trim()) {
      session.sendText(`${message}`);
      setMessage("");
    }
  };

  useEffect(() => {
    console.log("status", status);
    const callId = localStorage.getItem("callId");
    if (status === "disconnecting") {
      console.log("reconnecting");
      setIsMuted(true);
      handleClose();
    } else if (status === "listening" && callId && isMuted) {
      session.muteSpeaker();
    }
  }, [status]);

  const handleMicClickForReconnect = async (id) => {
    try {
      const response = await axios.post(
        `${baseurl}/api/protected/thunder/start-thunder/`,
        { prior_call_id: id },
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpc3MiOiJhdXRoc2VydmljZSIsImV4cCI6MTc2MTI1NDg4NX0.sy0HRn2oDAuB5I0FGpTLwiRxDyCJq5W3Xp4kGqDG9DE`,
          },
        }
      );

      const wssUrl = response.data.joinUrl;
      const callId = response.data.callId;
      localStorage.setItem("callId", callId);
      setCallId(callId);
      setCallSessionId(response.data.call_session_id);

      if (wssUrl) {
        await session.joinCall(`${wssUrl}`);
      }
    } catch (error) {
      console.error("Error in handleMicClickForReconnect:", error);
    }
  };

  // Handle mic button click
  const handleMicClick = async () => {
    try {
      if (!isListening) {
        setIsGlowing(true);
        const response = await axios.post(
          `${baseurl}/api/protected/thunder/start-thunder/`,
          {},
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpc3MiOiJhdXRoc2VydmljZSIsImV4cCI6MTc2MTI1NDg4NX0.sy0HRn2oDAuB5I0FGpTLwiRxDyCJq5W3Xp4kGqDG9DE`,
            },
          }
        );

        const wssUrl = response.data.joinUrl;
        const callId = response.data.callId;
        localStorage.setItem("callId", callId);
        localStorage.setItem("wssUrl", wssUrl);
        setCallId(callId);
        setCallSessionId(response.data.call_session_id);

        if (wssUrl) {
          session.joinCall(`${wssUrl}`);
        }
        toggleVoice(true);
      } else {
        setIsGlowing(false);
        await session.leaveCall();
        console.log("call left successfully");
        setTranscripts(null);
        toggleVoice(false);
        localStorage.clear();
      }
    } catch (error) {
      console.error("Error in handleMicClick:", error);
    }
  };

  session.addEventListener("transcripts", (event) => {
    const alltrans = session.transcripts;
    let Trans = "";

    for (let index = 0; index < alltrans.length; index++) {
      const currentTranscript = alltrans[index];
      Trans = currentTranscript.text;

      if (currentTranscript) {
        setTranscripts(Trans);
      }
    }
  });

  // Listen for status changing events
  session.addEventListener("status", (event) => {
    setStatus(session.status);
    if (session.status === "speaking" || session.status === "listening") {
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  });

  session.addEventListener("experimental_message", (msg) => {
    console.log("Got a debug message: ", JSON.stringify(msg));
  });

  // Animated pulse effects for recording state
  useEffect(() => {
    if (isRecording) {
      const smallPulse = setInterval(() => {
        setPulseEffects((prev) => ({ ...prev, small: !prev.small }));
      }, 1000);

      const mediumPulse = setInterval(() => {
        setPulseEffects((prev) => ({ ...prev, medium: !prev.medium }));
      }, 1500);

      const largePulse = setInterval(() => {
        setPulseEffects((prev) => ({ ...prev, large: !prev.large }));
      }, 2000);

      return () => {
        clearInterval(smallPulse);
        clearInterval(mediumPulse);
        clearInterval(largePulse);
      };
    }
  }, [isRecording]);

  const toggleExpand = () => {
    if (status === "disconnected") {
      setSpeech("Connecting To Maya");
      handleMicClick();
    }
    if (session.isSpeakerMuted) {
      setIsMuted(false);
      session.unmuteSpeaker();
    }

    setExpanded(!expanded);
    setIsMinimized(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (session.isSpeakerMuted) {
      session.unmuteSpeaker();
    } else {
      session.muteSpeaker();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = async () => {
    setExpanded(false);
    localStorage.clear();
    await session.leaveCall();
    setTranscripts(null);
    toggleVoice(false);
  };

  const toggleVoice = (data) => {
    setIsListening(data);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [transcripts]);

  // Animation for the button when speaking/active
  useEffect(() => {
    if (status === "speaking" || status === "listening") {
      setIsGlowing(true);
    } else {
      setIsGlowing(false);
    }
  }, [status]);

  return (
    <div className="widget-container">
      {expanded ? (
        <div
          className={`chat-window ${isMinimized ? "minimized" : ""} ${
            isGlowing ? "border-orange-400 shadow-orange-500/50" : "border-orange-300"
          }`}
        >
          <div className="chat-header">
            <div className="header-logo">
              <div className="logo-container">
                <img src={logo} alt="Ravan AI logo" className="w-6 h-6" />
              </div>
              <span className="header-title">Ravan AI</span>
            </div>
            <div className="header-controls">
              <button
                onClick={toggleMute}
                className="control-button"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button
                onClick={toggleMinimize}
                className="control-button"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 size={18} />
              </button>
              <button onClick={handleClose} className="control-button" title="Close">
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="chat-content">
              <div className="mic-button-container">
                {isRecording && (
                  <>
                    <div className="pulse-ring" style={{ "--delay": "0s" }}></div>
                    <div className="pulse-ring" style={{ "--delay": "0.5s" }}></div>
                    <div className="pulse-ring" style={{ "--delay": "1s" }}></div>
                  </>
                )}
                <button
                  onClick={handleMicClick}
                  className={`mic-button ${isRecording ? "active" : ""}`}
                >
                  <div className="relative">
                    {isGlowing && <div className="glow-effect"></div>}
                    <img
                      src={logo}
                      alt="Ravan AI logo"
                      className={`w-12 h-12 transition-transform duration-300 ${
                        isRecording ? "scale-110" : ""
                      }`}
                    />
                  </div>
                </button>
              </div>

              <div className="status-badge">{speech}</div>

              <div className="transcript-container" ref={containerRef}>
                <div className="relative">
                  <span className="transcript-text">{transcripts}</span>
                  {!transcripts && (
                    <span className="text-gray-400 italic">
                      Your conversation will appear here...
                    </span>
                  )}
                </div>
              </div>

              <div className="input-wrapper">
                <div className="input-container">
                  <input
                    type="text"
                    disabled={status === "disconnected" || status === "connecting"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && message.trim()) {
                        handleSubmit();
                      }
                    }}
                    placeholder="Type your message..."
                    className="message-input"
                  />
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      !message.trim() || status === "disconnected" || status === "connecting"
                    }
                    className="send-button"
                  >
                    <Send size={20} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="floating-button-container flex flex-col items-center">
          <button onClick={toggleExpand} className="floating-button">
            <div className="relative">
              <img src={logo} alt="Ravan AI logo" className="w-8 h-8 relative z-10" />
            </div>
          </button>
          <span className="talk-to-me text-sm font-medium px-3 py-1 mt-2">
            Talk to Maya
          </span>
        </div>
      )}
    </div>
  );
};

export default Maya;