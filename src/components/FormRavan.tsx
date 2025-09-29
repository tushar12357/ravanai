import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Send,
  X,
  Minimize2,
  Pause,
  Volume2,
  VolumeX,
  ChevronsUpDown,
} from "lucide-react";
import { MicOff } from "lucide-react";
import axios from "axios";
import { UltravoxSession } from "ultravox-client";
import useSessionStore from "../store/session";
import { useWidgetContext } from "../constexts/WidgetContext";
import { useUltravoxStore } from "../store/ultrasession";
import logo from "../assets/logo.png";

const countryCodes = [
  { code: "+93", name: "Afghanistan" },
  { code: "+355", name: "Albania" },
  { code: "+213", name: "Algeria" },
  { code: "+1 684", name: "American Samoa" },
  { code: "+376", name: "Andorra" },
  { code: "+244", name: "Angola" },
  { code: "+1 264", name: "Anguilla" },
  { code: "+1 268", name: "Antigua and Barbuda" },
  { code: "+54", name: "Argentina" },
  { code: "+374", name: "Armenia" },
  { code: "+297", name: "Aruba" },
  { code: "+247", name: "Ascension Island" },
  { code: "+61", name: "Australia" },
  { code: "+672", name: "Australian External Territories" },
  { code: "+43", name: "Austria" },
  { code: "+994", name: "Azerbaijan" },
  { code: "+1 242", name: "Bahamas" },
  { code: "+973", name: "Bahrain" },
  { code: "+880", name: "Bangladesh" },
  { code: "+1 246", name: "Barbados" },
  { code: "+375", name: "Belarus" },
  { code: "+32", name: "Belgium" },
  { code: "+501", name: "Belize" },
  { code: "+229", name: "Benin" },
  { code: "+1 441", name: "Bermuda" },
  { code: "+975", name: "Bhutan" },
  { code: "+591", name: "Bolivia" },
  { code: "+387", name: "Bosnia and Herzegovina" },
  { code: "+267", name: "Botswana" },
  { code: "+55", name: "Brazil" },
  { code: "+246", name: "British Indian Ocean Territory" },
  { code: "+1 284", name: "British Virgin Islands" },
  { code: "+673", name: "Brunei" },
  { code: "+359", name: "Bulgaria" },
  { code: "+226", name: "Burkina Faso" },
  { code: "+257", name: "Burundi" },
  { code: "+855", name: "Cambodia" },
  { code: "+237", name: "Cameroon" },
  { code: "+1", name: "Canada" },
  { code: "+238", name: "Cape Verde" },
  { code: "+1 345", name: "Cayman Islands" },
  { code: "+236", name: "Central African Republic verwenden" },
  { code: "+235", name: "Chad" },
  { code: "+56", name: "Chile" },
  { code: "+86", name: "China" },
  { code: "+61", name: "Christmas Island" },
  { code: "+61", name: "Cocos (Keeling) Islands" },
  { code: "+57", name: "Colombia" },
  { code: "+269", name: "Comoros" },
  { code: "+242", name: "Congo (Republic)" },
  { code: "+243", name: "Congo (Democratic Republic)" },
  { code: "+682", name: "Cook Islands" },
  { code: "+506", name: "Costa Rica" },
  { code: "+385", name: "Croatia" },
  { code: "+53", name: "Cuba" },
  { code: "+357", name: "Cyprus" },
  { code: "+420", name: "Czech Republic" },
  { code: "+45", name: "Denmark" },
  { code: "+253", name: "Djibouti" },
  { code: "+1 767", name: "Dominica" },
  { code: "+1 809", name: "Dominican Republic" },
  { code: "+670", name: "East Timor (Timor-Leste)" },
  { code: "+593", name: "Ecuador" },
  { code: "+20", name: "Egypt" },
  { code: "+503", name: "El Salvador" },
  { code: "+240", name: "Equatorial Guinea" },
  { code: "+291", name: "Eritrea" },
  { code: "+372", name: "Estonia" },
  { code: "+268", name: "Eswatini" },
  { code: "+251", name: "Ethiopia" },
  { code: "+500", name: "Falkland Islands" },
  { code: "+298", name: "Faroe Islands" },
  { code: "+679", name: "Fiji" },
  { code: "+358", name: "Finland" },
  { code: "+33", name: "France" },
  { code: "+594", name: "French Guiana" },
  { code: "+689", name: "French Polynesia" },
  { code: "+241", name: "Gabon" },
  { code: "+220", name: "Gambia" },
  { code: "+995", name: "Georgia" },
  { code: "+49", name: "Germany" },
  { code: "+233", name: "Ghana" },
  { code: "+350", name: "Gibraltar" },
  { code: "+30", name: "Greece" },
  { code: "+299", name: "Greenland" },
  { code: "+1 473", name: "Grenada" },
  { code: "+590", name: "Guadeloupe" },
  { code: "+1 671", name: "Guam" },
  { code: "+502", name: "Guatemala" },
  { code: "+224", name: "Guinea" },
  { code: "+245", name: "Guinea-Bissau" },
  { code: "+592", name: "Guyana" },
  { code: "+509", name: "Haiti" },
  { code: "+504", name: "Honduras" },
  { code: "+852", name: "Hong Kong" },
  { code: "+36", name: "Hungary" },
  { code: "+354", name: "Iceland" },
  { code: "+91", name: "India" },
  { code: "+62", name: "Indonesia" },
  { code: "+98", name: "Iran" },
  { code: "+964", name: "Iraq" },
  { code: "+353", name: "Ireland" },
  { code: "+972", name: "Israel" },
  { code: "+39", name: "Italy" },
  { code: "+225", name: "Ivory Coast (Côte d'Ivoire)" },
  { code: "+1 876", name: "Jamaica" },
  { code: "+81", name: "Japan" },
  { code: "+962", name: "Jordan" },
  { code: "+7", name: "Kazakhstan" },
  { code: "+254", name: "Kenya" },
  { code: "+686", name: "Kiribati" },
  { code: "+383", name: "Kosovo" },
  { code: "+965", name: "Kuwait" },
  { code: "+996", name: "Kyrgyzstan" },
  { code: "+856", name: "Laos" },
  { code: "+371", name: "Latvia" },
  { code: "+961", name: "Lebanon" },
  { code: "+266", name: "Lesotho" },
  { code: "+231", name: "Liberia" },
  { code: "+218", name: "Libya" },
  { code: "+423", name: "Liechtenstein" },
  { code: "+370", name: "Lithuania" },
  { code: "+352", name: "Luxembourg" },
  { code: "+853", name: "Macau" },
  { code: "+261", name: "Madagascar" },
  { code: "+265", name: "Malawi" },
  { code: "+60", name: "Malaysia" },
  { code: "+960", name: "Maldives" },
  { code: "+223", name: "Mali" },
  { code: "+356", name: "Malta" },
  { code: "+692", name: "Marshall Islands" },
  { code: "+596", name: "Martinique" },
  { code: "+222", name: "Mauritania" },
  { code: "+230", name: "Mauritius" },
  { code: "+262", name: "Mayotte" },
  { code: "+52", name: "Mexico" },
  { code: "+691", name: "Micronesia" },
  { code: "+373", name: "Moldova" },
  { code: "+377", name: "Monaco" },
  { code: "+976", name: "Mongolia" },
  { code: "+382", name: "Montenegro" },
  { code: "+1 664", name: "Montserrat" },
  { code: "+212", name: "Morocco" },
  { code: "+258", name: "Mozambique" },
  { code: "+95", name: "Myanmar" },
  { code: "+264", name: "Namibia" },
  { code: "+674", name: "Nauru" },
  { code: "+977", name: "Nepal" },
  { code: "+31", name: "Netherlands" },
  { code: "+687", name: "New Caledonia" },
  { code: "+64", name: "New Zealand" },
  { code: "+505", name: "Nicaragua" },
  { code: "+227", name: "Niger" },
  { code: "+234", name: "Nigeria" },
  { code: "+683", name: "Niue" },
  { code: "+672", name: "Norfolk Island" },
  { code: "+850", name: "North Korea" },
  { code: "+389", name: "North Macedonia" },
  { code: "+1 670", name: "Northern Mariana Islands" },
  { code: "+47", name: "Norway" },
  { code: "+968", name: "Oman" },
  { code: "+92", name: "Pakistan" },
  { code: "+680", name: "Palau" },
  { code: "+970", name: "Palestine" },
  { code: "+507", name: "Panama" },
  { code: "+675", name: "Papua New Guinea" },
  { code: "+595", name: "Paraguay" },
  { code: "+51", name: "Peru" },
  { code: "+63", name: "Philippines" },
  { code: "+48", name: "Poland" },
  { code: "+351", name: "Portugal" },
  { code: "+1 787", name: "Puerto Rico" },
  { code: "+974", name: "Qatar" },
  { code: "+262", name: "Réunion" },
  { code: "+40", name: "Romania" },
  { code: "+7", name: "Russia" },
  { code: "+250", name: "Rwanda" },
  { code: "+590", name: "Saint Barthélemy" },
  { code: "+290", name: "Saint Helena" },
  { code: "+1 869", name: "Saint Kitts and Nevis" },
  { code: "+1 758", name: "Saint Lucia" },
  { code: "+590", name: "Saint Martin" },
  { code: "+508", name: "Saint Pierre and Miquelon" },
  { code: "+1 784", name: "Saint Vincent and the Grenadines" },
  { code: "+685", name: "Samoa" },
  { code: "+378", name: "San Marino" },
  { code: "+239", name: "São Tomé and Príncipe" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+221", name: "Senegal" },
  { code: "+381", name: "Serbia" },
  { code: "+248", name: "Seychelles" },
  { code: "+232", name: "Sierra Leone" },
  { code: "+65", name: "Singapore" },
  { code: "+1 721", name: "Sint Maarten" },
  { code: "+421", name: "Slovakia" },
  { code: "+386", name: "Slovenia" },
  { code: "+677", name: "Solomon Islands" },
  { code: "+252", name: "Somalia" },
  { code: "+27", name: "South Africa" },
  { code: "+82", name: "South Korea" },
  { code: "+211", name: "South Sudan" },
  { code: "+34", name: "Spain" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+249", name: "Sudan" },
  { code: "+597", name: "Suriname" },
  { code: "+46", name: "Sweden" },
  { code: "+41", name: "Switzerland" },
  { code: "+963", name: "Syria" },
  { code: "+886", name: "Taiwan" },
  { code: "+992", name: "Tajikistan" },
  { code: "+255", name: "Tanzania" },
  { code: "+66", name: "Thailand" },
  { code: "+228", name: "Togo" },
  { code: "+690", name: "Tokelau" },
  { code: "+676", name: "Tonga" },
  { code: "+1 868", name: "Trinidad and Tobago" },
  { code: "+216", name: "Tunisia" },
  { code: "+90", name: "Turkey" },
  { code: "+993", name: "Turkmenistan" },
  { code: "+1 649", name: "Turks and Caicos Islands" },
  { code: "+688", name: "Tuvalu" },
  { code: "+1 340", name: "U.S. Virgin Islands" },
  { code: "+256", name: "Uganda" },
  { code: "+380", name: "Ukraine" },
  { code: "+971", name: "United Arab Emirates" },
  { code: "+44", name: "United Kingdom" },
  { code: "+1", name: "United States" },
  { code: "+598", name: "Uruguay" },
  { code: "+998", name: "Uzbekistan" },
  { code: "+678", name: "Vanuatu" },
  { code: "+39", name: "Vatican City" },
  { code: "+58", name: "Venezuela" },
  { code: "+84", name: "Vietnam" },
  { code: "+681", name: "Wallis and Futuna" },
  { code: "+967", name: "Yemen" },
  { code: "+260", name: "Zambia" },
  { code: "+263", name: "Zimbabwe" },
];

const RavanFormAI = () => {
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const containerRef = useRef(null);
  const [isGlowing, setIsGlowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speech, setSpeech] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const { agent_id, schema } = useWidgetContext();
  const [auto_end_call, setAutoEndCall] = useState(false);
  const [pulseEffects, setPulseEffects] = useState({
    small: false,
    medium: false,
    large: false,
  });
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [leadFormVisible, setLeadFormVisible] = useState(true);
  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
  });
  const [countryCode, setCountryCode] = useState("+1");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [filteredCountries, setFilteredCountries] = useState(countryCodes);

  const { callId, callSessionId, setCallId, setCallSessionId } =
    useSessionStore();
  const {
    setSession,
    transcripts,
    setTranscripts,
    isListening,
    setIsListening,
    status,
    setStatus,
  } = useUltravoxStore();
  const baseurl = "https://app.snowie.ai";
  const debugMessages = new Set(["debug"]);
  const orange = "#F97316";
  const creamYellow = "#FFF7ED";

  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const countryName = data.country_name;
        const matchedCountry = countryCodes.find(
          (country) => country.name.toLowerCase() === countryName.toLowerCase()
        );
        if (matchedCountry) {
          setCountryCode(matchedCountry.code);
          setLeadData((prev) => ({
            ...prev,
            country: data.country_code.toLowerCase(),
          }));
        } else {
          setCountryCode("+1");
        }
      } catch (err) {
        console.error("Error fetching country:", err);
        setCountryCode("+1");
      }
    };
    fetchCountry();
  }, []);

  useEffect(() => {
    const filtered = countryCodes.filter(
      (country) =>
        country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        country.code.includes(countrySearch)
    );
    setFilteredCountries(filtered);
  }, [countrySearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest(".country-dropdown") // Optional: Add a class to the dropdown for specificity
      ) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    setCountryCode(country.code);
    setIsCountryDropdownOpen(false);
    setCountrySearch("");
    setLeadData((prev) => ({
      ...prev,
      country: country.code,
    }));
  };

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
      const response = await axios.post(`${baseurl}/api/start-thunder/`, {
        agent_code: agent_id,
        schema_name: schema,
        prior_call_id: id,
      });

      const wssUrl = response.data.joinUrl;
      const callId = response.data.callId;
      localStorage.setItem("callId", callId);
      setCallId(callId);
      setCallSessionId(response.data.call_session_id);

      if (wssUrl) {
        await session.joinCall(`${wssUrl}`);
      }
    } catch (error) {
      console.error("Error in handleMicClick:", error);
    }
  };

  const handleMicClick = async () => {
    try {
      if (!isListening) {
        setIsGlowing(true);
        const response = await axios.post(`${baseurl}/api/start-thunder/`, {
          agent_code: agent_id,
          schema_name: schema,
          name: leadData.name,
          email: leadData.email,
          phone: countryCode + leadData.phone,
        });

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
        console.log("call left successfully second time");
        const response = await axios.post(
          `${baseurl}/api/end-call-session-thunder/`,
          {
            call_session_id: callSessionId,
            call_id: callId,
            schema_name: schema,
          }
        );

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

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (leadData.name && leadData.email && leadData.phone) {
      setLeadFormVisible(false);
      handleMicClick();
    }
  };

  const toggleExpand = () => {
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
    const response = await axios.post(
      `${baseurl}/api/end-call-session-thunder/`,
      {
        call_session_id: callSessionId,
        call_id: callId,
        schema_name: schema,
      }
    );
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
              <button
                onClick={toggleMinimize}
                className="control-button"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 size={18} />
              </button>
              <button
                onClick={handleClose}
                className="control-button"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {leadFormVisible ? (
            <div className="lead-form-container">
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
              <form
                onSubmit={handleLeadSubmit}
                className="flex flex-col space-y-3 mt-5 w-full"
              >
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={leadData.name}
                  onChange={(e) =>
                    setLeadData({ ...leadData, name: e.target.value })
                  }
                  className="border rounded p-2"
                  required
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={leadData.email}
                  onChange={(e) =>
                    setLeadData({ ...leadData, email: e.target.value })
                  }
                  className="border rounded p-2"
                  required
                />
                <div className="flex">
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() =>
                        setIsCountryDropdownOpen(!isCountryDropdownOpen)
                      }
                      className="w-24 px-3 py-2.5 rounded-l-xl border border-r-0 border-gray-200 bg-secondary text-black backdrop-blur-sm text-sm hover:border-gray-300 flex items-center justify-between"
                    >
                      {countryCode}
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </button>
                    {isCountryDropdownOpen && (
                      <div
                        className="absolute z-10 w-64 bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto country-dropdown"
                        ref={dropdownRef}
                      >
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search country or code..."
                          className="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none sticky top-0 bg-secondary text-black"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="p-1">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                              <button
                                key={`${country.code}-${country.name}`}
                                onClick={() => handleCountrySelect(country)}
                                className="w-full text-left px-3 py-2 text-sm text-black sidebar-tab-hover-color rounded-lg flex justify-between items-center"
                              >
                                <span>{country.name}</span>
                                <span className="text-gray-500">
                                  {country.code}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-black">
                              No countries found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter number"
                    value={leadData.phone}
                    onChange={(e) =>
                      setLeadData({ ...leadData, phone: e.target.value })
                    }
                    className="flex-1 px-4 py-2.5 rounded-r-xl border border-gray-200 bg-secondary text-black backdrop-blur-sm focus:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-gray-400 hover:border-gray-300"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-orange-500 text-white rounded p-2 font-semibold"
                >
                  Start Conversation
                </button>
              </form>
            </div>
          ) : (
            <>
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
                        disabled={
                          status === "disconnected" || status === "connecting"
                        }
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
                          !message.trim() ||
                          status === "disconnected" ||
                          status === "connecting"
                        }
                        className="send-button"
                      >
                        <Send size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
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
            Talk to Maya
          </span>
        </div>
      )}
    </div>
  );
};

export default RavanFormAI;
