import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, X, Minimize2, Volume2, VolumeX, Phone, User, Loader2, ChevronsUpDown, Mail, Building } from 'lucide-react';
import axios from 'axios';
import { UltravoxSession } from 'ultravox-client';
import { useWidgetContext } from '../contexts/WidgetContext';
import useSessionStore from '../store/session';
import { useUltravoxStore } from '../store/ultrasession';
import logo from '../assets/icon logo zol.png';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { countryCodes } from './countryCodes';

// Interface definitions
interface FormData {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  companyName: string;
}

interface PulseEffects {
  small: boolean;
  medium: boolean;
  large: boolean;
}

const Zol: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speech, setSpeech] = useState('Talk To Maya');
  const [isVisible, setIsVisible] = useState(true);
  const [autoEndCall, setAutoEndCall] = useState(false);
  const [pulseEffects, setPulseEffects] = useState<PulseEffects>({
    small: false,
    medium: false,
    large: false,
  });
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    countryCode: '+1',
    companyName: '',
  });
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countryCodes);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<UltravoxSession | null>(null);
  const { toast } = useToast();
  const { agent_id, schema } = useWidgetContext();
  const { callId, callSessionId, setCallId, setCallSessionId } = useSessionStore();
  const { setSession, transcripts, setTranscripts, isListening, setIsListening, status, setStatus } = useUltravoxStore();

  const baseurl = 'https://app.snowie.ai';
  const debugMessages = new Set(['debug']);
  const orange = '#F97316';
  const creamYellow = '#FFF7ED';

  // Initialize UltravoxSession
  if (!sessionRef.current) {
    sessionRef.current = new UltravoxSession({
      experimentalMessages: debugMessages,
    });
    setSession(sessionRef.current);
  }

  const session = sessionRef.current;

  // Update speech based on status
  useEffect(() => {
    if (status === 'disconnected') {
      setSpeech('Talk To Maya');
    } else if (status === 'connecting') {
      setSpeech('Connecting To Maya');
    } else if (status === 'speaking') {
      setSpeech('Maya is Speaking');
    } else if (status === 'connected') {
      setSpeech('Connected To Maya');
    } else if (status === 'disconnecting') {
      setSpeech('Ending Conversation With Maya');
    } else if (status === 'listening') {
      setSpeech('Maya is Listening');
    }
  }, [status]);

  // Handle visibility change for muting/unmuting speaker
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        session.muteSpeaker();
      } else if (document.visibilityState === 'visible') {
        session.unmuteSpeaker();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle country search for dropdown
  useEffect(() => {
    const filtered = countryCodes.filter(
      (country) =>
        country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        country.code.includes(countrySearch)
    );
    setFilteredCountries(filtered);
  }, [countrySearch]);

  // Handle click outside to close country dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form submission mutation
  const formMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const custom_form_fields = {
        name: data.name,
        email: data.email,
        phone: `${data.countryCode}${data.phone}`,
        companyName: data.companyName,
      };
      const response = await axios.post(`${baseurl}/api/start-thunder/`, {
        agent_code: agent_id,
        schema_name: schema,
        custom_form_fields,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setFormSubmitted(true);
      setCallId(data.callId);
      setCallSessionId(data.call_session_id);
      localStorage.setItem('callId', data.callId);
      localStorage.setItem('wssUrl', data.joinUrl);
      if (data.joinUrl) {
        session.joinCall(data.joinUrl);
        setIsListening(true);
        setIsGlowing(true);
      }
      toast({
        title: 'Form Submitted!',
        description: 'Your details have been saved. Starting the call...',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    formMutation.mutate(formData);
  };

  // Handle country selection
  const handleCountrySelect = (country: { code: string; name: string }) => {
    setFormData((prev) => ({ ...prev, countryCode: country.code }));
    setIsCountryDropdownOpen(false);
    setCountrySearch('');
  };

  // Handle message submission
  const handleSubmit = () => {
    if (status !== 'disconnected' && message.trim()) {
      session.sendText(message);
      setMessage('');
    }
  };

  // Handle mic click
  const handleMicClick = async () => {
    try {
      if (!isListening) {
        setIsGlowing(true);
        const response = await axios.post(`${baseurl}/api/start-thunder/`, {
          agent_code: agent_id,
          schema_name: schema,
          custom_form_fields: {
            name: formData.name,
            email: formData.email,
            phone: `${formData.countryCode}${formData.phone}`,
            companyName: formData.companyName,
          },
        });

        const wssUrl = response.data.joinUrl;
        const callId = response.data.callId;
        localStorage.setItem('callId', callId);
        setCallId(callId);
        setCallSessionId(response.data.call_session_id);

        if (wssUrl) {
          await session.joinCall(wssUrl);
        }
        setIsListening(true);
      } else {
        setIsGlowing(false);
        await session.leaveCall();
        await axios.post(`${baseurl}/api/end-call-session-thunder/`, {
          call_session_id: callSessionId,
          call_id: callId,
          schema_name: schema,
        });
        setTranscripts(null);
        setIsListening(false);
        localStorage.clear();
      }
    } catch (error) {
      console.error('Error in handleMicClick:', error);
    }
  };

  // Handle reconnect
  useEffect(() => {
    const callId = localStorage.getItem('callId');
    if (callId && status === 'disconnected') {
      setIsMuted(true);
      handleMicClickForReconnect(callId);
    } else if (status === 'listening' && callId && isMuted) {
      session.muteSpeaker();
    }
  }, [status]);

  const handleMicClickForReconnect = async (id: string) => {
    try {
      const response = await axios.post(`${baseurl}/api/start-thunder/`, {
        agent_code: agent_id,
        schema_name: schema,
        prior_call_id: id,
        custom_form_fields: {
          name: formData.name,
          email: formData.email,
          phone: `${formData.countryCode}${formData.phone}`,
          companyName: formData.companyName,
        },
      });

      const wssUrl = response.data.joinUrl;
      const callId = response.data.callId;
      localStorage.setItem('callId', callId);
      setCallId(callId);
      setCallSessionId(response.data.call_session_id);

      if (wssUrl) {
        await session.joinCall(wssUrl);
      }
    } catch (error) {
      console.error('Error in handleMicClickForReconnect:', error);
    }
  };

  // Handle auto end call
  const endCall = (parameters: { auto_disconnect_call: boolean }) => {
    if (parameters.auto_disconnect_call) {
      setAutoEndCall(true);
    }
  };

  useEffect(() => {
    if (autoEndCall) {
      const handleClose = async () => {
        localStorage.clear();
        await session.leaveCall();
        await axios.post(`${baseurl}/api/end-call-session-thunder/`, {
          call_session_id: callSessionId,
          call_id: callId,
          schema_name: schema,
        });
        setTranscripts(null);
        setIsListening(false);
      };
      handleClose();
    }
  }, [autoEndCall]);

  session.registerToolImplementation('auto_end_call', endCall);

  // Session event listeners
  session.addEventListener('transcripts', () => {
    const allTrans = session.transcripts;
    let trans = '';
    for (let index = 0; index < allTrans.length; index++) {
      const currentTranscript = allTrans[index];
      trans = currentTranscript.text;
      if (currentTranscript) {
        setTranscripts(trans);
      }
    }
  });

  session.addEventListener('status', () => {
    setStatus(session.status);
    if (session.status === 'speaking' || session.status === 'listening') {
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  });

  session.addEventListener('experimental_message', (msg) => {
    console.log('Got a debug message: ', JSON.stringify(msg));
  });

  // Pulse effects for recording
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

  // Scroll to bottom of transcripts
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [transcripts]);

  // Update glowing state
  useEffect(() => {
    if (status === 'speaking' || status === 'listening') {
      setIsGlowing(true);
    } else {
      setIsGlowing(false);
    }
  }, [status]);

  const toggleExpand = () => {
    if (!formSubmitted) {
      setExpanded(true);
      return;
    }
    if (status === 'disconnected') {
      setSpeech('Connecting To Maya');
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
    await axios.post(`${baseurl}/api/end-call-session-thunder/`, {
      call_session_id: callSessionId,
      call_id: callId,
      schema_name: schema,
    });
    setTranscripts(null);
    setIsListening(false);
    setFormSubmitted(false); // Reset form submission to show form again
  };

  return (
    <div className="widget-container fixed bottom-4 right-4 z-50">
      {expanded && !formSubmitted ? (
        <div className="chat-window w-96 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
          <div className="chat-header flex justify-between items-center mb-4">
            <div className="header-logo flex items-center gap-2">
              <img src={logo} alt="Ravan AI logo" className="w-6 h-6" />
              <span className="header-title text-lg font-semibold">Ravan AI</span>
            </div>
            <button onClick={handleClose} className="control-button text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="flex">
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-24 px-3 py-2 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-900 text-sm hover:border-gray-300 flex items-center justify-between"
                  >
                    {formData.countryCode}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </button>
                  {isCountryDropdownOpen && (
                    <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search country or code..."
                        className="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none bg-white text-gray-900"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="p-1">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((country) => (
                            <button
                              key={`${country.code}-${country.name}`}
                              onClick={() => handleCountrySelect(country)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded-lg flex justify-between items-center"
                            >
                              <span>{country.name}</span>
                              <span className="text-gray-500">{country.code}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-900">No countries found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter number"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="flex-1 px-4 py-2 rounded-r-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  id="companyName"
                  type="text"
                  placeholder="Enter your company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  required
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={
                formMutation.isPending ||
                !formData.name ||
                !formData.email ||
                !formData.phone ||
                !formData.companyName
              }
              className="w-full py-2 bg-orange-400 text-white rounded-xl hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {formMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Start Call'
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          {expanded ? (
            <div
              className={`chat-window w-96 bg-white rounded-xl shadow-2xl border ${
                isGlowing ? 'border-orange-400 shadow-orange-500/50' : 'border-gray-300'
              }`}
            >
              <div className="chat-header flex justify-between items-center p-4 border-b border-gray-200">
                <div className="header-logo flex items-center gap-2">
                  <img src={logo} alt="Ravan AI logo" className="w-6 h-6" />
                  <span className="header-title text-lg font-semibold">Ravan AI</span>
                </div>
                <div className="header-controls flex gap-2">
                  <button
                    onClick={toggleMute}
                    className="control-button text-gray-500 hover:text-gray-700"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <button
                    onClick={toggleMinimize}
                    className="control-button text-gray-500 hover:text-gray-700"
                    title={isMinimized ? 'Expand' : 'Minimize'}
                  >
                    <Minimize2 size={18} />
                  </button>
                  <button
                    onClick={handleClose}
                    className="control-button text-gray-500 hover:text-gray-700"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <div className="chat-content flex flex-col items-center p-4">
                  <div className="mic-button-container relative">
                    {isRecording && (
                      <>
                        <div className="pulse-ring absolute inset-0 rounded-full bg-orange-400/20 animate-ping" style={{ '--delay': '0s' } as React.CSSProperties}></div>
                        <div className="pulse-ring absolute inset-0 rounded-full bg-orange-400/15 animate-ping" style={{ '--delay': '0.5s' } as React.CSSProperties}></div>
                        <div className="pulse-ring absolute inset-0 rounded-full bg-orange-400/10 animate-ping" style={{ '--delay': '1s' } as React.CSSProperties}></div>
                      </>
                    )}
                    <button
                      onClick={handleMicClick}
                      className={`mic-button p-4 rounded-full ${isRecording ? 'bg-orange-100' : 'bg-gray-100'} hover:bg-orange-200 transition-all`}
                    >
                      <div className="relative">
                        {isGlowing && <div className="glow-effect absolute inset-0 rounded-full bg-orange-400/30 animate-pulse"></div>}
                        <img
                          src={logo}
                          alt="Ravan AI logo"
                          className={`w-12 h-12 transition-transform duration-300 ${isRecording ? 'scale-110' : ''}`}
                        />
                      </div>
                    </button>
                  </div>

                  <div className="status-badge mt-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{speech}</div>

                  <div className="transcript-container mt-4 w-full max-h-40 overflow-y-auto" ref={containerRef}>
                    <div className="relative">
                      <span className="transcript-text text-gray-800">{transcripts}</span>
                      {!transcripts && (
                        <span className="text-gray-400 italic">Your conversation will appear here...</span>
                      )}
                    </div>
                  </div>

                  <div className="input-wrapper mt-4 w-full">
                    <div className="input-container flex gap-2">
                      <input
                        type="text"
                        disabled={status === 'disconnected' || status === 'connecting'}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && message.trim()) {
                            handleSubmit();
                          }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                      />
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!message.trim() || status === 'disconnected' || status === 'connecting'}
                        className="send-button p-2 bg-orange-400 text-white rounded-xl hover:bg-orange-500 disabled:bg-gray-300"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="floating-button-container flex flex-col items-center">
              <button
                onClick={toggleExpand}
                className="floating-button p-3 rounded-full bg-orange-400 hover:bg-orange-500 transition-all"
              >
                <div className="relative">
                  <img src={logo} alt="Ravan AI logo" className="w-8 h-8 relative z-10" />
                </div>
              </button>
              <span className="talk-to-me text-sm font-medium px-3 py-1 mt-2 text-gray-700 bg-white rounded-full">
                Talk to Maya
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Zol;