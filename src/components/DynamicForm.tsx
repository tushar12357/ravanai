import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Send,
    Mic,
    MicOff,
    Sparkles,
    PhoneOff,
    Activity,
    MessageSquare,
    Phone,
    ArrowRight,
    Loader2,
    ChevronDown,
    Calendar,
    X,
} from "lucide-react";
import axios from "axios";
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useLocalParticipant,
    useRoomContext,
    useConnectionState,
    useVoiceAssistant,
    useChat,
    BarVisualizer,
} from "@livekit/components-react";
import { ConnectionState, RoomEvent, Participant } from "livekit-client";
import "@livekit/components-styles";

const LOGO_URL = "https://storage.googleapis.com/msgsndr/LK2LrQP5tkIZ3ahmumnr/media/698928520708e4d8649f0642.png";
// Placeholder video URL (using a professional abstract loop or similar if available, otherwise just logo)
// Since I couldn't find the specific user video, I'll use a placeholder or just the logo for now.

// ─── TYPES ───
type FlowStep = "LEAD" | "MENU" | "WIDGET_FORM" | "WIDGET_ACTIVE" | "CALLING";

interface LeadData {
    name: string;
    email: string;
    phone: string;
    company: string;
    countryCode: string;
}

interface TranscriptItem {
    id: string;
    text: string;
    isFinal: boolean;
    timestamp: number;
    participantName: string;
}

const COUNTRY_CODES = [
    { code: "+93", country: "AF" }, { code: "+355", country: "AL" }, { code: "+213", country: "DZ" }, { code: "+1-684", country: "AS" },
    { code: "+376", country: "AD" }, { code: "+244", country: "AO" }, { code: "+1-264", country: "AI" }, { code: "+672", country: "AQ" },
    { code: "+1-268", country: "AG" }, { code: "+54", country: "AR" }, { code: "+374", country: "AM" }, { code: "+297", country: "AW" },
    { code: "+61", country: "AU" }, { code: "+43", country: "AT" }, { code: "+994", country: "AZ" }, { code: "+1-242", country: "BS" },
    { code: "+973", country: "BH" }, { code: "+880", country: "BD" }, { code: "+1-246", country: "BB" }, { code: "+375", country: "BY" },
    { code: "+32", country: "BE" }, { code: "+501", country: "BZ" }, { code: "+229", country: "BJ" }, { code: "+1-441", country: "BM" },
    { code: "+975", country: "BT" }, { code: "+591", country: "BO" }, { code: "+387", country: "BA" }, { code: "+267", country: "BW" },
    { code: "+55", country: "BR" }, { code: "+246", country: "IO" }, { code: "+1-284", country: "VG" }, { code: "+673", country: "BN" },
    { code: "+359", country: "BG" }, { code: "+226", country: "BF" }, { code: "+257", country: "BI" }, { code: "+855", country: "KH" },
    { code: "+237", country: "CM" }, { code: "+1", country: "CA" }, { code: "+238", country: "CV" }, { code: "+1-345", country: "KY" },
    { code: "+236", country: "CF" }, { code: "+235", country: "TD" }, { code: "+56", country: "CL" }, { code: "+86", country: "CN" },
    { code: "+61", country: "CX" }, { code: "+61", country: "CC" }, { code: "+57", country: "CO" }, { code: "+269", country: "KM" },
    { code: "+682", country: "CK" }, { code: "+506", country: "CR" }, { code: "+385", country: "HR" }, { code: "+53", country: "CU" },
    { code: "+599", country: "CW" }, { code: "+357", country: "CY" }, { code: "+420", country: "CZ" }, { code: "+243", country: "CD" },
    { code: "+45", country: "DK" }, { code: "+253", country: "DJ" }, { code: "+1-767", country: "DM" }, { code: "+1-809", country: "DO" },
    { code: "+670", country: "TL" }, { code: "+593", country: "EC" }, { code: "+20", country: "EG" }, { code: "+503", country: "SV" },
    { code: "+240", country: "GQ" }, { code: "+291", country: "ER" }, { code: "+372", country: "EE" }, { code: "+251", country: "ET" },
    { code: "+500", country: "FK" }, { code: "+298", country: "FO" }, { code: "+679", country: "FJ" }, { code: "+358", country: "FI" },
    { code: "+33", country: "FR" }, { code: "+689", country: "PF" }, { code: "+241", country: "GA" }, { code: "+220", country: "GM" },
    { code: "+995", country: "GE" }, { code: "+49", country: "DE" }, { code: "+233", country: "GH" }, { code: "+350", country: "GI" },
    { code: "+30", country: "GR" }, { code: "+299", country: "GL" }, { code: "+1-473", country: "GD" }, { code: "+1-671", country: "GU" },
    { code: "+502", country: "GT" }, { code: "+44-1481", country: "GG" }, { code: "+224", country: "GN" }, { code: "+245", country: "GW" },
    { code: "+592", country: "GY" }, { code: "+509", country: "HT" }, { code: "+504", country: "HN" }, { code: "+852", country: "HK" },
    { code: "+36", country: "HU" }, { code: "+354", country: "IS" }, { code: "+91", country: "IN" }, { code: "+62", country: "ID" },
    { code: "+98", country: "IR" }, { code: "+964", country: "IQ" }, { code: "+353", country: "IE" }, { code: "+44-1624", country: "IM" },
    { code: "+972", country: "IL" }, { code: "+39", country: "IT" }, { code: "+225", country: "CI" }, { code: "+1-876", country: "JM" },
    { code: "+81", country: "JP" }, { code: "+44-1534", country: "JE" }, { code: "+962", country: "JO" }, { code: "+7", country: "KZ" },
    { code: "+254", country: "KE" }, { code: "+686", country: "KI" }, { code: "+383", country: "XK" }, { code: "+965", country: "KW" },
    { code: "+996", country: "KG" }, { code: "+856", country: "LA" }, { code: "+371", country: "LV" }, { code: "+961", country: "LB" },
    { code: "+266", country: "LS" }, { code: "+231", country: "LR" }, { code: "+218", country: "LY" }, { code: "+423", country: "LI" },
    { code: "+370", country: "LT" }, { code: "+352", country: "LU" }, { code: "+853", country: "MO" }, { code: "+389", country: "MK" },
    { code: "+261", country: "MG" }, { code: "+265", country: "MW" }, { code: "+60", country: "MY" }, { code: "+960", country: "MV" },
    { code: "+223", country: "ML" }, { code: "+356", country: "MT" }, { code: "+692", country: "MH" }, { code: "+222", country: "MR" },
    { code: "+230", country: "MU" }, { code: "+262", country: "YT" }, { code: "+52", country: "MX" }, { code: "+691", country: "FM" },
    { code: "+373", country: "MD" }, { code: "+377", country: "MC" }, { code: "+976", country: "MN" }, { code: "+382", country: "ME" },
    { code: "+1-664", country: "MS" }, { code: "+212", country: "MA" }, { code: "+258", country: "MZ" }, { code: "+95", country: "MM" },
    { code: "+264", country: "NA" }, { code: "+674", country: "NR" }, { code: "+977", country: "NP" }, { code: "+31", country: "NL" },
    { code: "+599", country: "AN" }, { code: "+687", country: "NC" }, { code: "+64", country: "NZ" }, { code: "+505", country: "NI" },
    { code: "+227", country: "NE" }, { code: "+234", country: "NG" }, { code: "+683", country: "NU" }, { code: "+850", country: "KP" },
    { code: "+1-670", country: "MP" }, { code: "+47", country: "NO" }, { code: "+968", country: "OM" }, { code: "+92", country: "PK" },
    { code: "+680", country: "PW" }, { code: "+970", country: "PS" }, { code: "+507", country: "PA" }, { code: "+675", country: "PG" },
    { code: "+595", country: "PY" }, { code: "+51", country: "PE" }, { code: "+63", country: "PH" }, { code: "+64", country: "PN" },
    { code: "+48", country: "PL" }, { code: "+351", country: "PT" }, { code: "+1-787", country: "PR" }, { code: "+974", country: "QA" },
    { code: "+242", country: "CG" }, { code: "+262", country: "RE" }, { code: "+40", country: "RO" }, { code: "+7", country: "RU" },
    { code: "+250", country: "RW" }, { code: "+590", country: "BL" }, { code: "+290", country: "SH" }, { code: "+1-869", country: "KN" },
    { code: "+1-758", country: "LC" }, { code: "+590", country: "MF" }, { code: "+508", country: "PM" }, { code: "+1-784", country: "VC" },
    { code: "+685", country: "WS" }, { code: "+378", country: "SM" }, { code: "+239", country: "ST" }, { code: "+966", country: "SA" },
    { code: "+221", country: "SN" }, { code: "+381", country: "RS" }, { code: "+248", country: "SC" }, { code: "+232", country: "SL" },
    { code: "+65", country: "SG" }, { code: "+1-721", country: "SX" }, { code: "+421", country: "SK" }, { code: "+386", country: "SI" },
    { code: "+677", country: "SB" }, { code: "+252", country: "SO" }, { code: "+27", country: "ZA" }, { code: "+82", country: "KR" },
    { code: "+211", country: "SS" }, { code: "+34", country: "ES" }, { code: "+94", country: "LK" }, { code: "+249", country: "SD" },
    { code: "+597", country: "SR" }, { code: "+47", country: "SJ" }, { code: "+268", country: "SZ" }, { code: "+46", country: "SE" },
    { code: "+41", country: "CH" }, { code: "+963", country: "SY" }, { code: "+886", country: "TW" }, { code: "+992", country: "TJ" },
    { code: "+255", country: "TZ" }, { code: "+66", country: "TH" }, { code: "+228", country: "TG" }, { code: "+690", country: "TK" },
    { code: "+676", country: "TO" }, { code: "+1-868", country: "TT" }, { code: "+216", country: "TN" }, { code: "+90", country: "TR" },
    { code: "+993", country: "TM" }, { code: "+1-649", country: "TC" }, { code: "+688", country: "TV" }, { code: "+1-340", country: "VI" },
    { code: "+256", country: "UG" }, { code: "+380", country: "UA" }, { code: "+971", country: "AE" }, { code: "+44", country: "GB" },
    { code: "+1", country: "US" }, { code: "+598", country: "UY" }, { code: "+998", country: "UZ" }, { code: "+678", country: "VU" },
    { code: "+39-06", country: "VA" }, { code: "+58", country: "VE" }, { code: "+84", country: "VN" }, { code: "+681", country: "WF" },
    { code: "+212", country: "EH" }, { code: "+967", country: "YE" }, { code: "+260", country: "ZM" }, { code: "+263", country: "ZW" }
].sort((a, b) => a.country.localeCompare(b.country));

// ─── ROOM CONTENT (The Widget Call) ────────────────────────────
const RoomContent = ({
    onClose,
    agentName,
}: {
    onClose: () => void;
    agentName: string;
}) => {
    const room = useRoomContext();
    const connectionState = useConnectionState();
    const { localParticipant } = useLocalParticipant();
    const [isMuted, setIsMuted] = useState(false);
    const [inputText, setInputText] = useState("");
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { state, audioTrack } = useVoiceAssistant();
    const { chatMessages, send, isSending } = useChat();
    const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);

    // ── Call Timer ──
    const [callSeconds, setCallSeconds] = useState(0);
    useEffect(() => {
        if (connectionState !== ConnectionState.Connected) return;
        const interval = setInterval(() => setCallSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, [connectionState]);
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        const handleTranscription = (segments: any[], participant?: Participant) => {
            if (!segments || segments.length === 0) return;
            setTranscripts((prev) => {
                const newTranscripts = [...prev];
                const name = participant?.identity === localParticipant.identity ? "You" : agentName;
                for (const seg of segments) {
                    const existingIndex = newTranscripts.findIndex(t => t.id === seg.id);
                    if (existingIndex !== -1) {
                        newTranscripts[existingIndex] = { ...newTranscripts[existingIndex], text: seg.text, isFinal: seg.final };
                    } else {
                        newTranscripts.push({ id: seg.id, text: seg.text, isFinal: seg.final, timestamp: seg.firstReceivedTime || Date.now(), participantName: name });
                    }
                }
                return newTranscripts.sort((a, b) => a.timestamp - b.timestamp);
            });
        };
        room.on(RoomEvent.TranscriptionReceived, handleTranscription);
        return () => { room.off(RoomEvent.TranscriptionReceived, handleTranscription); };
    }, [room, localParticipant, agentName]);

    useEffect(() => { transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcripts]);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

    const handleSendChat = useCallback(async () => {
        if (!inputText.trim() || isSending) return;
        const text = inputText.trim();
        setInputText("");
        try { await send(text); } catch (err) { console.error("Chat send error:", err); }
    }, [inputText, isSending, send]);

    const toggleMute = useCallback(() => {
        const enabled = localParticipant.isMicrophoneEnabled;
        localParticipant.setMicrophoneEnabled(!enabled);
        setIsMuted(enabled);
    }, [localParticipant]);

    const isListening = state === "listening";
    const isSpeaking = state === "speaking";
    const isConnected = connectionState === ConnectionState.Connected;

    const getStatusText = () => {
        switch (connectionState) {
            case ConnectionState.Connecting: return "Connecting...";
            case ConnectionState.Connected: return isSpeaking ? `${agentName} speaking...` : isListening ? "Listening..." : "Connected";
            case ConnectionState.Disconnected: return "Disconnected";
            default: return "Ready";
        }
    };

    return (
        <div className="call-card">
            {/* Premium Header */}
            <div className="call-header">
                <div className="agent-info">
                    <div className="agent-name">{agentName}</div>
                    <div className={`status-badge ${isConnected ? 'online' : ''}`}>
                        {getStatusText()}
                    </div>
                </div>

                {/* Center Orb */}
                <div className="agent-visual-center">
                    <div className="agent-orb-container">
                        <div className={`orb-ring ring-1 ${isSpeaking ? "active" : ""}`} />
                        <div className={`orb-ring ring-2 ${isSpeaking ? "active" : ""}`} />
                        <div className={`agent-orb ${isSpeaking ? "speaking" : ""} ${isListening ? "listening" : ""}`}>
                            <img src={LOGO_URL} alt="Agent" />
                        </div>
                    </div>
                    {(isSpeaking || isListening) && (
                        <div className="mini-visualizer">
                            <BarVisualizer state={state} trackRef={audioTrack} barCount={7} style={{ width: "100%", height: "100%", "--lk-va-bar-color": "#800020", background: "transparent" } as React.CSSProperties} />
                        </div>
                    )}
                </div>

                <div className="header-controls">
                    <button onClick={toggleMute} className={`icon-btn ${isMuted ? "active" : ""}`}>{isMuted ? <MicOff size={20} /> : <Mic size={20} />}</button>
                    <button onClick={onClose} className="icon-btn danger"><PhoneOff size={20} /></button>
                </div>
            </div>

            {/* Timer Bar */}
            {isConnected && (
                <div className="call-timer-bar">
                    <div className="call-timer-dot" />
                    <span className="call-timer-label">Live</span>
                    <span className="call-timer-time">{formatTime(callSeconds)}</span>
                    <span className="call-timer-brand">Agni</span>
                </div>
            )}

            {/* Transcript Area */}
            <div className="content-area">
                <div className="transcript-stream scrollbar-hide">
                    {transcripts.length === 0 && chatMessages.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <Activity size={36} />
                            </div>
                            <p className="empty-state-text">Conversation will appear here...</p>
                            <p className="empty-state-hint">Start speaking or type a message below</p>
                        </div>
                    ) : (
                        <div className="stream-content">
                            {transcripts.map((t) => (
                                <div key={t.id} className={`transcript-entry ${!t.isFinal ? 'streaming' : ''} ${t.participantName === "You" ? "entry-user" : "entry-agent"}`}>
                                    <span className="speaker-label">{t.participantName}</span>
                                    <span className="transcript-text">{t.text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div ref={transcriptEndRef} />
                </div>
                {chatMessages.length > 0 && (
                    <div className="chat-overlay scrollbar-hide">
                        {chatMessages.map((m, i) => (
                            <div key={i} className="chat-bubble-row"><div className={`chat-bubble ${m.from?.identity === localParticipant.identity ? 'me' : 'agent'}`}>{m.message}</div></div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="call-footer">
                <div className="input-pill">
                    <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendChat()} placeholder="Type a message..." disabled={!isConnected} />
                    <button onClick={handleSendChat} disabled={!inputText.trim() || isSending} className="send-btn"><Send size={18} fill="currentColor" /></button>
                </div>
            </div>
            <RoomAudioRenderer />
        </div>
    );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────
const Dynamic = () => {
    // State Machine
    const [step, setStep] = useState<FlowStep>("LEAD");

    // Data
    const [leadData, setLeadData] = useState<LeadData>({ name: "", email: "", phone: "", company: "", countryCode: "+91" });
    const [isSubmittingLead, setIsSubmittingLead] = useState(false);

    // Widget Form Data
    const [formData, setFormData] = useState({
        companyName: "",
        agentName: "Maya",
        websiteUrl: "",
        personality: "Friendly, professional, and helpful customer support agent",
    });

    // LiveKit State
    const [token, setToken] = useState<string>("");
    const [serverUrl, setServerUrl] = useState<string>("");
    const [connect, setConnect] = useState(false);
    const [creationStatus, setCreationStatus] = useState<string>("");
    const [isCreatingAgent, setIsCreatingAgent] = useState(false);

    // AI Calling State
    const [isCalling, setIsCalling] = useState(false);
    const [callStatus, setCallStatus] = useState("");

    // Calendar Slider State
    const [showCalendar, setShowCalendar] = useState(false);

    const baseurl = "https://app.snowie.ai";

    useEffect(() => {
        const saved = localStorage.getItem("ravan_demo_user_data");
        const isSubmitting=localStorage.getItem("IsSubmittingLead")=== "True"
        console.log("isSubmitting",isSubmitting)
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData((prev) => ({ ...prev, companyName: parsed.businessName || prev.companyName }));
            } catch (e) {
                // ignore
            }
        }
        if(isSubmitting){
          setStep("MENU");
        }
    }, []);

    // Country Dropdown State
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const countryDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
                setIsCountryOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCountries = COUNTRY_CODES.filter(c =>
        c.country.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.includes(countrySearch)
    );

    // ── LEAD SUBMIT ──
    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadData.name || !leadData.email || !leadData.phone) return;

        setIsSubmittingLead(true);
        const fullPhone = `${leadData.countryCode}${leadData.phone}`;
        try {
            await fetch("https://services.leadconnectorhq.com/hooks/LK2LrQP5tkIZ3ahmumnr/webhook-trigger/2YDqWleQcK5pdYFne1Wy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: leadData.name,
                    email: leadData.email,
                    receiver_number: fullPhone,
                }),
            });
        } catch (err) {
            console.error("Webhook error:", err);
        }
        // Save to localStorage for later use
        localStorage.setItem("ravan_demo_user_data", JSON.stringify({
            name: leadData.name,
            email: leadData.email,
            phone: fullPhone,
            businessName: leadData.company,
        }));
        localStorage.setItem("IsSubmittingLead","True")
        setIsSubmittingLead(false);
        setStep("MENU");
    };

    // ── WIDGET SUBMIT ──
    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.websiteUrl) return;
        setIsCreatingAgent(true);
        setCreationStatus("Analyzing your website...");

        try {
            setCreationStatus("Scraping website content...");
            const response = await axios.post(`${baseurl}/api/start-demo/`, {
                company_name: formData.companyName || formData.websiteUrl,
                agent_name: formData.agentName || "Maya",
                company_website: formData.websiteUrl,
                agent_personality: formData.personality,
            });
            const { agent_code, schema_name } = (response as any).data.response;

            setCreationStatus("Training your AI agent...");
            await new Promise((r) => setTimeout(r, 2000));
            setCreationStatus("Connecting to voice engine...");
            await new Promise((r) => setTimeout(r, 1500));
            setCreationStatus("Almost ready...");

            const tokenRes = await axios.post(`${baseurl}/api/create-room/`, {
                agent_code, provider: "thunderemotionlite", schema_name,
            });
            const newToken = tokenRes.data.response.token;
            const newServerUrl = tokenRes.data.response.url;

            if (newToken) {
                setToken(newToken);
                setServerUrl(newServerUrl);
                setStep("WIDGET_ACTIVE");
                setConnect(true);
            } else {
                throw new Error("Failed to get LiveKit token");
            }
        } catch (error) {
            console.error("Failed to create agent:", error);
            setCreationStatus("Something went wrong. Please try again.");
            setTimeout(() => setIsCreatingAgent(false), 2500);
        } finally {
            if (!token) setIsCreatingAgent(false);
        }
    };

    // ── AI CALLING ──
    const handleInitiateCall = async () => {
        setStep("CALLING");
        setIsCalling(true);
        const fullNumber = `${leadData.countryCode}${leadData.phone}`;
        setCallStatus(`Calling ${fullNumber}...`);

        try {
            await axios.post(
                "https://app.snowie.ai/api/trigger-call/",
                {
                    phone_number: fullNumber,
                },
            );

            setCallStatus("Call initiated! Check your phone.");
            await new Promise(r => setTimeout(r, 5000)); // Show success message for a bit
        } catch (error) {
            console.error("Failed to trigger call:", error);
            setCallStatus("Failed to initiate call. Please try again.");
            await new Promise(r => setTimeout(r, 3000)); // Show error
        } finally {
            setIsCalling(false);
            setStep("MENU");
            // Auto-open calendar after calling demo finishes
            setTimeout(() => setShowCalendar(true), 600);
        }
    };

    const handleDisconnect = () => {
        setConnect(false);
        setStep("MENU");
        setToken("");
        setServerUrl("");
        setIsCreatingAgent(false);
        setCreationStatus("");
        // Auto-open calendar after widget demo finishes
        setTimeout(() => setShowCalendar(true), 600);
    };

    // ── RENDERS ──

    // 1. LEAD CAPTURE
    if (step === "LEAD") {
        return (
            <div className="expo-bg">
                <div className="expo-container">
                    <div className="glass-card lead-card shadow-2xl">
                        <div className="lead-header-bg relative flex flex-col items-center justify-center text-center p-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#800020] to-[#a31d24] opacity-100 z-0"></div>
                            <div className="relative z-10 w-full max-w-md animate-fade-in-up px-4">
                                <h1 className="text-3xl font-extrabold text-white leading-tight mb-3 tracking-wide drop-shadow-lg uppercase">
                                    AI Impact Expo 2026
                                </h1>
                                <p className="text-lg font-semibold text-white drop-shadow-md">
                                    See What Happens When Your Website Starts Talking
                                </p>
                            </div>
                            <div className="lead-logo-box">
                                <img src={LOGO_URL} alt="Agni By Ravan.ai" />
                            </div>
                        </div>

                        <div className="lead-content pt-16">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-[#1A1A2E]">Welcome to <span className="text-[#800020]">Agni By Ravan.ai</span></h1>
                                <p className="text-sm text-gray-500 mt-1">Please fill in your details to start the demo</p>
                            </div>

                            <form onSubmit={handleLeadSubmit} className="flex flex-col gap-4">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        required
                                        value={leadData.name}
                                        onChange={e => setLeadData({ ...leadData, name: e.target.value })}
                                        className="modern-input"
                                        placeholder="Full Name *"
                                    />
                                </div>

                                <div className="form-group phone-group">
                                    <div className="country-select-wrapper" ref={countryDropdownRef}>
                                        <div
                                            className="country-select-trigger"
                                            onClick={() => setIsCountryOpen(!isCountryOpen)}
                                        >
                                            <span className="selected-code">{leadData.countryCode}</span>
                                            <ChevronDown size={14} className={`country-arrow ${isCountryOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        {isCountryOpen && (
                                            <div className="country-dropdown-menu">
                                                <div className="country-search-box">
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={countrySearch}
                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                        autoFocus
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                <div className="country-list scrollbar-hide">
                                                    {filteredCountries.map((c) => (
                                                        <div
                                                            key={`${c.country}-${c.code}`}
                                                            className="country-option"
                                                            onClick={() => {
                                                                setLeadData({ ...leadData, countryCode: c.code });
                                                                setIsCountryOpen(false);
                                                                setCountrySearch("");
                                                            }}
                                                        >
                                                            <span className="c-flag">{c.country}</span>
                                                            <span className="c-code">{c.code}</span>
                                                        </div>
                                                    ))}
                                                    {filteredCountries.length === 0 && (
                                                        <div className="p-3 text-sm text-gray-400 text-center">No results</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        value={leadData.phone}
                                        onChange={e => setLeadData({ ...leadData, phone: e.target.value })}
                                        className="modern-input phone-input"
                                        placeholder="Phone number"
                                    />
                                </div>

                                <div className="form-group">
                                    <input
                                        type="email"
                                        required
                                        value={leadData.email}
                                        onChange={e => setLeadData({ ...leadData, email: e.target.value })}
                                        className="modern-input"
                                        placeholder="Email Address *"
                                    />
                                </div>

                                <div className="form-group">
                                    <input
                                        type="text"
                                        value={leadData.company}
                                        onChange={e => setLeadData({ ...leadData, company: e.target.value })}
                                        className="modern-input"
                                        placeholder="Company Name (Optional)"
                                    />
                                </div>

                                <button type="submit" disabled={isSubmittingLead} className="modern-submit-btn">
                                    {isSubmittingLead ? <Loader2 className="animate-spin" /> : <>Continue to Demo <ArrowRight size={18} /></>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 2. SELECTION MENU
    if (step === "MENU") {
        return (
            <div className="expo-bg">
                <div className="expo-container">
                    <div className="menu-page">
                        {/* Header */}
                        <div className="menu-hero">
                            <div className="menu-chip">
                                <span className="menu-chip-dot" />
                                <Sparkles size={13} />
                                <span>Live Demo</span>
                            </div>
                            <h1 className="menu-h1">
                                Choose Your<br />
                                <span className="menu-h1-accent">AI Experience</span>
                            </h1>
                            <p className="menu-lead">
                                Pick a demo and experience AI that talks, calls, and converts — powered by Agni By Ravan.ai
                            </p>
                        </div>

                        {/* Cards */}
                        <div className="menu-cards">
                            {/* Card 1 — Voice Widget */}
                            <div className="m-card m-card-1" onClick={() => setStep("WIDGET_FORM")}>
                                <div className="m-card-shimmer" />
                                <div className="m-card-body">
                                    <div className="m-card-head">
                                        <div className="m-icon m-icon-rose">
                                            <MessageSquare size={26} strokeWidth={2.2} />
                                        </div>
                                        <span className="m-live"><span className="m-live-dot" /> LIVE</span>
                                    </div>
                                    <h2 className="m-card-name">AI Voice Widget</h2>
                                    <p className="m-card-text">
                                        Drop an AI agent on your website that <strong>speaks to visitors</strong>, answers questions, and turns traffic into qualified leads — 24/7.
                                    </p>
                                    <div className="m-pills">
                                        <span>🎙️ Real-time Voice</span>
                                        <span>🌐 Any Website</span>
                                        <span>⚡ 60s Setup</span>
                                    </div>
                                    <div className="m-cta">
                                        <span>Build Your Agent</span>
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 — AI Calling */}
                            <div className="m-card m-card-2" onClick={handleInitiateCall}>
                                <div className="m-card-shimmer" />
                                <div className="m-card-body">
                                    <div className="m-card-head">
                                        <div className="m-icon m-icon-amber">
                                            <Phone size={26} strokeWidth={2.2} />
                                        </div>
                                        <span className="m-live"><span className="m-live-dot" /> LIVE</span>
                                    </div>
                                    <h2 className="m-card-name">AI Phone Caller</h2>
                                    <p className="m-card-text">
                                        Get a <strong>live AI call right now</strong>. Our agent handles calls, books meetings, follows up — and never takes a break.
                                    </p>
                                    <div className="m-pills">
                                        <span>📞 Instant Call</span>
                                        <span>📅 Auto Booking</span>
                                        <span>🔄 Smart Follow-up</span>
                                    </div>
                                    <div className="m-cta">
                                        <span>Call Me Now</span>
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="menu-brand">
                            Powered by <strong>Agni By Ravan.ai</strong> · Enterprise AI Platform
                        </p>
                    </div>
                </div>

                {/* Book a Call — Fixed Side Tab */}
                <div className="cal-tab" onClick={() => setShowCalendar(true)}>
                    <Calendar size={16} />
                    <span>Book a Call</span>
                </div>

                {/* Calendar Slider Overlay */}
                {showCalendar && (
                    <div className="cal-overlay" onClick={() => setShowCalendar(false)}>
                        <div className="cal-panel" onClick={(e) => e.stopPropagation()}>
                            <div className="cal-panel-header">
                                <h3 className="cal-panel-title">Book a Call</h3>
                                <button className="cal-close" onClick={() => setShowCalendar(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <iframe
                                src="https://link.ravan.ai/widget/booking/z0y3cgJJ3zTzb7hW7bLg"
                                style={{ width: "100%", height: "calc(100% - 56px)", border: "none", overflow: "hidden" }}
                                scrolling="no"
                                title="Book a Call"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 3. WIDGET FORM (Existing)
    if (step === "WIDGET_FORM") {
        return (
            <div className="expo-bg">
                <div className="expo-container">
                    <div className="glass-card form-page">
                        <div className="form-header">
                            <div className="form-logo"><img src={LOGO_URL} alt="Agni By Ravan.ai" /></div>
                            <div className="expo-badge">AI Impact Expo 2026</div>
                            <h1 className="form-title">Build Your AI Agent<br />in Seconds</h1>
                            <p className="form-subtitle">Enter your website and watch your custom AI voice agent come to life</p>
                        </div>
                        <form onSubmit={handleCreateAgent} className="form-fields">
                            <div className="field">
                                <label className="field-label">Agent Name</label>
                                <input type="text" value={formData.agentName} onChange={(e) => setFormData({ ...formData, agentName: e.target.value })} className="field-input" placeholder="Maya" />
                            </div>
                            <div className="field">
                                <label className="field-label">Website URL <span className="req">*</span></label>
                                <input type="text" required value={formData.websiteUrl} onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })} className="field-input" placeholder="https://yourcompany.com" />
                            </div>
                            <button type="submit" disabled={isCreatingAgent} className="modern-submit-btn">
                                {isCreatingAgent ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>{creationStatus || "Creating..."}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        <span>Create & Start Talking</span>
                                    </>
                                )}
                            </button>
                            <button type="button" onClick={() => setStep("MENU")} className="text-sm text-gray-400 mt-2 hover:text-gray-600 transition-colors">Start Over</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // 4. CALLING ACTIVE
    if (step === "CALLING") {
        return (
            <div className="expo-bg">
                <div className="expo-container">
                    <div className="glass-card form-page flex flex-col items-center justify-center text-center">
                        <div className="p-6 bg-orange-50 rounded-full mb-6 relative">
                            <Phone size={48} className="text-[#FF6B2C]" />
                            {isCalling && <div className="absolute inset-0 rounded-full animate-ping bg-orange-200 opacity-50"></div>}
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-[#1A1A2E]">Calling You Now</h2>
                        <p className="text-[#6E6E80] mb-8 max-w-xs">{callStatus}</p>
                        <button onClick={() => setStep("MENU")} className="text-sm font-semibold text-[#FF6B2C] hover:underline">Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    // 5. WIDGET ACTIVE (LiveKit)
    return (
        <div className="expo-bg">
            <div className="expo-container">
                {token && (
                    <LiveKitRoom
                        video={false} audio={true}
                        token={token} serverUrl={serverUrl}
                        connect={connect} data-lk-theme="default"
                        onDisconnected={() => setConnect(false)}
                        style={{ width: "100%", height: "100%", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <RoomContent onClose={handleDisconnect} agentName={formData.agentName} />
                    </LiveKitRoom>
                )}
            </div>
        </div>
    );
};

export default Dynamic;