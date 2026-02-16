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

    // Only scroll transcripts, not chat
    // useEffect(() => { 
    //     transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
    // }, [transcripts]);

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
        <div className="w-full max-w-[480px] h-[720px] bg-white rounded-[28px] shadow-[0_24px_60px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden animate-[widgetCardEnter_0.5s_cubic-bezier(0.16,1,0.3,1)] mx-auto">
            <style>{`
                @keyframes widgetCardEnter {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes timerBarEnter {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes timerPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.8); }
                }
                @keyframes ringPulse1 {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.15); opacity: 0.4; }
                }
                @keyframes ringPulse2 {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.3; }
                }
                @keyframes pulseOrb {
                    0% { transform: scale(1); box-shadow: 0 0 0 rgba(255, 107, 44, 0); }
                    100% { transform: scale(1.1); box-shadow: 0 0 20px rgba(255, 107, 44, 0.4); }
                }
            `}</style>

            {/* Header */}
            <div className="relative p-5 px-6 flex items-center justify-between bg-gradient-to-b from-[#80002008] to-transparent border-b border-black/5 flex-shrink-0 min-h-[80px]">
                {/* Maroon accent strip */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#800020] via-[#B8002B] to-[#D4A017] rounded-t-[28px]" />

                <div className="flex flex-col justify-center">
                    <div className="text-xl font-extrabold text-[#1A1A2E] tracking-tight">{agentName}</div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6E6E80] mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-gray-300'} transition-all`} />
                        {getStatusText()}
                    </div>
                </div>

                {/* Center Orb */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none">
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Orb rings */}
                        <div className={`absolute w-14 h-14 rounded-full border-[1.5px] border-[#80002014] transition-all ${isSpeaking ? 'border-[#80002033] animate-[ringPulse1_1.4s_ease-in-out_infinite]' : ''}`} />
                        <div className={`absolute w-16 h-16 rounded-full border-[1.5px] border-[#80002014] transition-all ${isSpeaking ? 'border-[#8000201f] animate-[ringPulse2_1.4s_ease-in-out_infinite_0.2s]' : ''}`} />

                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br from-[#800020] to-[#B8002B] flex items-center justify-center z-10 shadow-[0_6px_16px_rgba(128,0,32,0.3)] transition-all ${isSpeaking ? 'animate-[pulseOrb_1s_infinite_alternate] shadow-[0_8px_24px_rgba(128,0,32,0.4)]' : ''} ${isListening ? 'shadow-[0_6px_20px_rgba(128,0,32,0.25)]' : ''}`}>
                            <img src={LOGO_URL} alt="Agent" className="w-5 h-5 brightness-[10]" />
                        </div>
                    </div>
                    {(isSpeaking || isListening) && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 flex items-center justify-center">
                            <BarVisualizer
                                state={state}
                                trackRef={audioTrack}
                                barCount={7}
                                style={{ width: "100%", height: "100%", "--lk-va-bar-color": "#800020", background: "transparent" } as React.CSSProperties}
                            />
                        </div>
                    )}
                </div>

                <div className="flex gap-2.5">
                    <button
                        onClick={toggleMute}
                        className={`w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center cursor-pointer text-[#6E6E80] transition-all hover:bg-gray-50 hover:-translate-y-0.5 ${isMuted ? 'bg-[#8000200a] text-[#800020] border-[#80002033]' : ''}`}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full border border-red-100 bg-red-50 flex items-center justify-center cursor-pointer text-red-500 transition-all hover:bg-red-100"
                    >
                        <PhoneOff size={20} />
                    </button>
                </div>
            </div>

            {/* Timer Bar */}
            {isConnected && (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#80002008] to-[#D4A01708] border-b border-black/[0.04] flex-shrink-0 animate-[timerBarEnter_0.4s_ease]">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-[timerPulse_1.5s_ease-in-out_infinite]" />
                    <span className="text-[0.68rem] font-bold uppercase tracking-wider text-red-500">Live</span>
                    <span className="text-xs font-bold text-[#1A1A2E] tabular-nums tracking-tight">{formatTime(callSeconds)}</span>
                    <span className="ml-auto text-[0.65rem] font-extrabold text-[#800020] uppercase tracking-wider opacity-60">Agni</span>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 relative flex flex-col bg-[#FAFAFA] overflow-hidden">
                {/* Transcript Stream */}
                <div
                    className="flex-1 overflow-y-auto p-5 px-6 flex flex-col gap-3 [mask-image:linear-gradient(to_bottom,transparent_0%,black_5%,black_95%,transparent_100%)]"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style>{`.flex-1::-webkit-scrollbar { display: none; }`}</style>

                    {transcripts.length === 0 && chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-1">
                            <div className="w-14 h-14 rounded-full bg-[#8000200a] flex items-center justify-center text-[#80002026] mb-2">
                                <Activity size={36} />
                            </div>
                            <p className="text-sm font-semibold text-[#ADADB8]">Conversation will appear here...</p>
                            <p className="text-xs text-[#CCCCD2]">Start speaking or type a message below</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {transcripts.map((t) => (
                                <div
                                    key={t.id}
                                    className={`text-sm leading-relaxed text-[#6E6E80] animate-[fadeIn_0.3s_ease-out] px-3 py-2 rounded-xl transition-colors ${t.participantName === "You" ? 'bg-black/[0.02]' : 'bg-[#80002005]'} ${!t.isFinal ? 'opacity-50' : ''}`}
                                >
                                    <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                                    <span className="font-bold text-[#800020] text-[0.7rem] mr-2 uppercase tracking-wider">{t.participantName === "You" ? <span className="text-[#1A1A2E]">{t.participantName}</span> : t.participantName}</span>
                                    <span>{t.text}</span>
                                </div>
                            ))}
                            <div ref={transcriptEndRef} />
                        </div>
                    )}
                </div>

                {/* Chat Overlay - No auto-scroll */}
                {chatMessages.length > 0 && (
                    <div
                        className="absolute bottom-0 left-0 right-0 max-h-[40%] overflow-y-auto pointer-events-none flex flex-col justify-end p-4 gap-2 bg-gradient-to-t from-[#fafafafa] to-transparent"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {chatMessages.map((m, i) => (
                            <div key={i} className="flex w-full justify-end pointer-events-auto pt-1">
                                <div className={`px-3.5 py-2 rounded-2xl text-sm max-w-[80%] shadow-sm ${m.from?.identity === localParticipant.identity ? 'bg-gradient-to-br from-[#800020] to-[#B8002B] text-white rounded-br' : 'bg-white text-[#1A1A2E] border border-gray-200 self-start rounded-bl'}`}>
                                    {m.message}
                                </div>
                            </div>
                        ))}
                        {/* Removed chatEndRef from here */}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3.5 px-5 bg-white border-t border-black/5 flex-shrink-0">
                <div className="flex items-center bg-[#F5F5F7] rounded-full px-4.5 py-1.5 pr-1.5 border border-transparent transition-all focus-within:bg-white focus-within:border-[#8000204d] focus-within:shadow-[0_0_0_3px_rgba(128,0,32,0.06)]">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                        placeholder="Type a message..."
                        disabled={!isConnected}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-[#1A1A2E]"
                    />
                    <button
                        onClick={handleSendChat}
                        disabled={!inputText.trim() || isSending}
                        className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#800020] to-[#B8002B] text-white border-none flex items-center justify-center cursor-pointer transition-all shadow-[0_2px_8px_rgba(128,0,32,0.2)] hover:scale-110 hover:shadow-[0_4px_12px_rgba(128,0,32,0.3)] disabled:bg-zinc-300 disabled:shadow-none disabled:scale-100"
                    >
                        <Send size={18} fill="currentColor" />
                    </button>
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
        phone: "",
        name: "",
        email: ""
    });
    console.log("formData", formData)

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

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(parsed);
            } catch (e) {
                // ignore
            }
        }
        if (saved) {
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

        // ✅ Save with correct field names
        const userData = {
            name: leadData.name,
            email: leadData.email,
            phone: fullPhone,
            companyName: leadData.company,  // Changed from businessName
            agentName: "Maya",
            websiteUrl: "",
            personality: "Friendly, professional, and helpful customer support agent"
        };

        localStorage.setItem("ravan_demo_user_data", JSON.stringify(userData));
        setFormData(userData);  // Also update formData state
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
        const fullNumber = formData.phone;
        setCallStatus(`Calling ${fullNumber}...`);

        try {
            await axios.post(
                "https://app.snowie.ai/api/trigger-call/",
                {
                    agent_code: "2c071721-531f-4d57-89fa-45943429e6d1",
                    schema_name: "6af30ad4-a50c-4acc-8996-d5f562b6987f",
                    phone_number: fullNumber,
                    provider: "thunderemotionlite",
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                },
            );

            setCallStatus("Call initiated! Check your phone.");
            await new Promise(r => setTimeout(r, 5000));
        } catch (error) {
            console.error("Failed to trigger call:", error);
            setCallStatus("Failed to initiate call. Please try again.");
            await new Promise(r => setTimeout(r, 3000));
        } finally {
            setIsCalling(false);
            setStep("MENU");
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
        setTimeout(() => setShowCalendar(true), 600);
    };

    // ── RENDERS ──

    // 1. LEAD CAPTURE
    if (step === "LEAD") {
        return (
            <div className="fixed  inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl z-50">
                <style>{`
                    @keyframes bgPulse {
                        0% { opacity: 0.8; }
                        100% { opacity: 1; }
                    }
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>

                <div className="relative z-10  flex items-center justify-center w-full h-full p-6">
                    <div className="w-full max-w-[440px] h-[530px] lg:h-[700px] rounded-3xl overflow-hidden bg-white border-none shadow-[0_24px_60px_-12px_rgba(50,50,93,0.1),0_12px_36px_-8px_rgba(0,0,0,0.05)]">


                        <div className="relative flex flex-col items-center justify-center text-center p-6  lg:pb-[60px] z-10 shadow-[0_4px_20px_rgba(128,0,32,0.25)] bg-gradient-to-br from-[#800020] to-[#a31d24]">
                            <button
                                onClick={() => { setStep("MENU"); }}
                                aria-label="Close"
                                className="absolute top-3 right-2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 hover:scale-105 transition-all duration-200"
                            >
                                ✕
                            </button>
                            <div className="absolute inset-0 pointer-events-none" style={{
                                background: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 40%)'
                            }} />

                            <div className="relative flex justify-center items-center z-10 w-full max-w-md  px-2 gap-2">
                                <img className="w-10 h-10 rounded" src="https://storage.googleapis.com/msgsndr/LK2LrQP5tkIZ3ahmumnr/media/69923c621d5e0441112aa1b7.jpeg" alt="" />
                                <h1 className=" text-lg font-extrabold text-white leading-tight mb- tracking-wide drop-shadow-lg uppercase">
                                    India AI Impact Summit 2026
                                </h1>

                            </div>

                            <div className="flex items-center justify-center hidden lg:block absolute bottom-[-50px] w-[100px] h-[100px] bg-white rounded-3xl shadow-[0_16px_40px_rgba(243,108,33,0.2)] p-2  border-4 border-white">
                                <img src={LOGO_URL} alt="Agni By Ravan.ai" className="w-full h-full object-contain" />
                            </div>
                        </div>


                        <div className="pt-5 lg:pt-16 px-8 pb-10">
                            <div className="text-center mb-6">
                                <h1 className="text-xl font-bold text-[#1A1A2E]">Welcome to <span className="text-[#800020]"> Ravan.ai</span></h1>
                                <p className="text-sm text-gray-500 mt-1">Please fill in your details to start the demo</p>
                            </div>

                            <form onSubmit={handleLeadSubmit} className="flex flex-col gap-4">
                                <div>
                                    <input
                                        type="text"
                                        required
                                        value={leadData.name}
                                        onChange={e => setLeadData({ ...leadData, name: e.target.value })}
                                        className="w-full px-4 py-2 lg:py-4 rounded-[14px] border border-[#EAEAEA] bg-[#F8F9FC] text-base text-[#1A1A2E] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] focus:bg-white focus:border-[#F36C21] focus:shadow-[0_4px_12px_rgba(243,108,33,0.15),0_0_0_2px_rgba(243,108,33,0.05)] focus:-translate-y-0.5 placeholder:text-[#BBB]"
                                        placeholder="Full Name *"
                                    />
                                </div>

                                <div className="flex gap-2.5">
                                    <div className="relative min-w-[90px]" ref={countryDropdownRef}>
                                        <div
                                            className="flex items-center justify-between w-full h-full px-3 bg-[#F9F9FB] border border-[#EBEBEB] rounded-xl cursor-pointer transition-all text-[#333] font-medium hover:bg-white hover:border-[#DDD] hover:shadow-sm"
                                            onClick={() => setIsCountryOpen(!isCountryOpen)}
                                        >
                                            <span>{leadData.countryCode}</span>
                                            <ChevronDown size={14} className={`transition-transform text-[#888] ml-1.5 ${isCountryOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        {isCountryOpen && (
                                            <div className="absolute top-[120%] left-0 w-[300px] max-h-[320px] bg-white border border-[#F0F0F0] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-[100] overflow-hidden flex flex-col animate-[fadeIn_0.15s_ease-out]">
                                                <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
                                                <div className="p-3 border-b border-[#F5F5F5] bg-[#FAFAFA]">
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={countrySearch}
                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                        autoFocus
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full px-3 py-2.5 rounded-lg border border-[#E5E5E5] text-sm outline-none transition-all focus:border-[#FF6B2C] focus:shadow-[0_0_0_3px_rgba(255,107,44,0.1)] focus:bg-white"
                                                    />
                                                </div>
                                                <div className="overflow-y-auto flex-1 max-h-60" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                                    <style>{`.overflow-y-auto::-webkit-scrollbar { display: none; }`}</style>
                                                    {filteredCountries.map((c) => (
                                                        <div
                                                            key={`${c.country}-${c.code}`}
                                                            className="px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors border-b border-[#FAFAFA] last:border-b-0 hover:bg-[#FFF5F0]"
                                                            onClick={() => {
                                                                setLeadData({ ...leadData, countryCode: c.code });
                                                                setIsCountryOpen(false);
                                                                setCountrySearch("");
                                                            }}
                                                        >
                                                            <span className="text-sm text-[#333] font-medium">{c.country}</span>
                                                            <span className="text-[0.85rem] text-[#888] font-mono bg-[#F5F5F5] px-1.5 py-0.5 rounded-md">{c.code}</span>
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
                                        className="flex-1 px-4 py-2 lg:py-4 rounded-[14px] border border-[#EAEAEA] bg-[#F8F9FC] text-base text-[#1A1A2E] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] focus:bg-white focus:border-[#F36C21] focus:shadow-[0_4px_12px_rgba(243,108,33,0.15),0_0_0_2px_rgba(243,108,33,0.05)] focus:-translate-y-0.5 placeholder:text-[#BBB]"
                                        placeholder="Phone number"
                                    />
                                </div>

                                <div>
                                    <input
                                        type="email"
                                        required
                                        value={leadData.email}
                                        onChange={e => setLeadData({ ...leadData, email: e.target.value })}
                                        className="w-full px-4 py-2 lg:py-4 rounded-[14px] border border-[#EAEAEA] bg-[#F8F9FC] text-base text-[#1A1A2E] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] focus:bg-white focus:border-[#F36C21] focus:shadow-[0_4px_12px_rgba(243,108,33,0.15),0_0_0_2px_rgba(243,108,33,0.05)] focus:-translate-y-0.5 placeholder:text-[#BBB]"
                                        placeholder="Email Address *"
                                    />
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        value={leadData.company}
                                        onChange={e => setLeadData({ ...leadData, company: e.target.value })}
                                        className="w-full px-4 py-2 lg:py-4 rounded-[14px] border border-[#EAEAEA] bg-[#F8F9FC] text-base text-[#1A1A2E] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] focus:bg-white focus:border-[#F36C21] focus:shadow-[0_4px_12px_rgba(243,108,33,0.15),0_0_0_2px_rgba(243,108,33,0.05)] focus:-translate-y-0.5 placeholder:text-[#BBB]"
                                        placeholder="Company Name (Optional)"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingLead}
                                    className="w-full px-4 py-2 lg:py-4 bg-gradient-to-br from-[#800020] to-[#600018] text-white border-none rounded-[14px] font-bold text-lg tracking-wide mt-6 cursor-pointer shadow-[0_10px_25px_rgba(128,0,32,0.3)] transition-all flex items-center justify-center gap-2.5 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(128,0,32,0.4)] hover:bg-gradient-to-br hover:from-[#900024] hover:to-[#70001C] active:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
                                >
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
            <div className=" bg-[#F8F7F4] ">


                <div className="relative z-10 flex items-center justify-center w-full h-full p-6">
                    <div className="relative z-[2] py-12 px-8 max-w-[880px] w-full flex flex-col items-center gap-12">
                        <style>{`
                            @keyframes heroFadeIn {
                                from { opacity: 0; transform: translateY(20px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                            @keyframes chipPulse {
                                0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                                50% { opacity: 0.6; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                            }
                            @keyframes cardReveal {
                                from { opacity: 0; transform: translateY(30px) scale(0.97); }
                                to { opacity: 1; transform: translateY(0) scale(1); }
                            }
                            @keyframes shimmerBorder {
                                0% { background-position: 0% 50%; }
                                50% { background-position: 100% 50%; }
                                100% { background-position: 0% 50%; }
                            }
                        `}</style>

                        {/* Hero */}
                        <div className="text-center animate-[heroFadeIn_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
                            <div className="inline-flex items-center gap-1.5 bg-[#8000200f] border border-[#8000201f] backdrop-blur-sm px-4.5 py-1.5 rounded-full text-[0.72rem] font-bold text-[#800020] uppercase tracking-widest mb-7">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-[chipPulse_2s_ease-in-out_infinite]" />
                                <Sparkles size={13} />
                                <span>Live Demo</span>
                            </div>
                            <h1 className="text-5xl font-black text-[#1A1A2E] leading-tight tracking-tight mb-4">
                                Choose Your<br />
                                <span className="bg-gradient-to-br from-[#800020] via-[#B8002B] to-[#D4A017] bg-clip-text text-transparent">AI Experience</span>
                            </h1>
                            <p className="text-lg text-[#6E6E80] max-w-[520px] mx-auto leading-relaxed">
                                Pick a demo and experience AI that talks, calls, and converts — powered by Agni By Ravan.ai
                            </p>
                        </div>

                        {/* Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {/* Card 1 — Voice Widget */}
                            <div
                                className="relative rounded-[20px] cursor-pointer overflow-hidden opacity-0 animate-[cardReveal_0.7s_cubic-bezier(0.16,1,0.3,1)_0.15s_forwards] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2"
                                onClick={() => { formData.name && formData.phone ? setStep("WIDGET_FORM") : setStep("LEAD") }}
                            >
                                {/* Shimmer border */}
                                <div className="absolute inset-0 rounded-[20px] z-0 bg-[length:300%_300%] animate-[shimmerBorder_6s_linear_infinite] transition-all duration-400" style={{
                                    background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.08) 0%, rgba(212, 160, 23, 0.06) 50%, rgba(128, 0, 32, 0.08) 100%)',
                                    backgroundSize: '300% 300%'
                                }} />

                                {/* Card body */}
                                <div className="relative z-[1] m-[1px] bg-white/92 backdrop-blur-xl border border-white/70 rounded-[19px] p-8 flex flex-col gap-3.5 transition-all duration-[350ms] hover:bg-white hover:border-[#8000201a] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06),0_0_0_1px_rgba(128,0,32,0.04)]">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#FFF0F3] to-[#FFE0E6] text-[#800020] shadow-[0_6px_20px_rgba(128,0,32,0.1)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:-rotate-1 group-hover:shadow-[0_10px_28px_rgba(128,0,32,0.2)]">
                                            <MessageSquare size={26} strokeWidth={2.2} />
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 text-[0.65rem] font-extrabold text-emerald-500 uppercase tracking-wider bg-emerald-500/6 border border-emerald-500/12 px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-[chipPulse_2s_ease-in-out_infinite]" />
                                            LIVE
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight mt-1">AI Voice Widget</h2>
                                    <p className="text-sm text-[#6E6E80] leading-relaxed">
                                        Drop an AI agent on your website that <strong className="text-[#1A1A2E] font-semibold">speaks to visitors</strong>, answers questions, and turns traffic into qualified leads — 24/7.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                                        <span className="text-xs font-semibold bg-[#F5F5F7] text-[#555] px-2.5 py-1 rounded-full border border-black/[0.04] whitespace-nowrap transition-all duration-250 hover:bg-[#8000200d] hover:text-[#800020] hover:border-[#80002014]">🎙️ Real-time Voice</span>
                                        <span className="text-xs font-semibold bg-[#F5F5F7] text-[#555] px-2.5 py-1 rounded-full border border-black/[0.04] whitespace-nowrap transition-all duration-250 hover:bg-[#8000200d] hover:text-[#800020] hover:border-[#80002014]">🌐 Any Website</span>
                                        <span className="text-xs font-semibold bg-[#F5F5F7] text-[#555] px-2.5 py-1 rounded-full border border-black/[0.04] whitespace-nowrap transition-all duration-250 hover:bg-[#8000200d] hover:text-[#800020] hover:border-[#80002014]">⚡ 60s Setup</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm font-bold mt-2 pt-3.5 border-t border-black/[0.04] opacity-0 -translate-x-2.5 transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-100 hover:translate-x-0 text-[#800020]">
                                        <span>Build Your Agent</span>
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 — AI Calling */}
                            <div className="relative rounded-[20px] cursor-pointer overflow-hidden opacity-0 animate-[cardReveal_0.7s_cubic-bezier(0.16,1,0.3,1)_0.3s_forwards] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2"
                                onClick={() => { formData.name && formData.phone ? handleInitiateCall() : setStep("LEAD") }}>
                                {/* Shimmer border */}
                                <div className="absolute inset-0 rounded-[20px] z-0 bg-[length:300%_300%] animate-[shimmerBorder_6s_linear_infinite] transition-all duration-400" style={{
                                    background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.08) 0%, rgba(212, 160, 23, 0.06) 50%, rgba(128, 0, 32, 0.08) 100%)',
                                    backgroundSize: '300% 300%'
                                }} />

                                {/* Card body */}
                                <div className="relative z-[1] m-[1px] bg-white/92 backdrop-blur-xl border border-white/70 rounded-[19px] p-8 flex flex-col gap-3.5 transition-all duration-[350ms] hover:bg-white hover:border-[#8000201a] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06),0_0_0_1px_rgba(128,0,32,0.04)]">
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#FFF8E8] to-[#FFEDC0] text-[#B8860B] shadow-[0_6px_20px_rgba(180,130,0,0.1)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:-rotate-1 group-hover:shadow-[0_10px_28px_rgba(180,130,0,0.2)]">
                                            <Phone size={26} strokeWidth={2.2} />
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 text-[0.65rem] font-extrabold text-emerald-500 uppercase tracking-wider bg-emerald-500/6 border border-emerald-500/12 px-2.5 py-1 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-[chipPulse_2s_ease-in-out_infinite]" />
                                            LIVE
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-[#1A1A2E] tracking-tight mt-1">AI Phone Caller</h2>
                                    <p className="text-sm text-[#6E6E80] leading-relaxed">
                                        Get a <strong className="text-[#1A1A2E] font-semibold">live AI call right now</strong>. Our agent handles calls, books meetings, follows up — and never takes a break.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                                        <span className="text-xs font-semibold bg-[#F5F5F7] text-[#555] px-2.5 py-1 rounded-full border border-black/[0.04] whitespace-nowrap transition-all duration-250 hover:bg-[#8000200d] hover:text-[#800020] hover:border-[#80002014]">📞 Instant Call</span>
                                        <span className="text-xs font-semibold bg-[#F5F5F7] text-[#555] px-2.5 py-1 rounded-full border border-black/[0.04] whitespace-nowrap transition-all duration-250 hover:bg-[#8000200d] hover:text-[#800020] hover:border-[#80002014]">📅 Auto Booking</span>
                                        <span className="text-xs font-semibold bg-[#F5F5F7] text-[#555] px-2.5 py-1 rounded-full border border-black/[0.04] whitespace-nowrap transition-all duration-250 hover:bg-[#8000200d] hover:text-[#800020] hover:border-[#80002014]">🔄 Smart Follow-up</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm font-bold mt-2 pt-3.5 border-t border-black/[0.04] opacity-0 -translate-x-2.5 transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:opacity-100 hover:translate-x-0 text-[#B8860B]">
                                        <span>Call Me Now</span>
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>


                        <a target="_blank"
                            href="https://rzp.io/rzp/TpFhZ8yj"
                            rel="noopener noreferrer"
                            className="group relative mx-auto mt-6 flex items-center justify-between w-[320px] rounded-full bg-gradient-to-r from-black via-gray-900 to-black px-6 py-4 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25),0_0_0_1px_rgba(199,119,58,0.1)] transition-all duration-500 hover:shadow-[0_16px_40px_rgba(199,119,58,0.45),0_0_0_2px_rgba(199,119,58,0.3)] hover:scale-105 active:scale-95"
                        >
                            {/* Animated gradient overlay */}
                            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C7773A] via-[#E89D5E] to-[#C7773A] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>

                            {/* Shimmer effect */}
                            <span className="absolute inset-0 rounded-full overflow-hidden">
                                <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]"></span>
                            </span>

                            {/* Button text */}
                            <span className="relative z-10 mx-auto font-extrabold tracking-wide text-[15px] transition-all duration-300 group-hover:text-black drop-shadow-sm">
                                Claim Your Spot
                            </span>

                            {/* Arrow icon */}
                            <span className="relative z-10 ml-4 flex h-10 w-10  items-center justify-center rounded-full bg-white text-black transition-all duration-500 group-hover:bg-black group-hover:text-white  shadow-lg">
                                <span className="text-xl font-bold"><ArrowRight /></span>
                            </span>
                        </a>





                        <p className="text-xs text-[#AAAAAA] text-center tracking-wide">
                            Powered by <strong className="text-[#800020] font-bold">Agni By Ravan.ai</strong> · Enterprise AI Platform
                        </p>
                    </div>
                </div>

                {/* Book a Call — Fixed Side Tab */}
                <div
                    className="fixed right-0 top-1/2 -translate-y-1/2 z-[900] flex items-center gap-1.5 bg-gradient-to-br from-[#800020] to-[#B8002B] text-white text-xs font-bold tracking-wide px-3.5 py-2.5 rounded-l-[10px] cursor-pointer [writing-mode:vertical-rl] [text-orientation:mixed] shadow-[-3px_0_16px_rgba(128,0,32,0.2)] transition-all duration-300 hover:pr-4.5 hover:shadow-[-6px_0_24px_rgba(128,0,32,0.35)]"
                    onClick={() => setShowCalendar(true)}
                >
                    <Calendar size={16} />
                    <span>Book a Call</span>
                </div>

                {/* Calendar Slider Overlay */}
                {showCalendar && (
                    <div
                        className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex justify-end animate-[calFadeIn_0.35s_cubic-bezier(0.16,1,0.3,1)]"
                        onClick={() => setShowCalendar(false)}
                    >
                        <style>{`
                            @keyframes calFadeIn {
                                from { opacity: 0; backdrop-filter: blur(0); }
                                to { opacity: 1; backdrop-filter: blur(4px); }
                            }
                            @keyframes calSlideIn {
                                from { transform: translateX(100%); opacity: 0.5; }
                                to { transform: translateX(0); opacity: 1; }
                            }
                        `}</style>
                        <div
                            className="w-[440px] max-w-[92vw] h-full bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.12)] flex flex-col animate-[calSlideIn_0.45s_cubic-bezier(0.22,1,0.36,1)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0F0F2]">
                                <h3 className="text-lg font-extrabold text-[#1A1A2E] tracking-tight">Book a Call</h3>
                                <button
                                    className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-[#F5F5F7] text-[#666] cursor-pointer transition-all duration-200 hover:bg-[#E8E8EC] hover:text-[#1A1A2E]"
                                    onClick={() => setShowCalendar(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <iframe
                                src="https://link.ravan.ai/widget/booking/z0y3cgJJ3zTzb7hW7bLg"
                                style={{ width: "100%", height: "calc(100% - 56px)", border: "none" }}
                                scrolling="yes"
                                title="Book a Call"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 3. WIDGET FORM
    if (step === "WIDGET_FORM") {
        return (
            <div className="bg-[#F8F7F4]">

                <div className="relative z-10 flex items-center justify-center w-full h-full p-6">
                    <div className="w-full max-w-[440px] py-12 px-10 bg-white/98 backdrop-blur-xl border border-black/[0.08] rounded-[28px] shadow-[0_24px_60px_-12px_rgba(50,50,93,0.1),0_12px_36px_-8px_rgba(0,0,0,0.05)]">
                        <div className="text-center mb-10 flex flex-col items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B2C] to-[#FF9F4A] rounded-[18px] p-3 shadow-[0_8px_20px_rgba(255,107,44,0.3)]">
                                <img src={LOGO_URL} alt="Agni" className="w-full h-full object-contain brightness-[10]" />
                            </div>
                            <div className="inline-block bg-[#8000201a] text-[#800020] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#80002026]">
                                AI Impact Expo 2026
                            </div>
                            <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight">
                                Build Your AI Agent<br />in Seconds
                            </h1>
                            <p className="text-[#6E6E80] text-[0.95rem] mt-2">
                                Enter your website and watch your custom AI voice agent come to life
                            </p>
                        </div>

                        <form onSubmit={handleCreateAgent} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-[#6E6E80] mb-1.5">Agent Name</label>
                                <input
                                    type="text"
                                    value={formData.agentName}
                                    onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                                    className="w-full px-4 py-3.5 rounded-[14px] border border-[#E2E2E2] text-base outline-none transition-all bg-white focus:border-[#FF6B2C] focus:shadow-[0_0_0_3px_rgba(255,107,44,0.1)]"
                                    placeholder="Maya"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-[#6E6E80] mb-1.5">
                                    Website URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.websiteUrl}
                                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                    className="w-full px-4 py-3.5 rounded-[14px] border border-[#E2E2E2] text-base outline-none transition-all bg-white focus:border-[#FF6B2C] focus:shadow-[0_0_0_3px_rgba(255,107,44,0.1)]"
                                    placeholder="https://yourcompany.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isCreatingAgent}
                                className="w-full px-4 py-4 bg-gradient-to-br from-[#800020] to-[#600018] text-white border-none rounded-[14px] font-bold text-lg tracking-wide mt-6 cursor-pointer shadow-[0_10px_25px_rgba(128,0,32,0.3)] transition-all flex items-center justify-center gap-2.5 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(128,0,32,0.4)] hover:bg-gradient-to-br hover:from-[#900024] hover:to-[#70001C] active:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
                            >
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
                            <a target="_blank"
                                href="https://rzp.io/rzp/TpFhZ8yj"
                                rel="noopener noreferrer"
                                className="group relative mx-auto mt-6 flex items-center justify-between w-[320px] rounded-full bg-gradient-to-r from-black via-gray-900 to-black px-6 py-4 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25),0_0_0_1px_rgba(199,119,58,0.1)] transition-all duration-500 hover:shadow-[0_16px_40px_rgba(199,119,58,0.45),0_0_0_2px_rgba(199,119,58,0.3)] hover:scale-105 active:scale-95"
                            >
                                {/* Animated gradient overlay */}
                                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C7773A] via-[#E89D5E] to-[#C7773A] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>

                                {/* Shimmer effect */}
                                <span className="absolute inset-0 rounded-full overflow-hidden">
                                    <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]"></span>
                                </span>

                                {/* Button text */}
                                <span className="relative z-10 mx-auto font-extrabold tracking-wide text-[15px] transition-all duration-300 group-hover:text-black drop-shadow-sm">
                                    Claim Your Spot
                                </span>

                                {/* Arrow icon */}
                                <span className="relative z-10 ml-4 flex h-10 w-10  items-center justify-center rounded-full bg-white text-black transition-all duration-500 group-hover:bg-black group-hover:text-white  shadow-lg">
                                    <span className="text-xl font-bold"><ArrowRight /></span>
                                </span>
                            </a>
                            <button
                                type="button"
                                onClick={() => setStep("MENU")}
                                className="text-sm text-gray-400 mt-2 hover:text-gray-600 transition-colors"
                            >
                                Start Over
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // 4. CALLING ACTIVE
    if (step === "CALLING") {
        return (
            <div className=" bg-[#F8F7F4]">


                <div className="relative z-10 flex items-center justify-center w-full h-full p-6">
                    <div className="w-full max-w-[440px] py-12 px-10 bg-white/98 backdrop-blur-xl border border-black/[0.08] rounded-[28px] shadow-[0_24px_60px_-12px_rgba(50,50,93,0.1),0_12px_36px_-8px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center">
                        <div className="relative p-6 bg-orange-50 rounded-full mb-6">
                            <Phone size={48} className="text-[#FF6B2C]" />
                            {isCalling && <div className="absolute inset-0 rounded-full animate-ping bg-orange-200 opacity-50" />}
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-[#1A1A2E]">Calling You Now</h2>
                        <p className="text-[#6E6E80] mb-8 max-w-xs">{callStatus}</p>
                        <button
                            onClick={() => setStep("MENU")}
                            className="text-sm font-semibold text-[#FF6B2C] hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }



    // 5. WIDGET ACTIVE (LiveKit)
    return (
        <div className=" bg-[#F8F7F4]">


            <div className="relative z-10 flex items-center justify-center w-full h-full p-6">
                {token && (
                    <LiveKitRoom
                        video={false}
                        audio={true}
                        token={token}
                        serverUrl={serverUrl}
                        connect={connect}
                        data-lk-theme="default"
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