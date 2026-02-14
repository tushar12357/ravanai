import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Send,
  X,
  Minimize2,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { UltravoxSession } from "ultravox-client";
import useSessionStore from "../store/session";
import { useUltravoxStore } from "../store/ultrasession";
import logo from "../assets/logo.png";
const LOCAL_STORAGE_KEY = "ravan_demo_user_data";
const Dynamic = () => {
  const [expanded, setExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speech, setSpeech] = useState("Talk To Maya");
  const [transcripts, setTranscripts] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState("");
  const containerRef = useRef(null);

  // Form states
  const [showForm, setShowForm] = useState(true);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    agentName: "Maya",
    websiteUrl: "",
    personality: "Friendly, professional, and helpful customer support agent",
  });


  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          companyName: parsed.businessName || prev.companyName,
        }));
      }
    } catch (e) {
      // silent
    }
  }, []);
  // Dynamic agent code from /start-demo
  const [dynamicAgentCode, setDynamicAgentCode] = useState(null);
  const [creationStatus, setCreationStatus] = useState<string>("");
  const { callId, callSessionId, setCallId, setCallSessionId } =
    useSessionStore();
  const {
    setSession,
    setTranscripts: setStoreTranscripts,
    isListening,
    setIsListening,
    status,
    setStatus,
  } = useUltravoxStore();

  const baseurl = "https://app.snowie.ai";
  const sessionRef = useRef(null);

  // Initialize Ultravox Session once
  useEffect(() => {
    if (!sessionRef.current) {
      sessionRef.current = new UltravoxSession({
        experimentalMessages: new Set(["debug"]),
      });
      setSession(sessionRef.current);
    }
  }, [setSession]);

  const session = sessionRef.current;

  // Handle form submission → create agent
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.websiteUrl) return;

    setIsCreatingAgent(true);
    setCreationStatus("Validating your website...");

    try {
      // Step 1: Initial
      setCreationStatus("Fetching your website...");

      const response = await axios.post(`${baseurl}/api/start-demo/`, {
        company_name: formData.companyName,
        agent_name: formData.agentName || "Maya",
        company_website: formData.websiteUrl,
        agent_personality: formData.personality,
      });

      const { agent_code, schema_name } = response.data.response;

      if (!agent_code) {
        throw new Error("No agent code received");
      }

      // Step 2–5: Simulate progress (or use real SSE if backend supports
      setCreationStatus("Scraping content from your website...");
      await new Promise((r) => setTimeout(r, 2500));

      setCreationStatus("Reading and understanding your content...");
      await new Promise((r) => setTimeout(r, 3000));

      setCreationStatus(
        `Training ${formData.agentName || "Maya"} with your brand voice...`
      );
      await new Promise((r) => setTimeout(r, 3500));

      setCreationStatus("Finalizing AI agent – this takes a moment...");
      await new Promise((r) => setTimeout(r, 2000));

      setDynamicAgentCode(agent_code);
      setShowForm(false);
      setSpeech(`Talk to ${formData.agentName || "Maya"}`);
      setCreationStatus("Agent ready! Connecting you now...");

      // Auto-start the call
      setTimeout(async () => {
        try {
          const savedUser = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
          const thunderRes = await axios.post(`${baseurl}/api/create-room/`, {
            agent_code: agent_code,
            schema_name: schema_name,
            name: savedUser.name || "",
            email: savedUser.email || "",
            phone: savedUser.phone || "",
          });

          const { joinUrl, callId, call_session_id } = thunderRes.data.response;

          localStorage.setItem("callId", callId);
          setCallId(callId);
          setCallSessionId(call_session_id);

          if (joinUrl && session) {
            await session.joinCall(joinUrl);
            setIsListening(true);
            setIsGlowing(true);
            setExpanded(true);
          }
        } catch (err) {
          console.error("Failed to auto-start call:", err);
          setCreationStatus("Agent ready! Click the mic to start talking.");
        }
      }, 1200);
    } catch (error: any) {
      console.error("Failed to create agent:", error);
      setCreationStatus("");
    } finally {
      // Only remove loading if error occurred; otherwise we hide form
      if (creationStatus.includes("Failed") || !dynamicAgentCode) {
        setIsCreatingAgent(false);
      }
    }
  };

  // Update speech based on status
  useEffect(() => {
    if (status === "disconnected") {
      setSpeech(`Talk to ${formData.agentName || "Maya"}`);
    } else if (status === "connecting") {
      setSpeech(`Connecting to ${formData.agentName || "Maya"}...`);
    } else if (status === "speaking") {
      setSpeech(`${formData.agentName || "Maya"} is speaking`);
    } else if (status === "connected") {
      setSpeech(`Connected to ${formData.agentName || "Maya"}`);
    } else if (status === "listening") {
      setSpeech(`${formData.agentName || "Maya"} is listening...`);
    } else if (status === "disconnecting") {
      setSpeech("Ending conversation...");
    }
  }, [status, formData.agentName]);

  // Handle mic click using dynamic agent code
  const handleMicClick = async () => {
    if (!dynamicAgentCode) return;

    try {
      if (!isListening) {
        setIsGlowing(true);
        const response = await axios.post(`${baseurl}/api/create-room/`, {
          agent_code: dynamicAgentCode,
          schema_name: "default",
          "provider":"thunderemotionlite" // or pass dynamically if needed
        });

        const wssUrl = response.data.joinUrl;
        const callId = response.data.callId;

        localStorage.setItem("callId", callId);
        setCallId(callId);
        setCallSessionId(response.data.call_session_id);

        if (wssUrl && session) {
          await session.joinCall(wssUrl);
        }
        toggleVoice(true);
      } else {
        setIsGlowing(false);
        await session?.leaveCall();
        setStoreTranscripts(null);
        setTranscripts("");
        toggleVoice(false);
      }
    } catch (error) {
      console.error("Error in handleMicClick:", error);
    }
  };

  const handleSubmit = () => {
    if (status !== "disconnected" && message.trim() && session) {
      session.sendText(message);
      setMessage("");
    }
  };

  const toggleVoice = (data) => setIsListening(data);
  const toggleExpand = () => {
    if (!dynamicAgentCode && !showForm) return;
    setExpanded(true);
    if (!isListening && dynamicAgentCode) {
      handleMicClick();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (session?.isSpeakerMuted) {
      session.unmuteSpeaker();
    } else {
      session?.muteSpeaker();
    }
  };

  const toggleMinimize = () => setIsMinimized(!isMinimized);

  const handleClose = async () => {
    setExpanded(false);
    await session?.leaveCall();
    setTranscripts("");
    setStoreTranscripts(null);
    toggleVoice(false);
  };

  // Session event listeners
  useEffect(() => {
    if (!session) return;

    const handleTranscripts = () => {
      const alltrans = session.transcripts;
      if (alltrans.length > 0) {
        const latest = alltrans[alltrans.length - 1].text;
        setTranscripts(latest);
        setStoreTranscripts(latest);
      }
    };

    const handleStatus = () => {
      setStatus(session.status);
      setIsRecording(
        session.status === "speaking" || session.status === "listening"
      );
      setIsGlowing(
        session.status === "speaking" || session.status === "listening"
      );
    };

    session.addEventListener("transcripts", handleTranscripts);
    session.addEventListener("status", handleStatus);

    return () => {
      session.removeEventListener("transcripts", handleTranscripts);
      session.removeEventListener("status", handleStatus);
    };
  }, [session, setStatus, setStoreTranscripts]);

  // Auto scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts]);

  // Show form if no agent yet
  if (showForm) {
    return (
      <div className="dynamic-widget-container flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <img src={logo} alt="Ravan AI" className="w-10 h-10" />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold tracking-wider text-orange-500 uppercase">
                BUILD IN FEW MINUTES
              </p>

            
            </div>
          </div>

          <form onSubmit={handleCreateAgent} className="space-y-5">
           

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name
              </label>
              <input
                type="text"
                value={formData.agentName}
                onChange={(e) =>
                  setFormData({ ...formData, agentName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Maya"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL *
              </label>
              <input
                type="text"
                required
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, websiteUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="https://yourcompany.com"
              />
            </div>

          
            <button
              type="submit"
              disabled={isCreatingAgent}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold py-4 rounded-lg flex flex-col items-center justify-center gap-3 transition min-h-[70px]"
            >
              {isCreatingAgent ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-sm font-medium text-center px-4">
                    {creationStatus || "Creating your AI agent..."}
                  </span>
                  <span className="text-xs opacity-80">
                    This usually takes 15–30 seconds
                  </span>
                </>
              ) : (
                "Create & Start Talking"
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            We will analyze your website to make your agent smart and
            context-aware.
          </p>
        </div>
      </div>
    );
  }

  // Main widget (same as before, just cleaner)
  return (
    <div className="end-widget-container">
      {expanded ? (
        <div
          className={`chat-window ${isMinimized ? "minimized" : ""} ${
            isGlowing
              ? "border-orange-400 shadow-orange-500/50"
              : "border-orange-300"
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
              <button onClick={toggleMinimize} className="control-button">
                <Minimize2 size={18} />
              </button>
              <button onClick={handleClose} className="control-button">
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="chat-content">
              <div className="mic-button-container">
                {isRecording && (
                  <>
                    <div
                      className="pulse-ring"
                      style={{ "--delay": "0s" }}
                    ></div>
                    <div
                      className="pulse-ring"
                      style={{ "--delay": "0.5s" }}
                    ></div>
                    <div
                      className="pulse-ring"
                      style={{ "--delay": "1s" }}
                    ></div>
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
                      alt="Logo"
                      className={`w-12 h-12 transition-transform duration-300 ${
                        isRecording ? "scale-110" : ""
                      }`}
                    />
                  </div>
                </button>
              </div>

              <div className="status-badge">{speech}</div>

              <div className="transcript-container" ref={containerRef}>
                <span className="transcript-text">
                  {transcripts || (
                    <span className="text-gray-400 italic">
                      Your conversation will appear here...
                    </span>
                  )}
                </span>
              </div>

              <div className="input-wrapper">
                <div className="input-container">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && message.trim() && handleSubmit()
                    }
                    placeholder="Type your message..."
                    disabled={
                      status === "disconnected" || status === "connecting"
                    }
                    className="message-input"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim()}
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
              <img
                src={logo}
                alt="Ravan AI logo"
                className="w-8 h-8 relative z-10"
              />
            </div>
          </button>
          <span className="talk-to-me text-sm font-medium px-3 py-1 mt-2">
            Talk to {formData.agentName || "Maya"}
          </span>
        </div>
      )}
    </div>
  );
};

export default Dynamic;
