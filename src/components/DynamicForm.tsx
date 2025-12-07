import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageSquare,
  Gift,
  Sparkles,
  Check,
  X,
  ArrowRight,
  Zap,
  Star,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import axios from "axios";
import Select from "react-select";
import ReactCountryFlag from "react-country-flag";
import Dynamic from "./Dynamic";
import RavanForm from "./RavanForm";
import ravanLogo from "@/assets/logo.png";
import FreebiePopup from "./FreebiePopup";
import { BookDemoPopup } from "./BookDemoPopup";
import { countryCodes } from "./countryCodes";

// Replace this line:
// import countryList from "react-select-country-list";

interface DemoFormData {
  name: string;
  phone: string; // only the national number (no country code)
  email: string;
  businessName: string;
  countryCode: string; // e.g. "+91"
  countryLabel: string; // e.g. "India"
}

type DemoStep =
  | "selection"
  | "widget-select"
  | "widget-custom"
  | "widget-sample"
  | "calling-confirm"
  | "calling-success";

const LOCAL_STORAGE_KEY = "ravan_demo_user_data";

const CountryDropdown = ({
  formData,
  setFormData,
  isOpen,
  setIsOpen,
  search,
  setSearch,
}: {
  formData: DemoFormData;
  setFormData: React.Dispatch<React.SetStateAction<DemoFormData>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch(""); // optional: clear search when closing
      }
    };

    // small delay so that the click that opened the dropdown is ignored
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen, setSearch]); // ← dependencies are stable

  let timer: any;

  const filtered = countryCodes.filter((c) => {
    const s = search.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(s) ||
      c.code.includes(s)
    );
  });

  const onSelect = (c: { code: string; name: string }) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: c.code,
      countryLabel: c.name,
    }));
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-28 px-3 py-2.5 rounded-xl border bg-gray-50 flex items-center justify-between text-sm"
      >
        <span>{formData.countryCode}</span>
        <ChevronsUpDown className="w-4 h-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-white border rounded-xl shadow-xl max-h-72 overflow-hidden">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-2 border-b text-sm focus:outline-none"
          />

          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-center">
                No countries found
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => onSelect(c)}
                  className="w-full px-3 py-2 flex justify-between text-left text-sm hover:bg-gray-100"
                >
                  <span>{c.name}</span>
                  <span className="text-gray-500">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const DemoExperienceSection = () => {
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [formData, setFormData] = useState<DemoFormData>({
    name: "",
    phone: "",
    email: "",
    businessName: "",
    countryCode: "+1",
    countryLabel: "United States",
  });
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const [errors, setErrors] = useState<Partial<DemoFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<DemoStep>("selection");
  const [showFreebiePopup, setShowFreebiePopup] = useState(false);
  const [showBookDemoPopup, setShowBookDemoPopup] = useState(false);

  // Calling states
  const [isCallingSubmitting, setIsCallingSubmitting] = useState(false);
  const [callingSubmitSuccess, setCallingSubmitSuccess] = useState(false);
  useEffect(() => {
    if (formData.name || formData.phone || formData.email) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  
  useEffect(() => {
    if (currentStep === "calling-confirm") {
      const loadSavedData = (): Partial<DemoFormData> => {
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            const country =
              countryCodes.find((c) => c.code === parsed.countryCode) ||
              countryCodes.find((c) => c.code === "+1")!;

            return {
              name: parsed.name || "",
              phone: parsed.phone || "",
              email: parsed.email || "",
              businessName: parsed.businessName || "",
              countryCode: country.code,
              countryLabel: country.name,
            };
          }
        } catch (e) {
          console.error("Failed to load saved data", e);
        }
        return {};
      };

      const savedData = loadSavedData();
      if (Object.keys(savedData).length > 0) {
        setFormData((prev) => ({ ...prev, ...savedData }));
      }
    }
  }, [currentStep]);
  // Form validation for initial modal
  const validateForm = (): boolean => {
    const newErrors: Partial<DemoFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[\d\s\-\+\(\)0-9]{7,15}$/.test(formData.phone))
      newErrors.phone = "Enter a valid phone number";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email address";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof DemoFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCountryChange = (option: any) => {
    if (option) {
      setFormData((prev) => ({
        ...prev,
        countryCode: option.value,
        countryLabel: option.label,
      }));
    }
  };

  // Initial modal: NO API CALL — just unlock demo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData)); // Extra save on submit
    setTimeout(() => {
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowInfoModal(false);
        setIsSubmitting(false);
      }, 1200);
    }, 600);
  };

  // Direct AI Calling Request — Now sends country code + phone
  const handleCallingRequest = async () => {
    const cleanPhone = formData.phone.replace(/[^\d]/g, "");
    const fullInternationalNumber = formData.countryCode + cleanPhone;

    if (!formData.name || !cleanPhone) return;

    setIsCallingSubmitting(true);

    try {
      await axios.post(
        "https://app.closerx.ai/api/testcall/voizerfreeaccount/",
        {
          access_key: "testmycall",
          calling_number: "+18582520325",
          email: formData.email.trim(),
          name: formData.name.trim(),
          new_agent: 164,
          receiver_number: fullInternationalNumber, // Now includes country code!
        }
      );

      setCallingSubmitSuccess(true);
      setTimeout(() => {
        setCurrentStep("calling-success");
      }, 1500);
    } catch (err: any) {
      console.error("Calling request failed:", err);
      alert("Failed to request call. Please try again.");
      setCallingSubmitSuccess(false);
    } finally {
      setIsCallingSubmitting(false);
    }
  };

  // react-select custom styles
  const selectStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: "44px",
      borderRadius: "12px",
      borderColor: errors.phone ? "#ef4444" : "#d1d5db",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#fb923c",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: "12px",
      overflow: "hidden",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#FF6B35"
        : state.isFocused
        ? "#FFF4F0"
        : "white",
      color: state.isSelected ? "white" : "black",
    }),
  };

  const formatOptionLabel = ({ label, value, code }: any) => (
    <div className="flex items-center gap-3">
      <ReactCountryFlag
        countryCode={code}
        svg
        style={{ width: "1.5em", height: "1.5em" }}
        cdnUrl="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/"
      />
      <span className="text-gray-500 ml-auto text-sm">{value}</span>
    </div>
  );

  return (
    <>
      {/* MAIN DEMO SECTION */}
      <section className="py-20 bg-[#FDF9F5] relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-5 py-2 bg-[#FFE5D9] text-[#FF6B35] rounded-full text-sm font-semibold tracking-wide">
              Interactive Demo
            </span>
            <h2 className="mt-6 text-5xl font-black text-gray-900 leading-tight">
              Experience Our AI Solutions
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Try live demos of our AI solutions and see how they can transform
              your business instantly.
            </p>
          </div>
          {/* FLOATING SIDE CTA BUTTONS — MORE INWARD */}
          <div className="relative w-full hidden md:block">
            <button
              onClick={() => setShowBookDemoPopup(true)}
              className="
      fixed left-16 
      top-[30rem]
      -rotate-90 origin-left 
      bg-white text-orange-600 font-extrabold 
      text-lg
      px-6 py-4
      rounded-2xl
      border-4 border-orange-500 
      shadow-[0_0_25px_rgba(255,107,53,0.7)]
      hover:shadow-[0_0_35px_rgba(255,107,53,1)] 
      hover:bg-orange-50 
      transition-all
      animate-pulse
      z-50
    "
            >
              Book A Free 1:1 AI Consultation Call
            </button>

            <button
              onClick={() => setShowFreebiePopup(true)}
              className="
      fixed
      top-[30rem]
      right-12
      bg-gradient-to-r from-orange-500 to-orange-600
      text-white
      font-extrabold
      text-3xl
      rounded-2xl
      px-5 py-4
      shadow-[0_0_22px_rgba(255,107,53,0.8)]
      rotate-90 origin-top-right
      z-[9999]
    "
            >
              🎁 Get Freebie
            </button>
          </div>

          {/* Persistent Demo Selector Tabs */}
          {/* Persistent Demo Selector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12 md:mb-16">
            {/* Website Widget Tab */}
            <div>
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => setCurrentStep("widget-select")}
                className={`cursor-pointer rounded-3xl p-8 transition-all shadow-lg border-4 ${
                  currentStep.startsWith("widget")
                    ? "bg-white border-[#FF6B35] shadow-2xl scale-105"
                    : "bg-white/70 border-transparent hover:border-[#FF8B60]"
                }`}
              >
                <div className="flex items-start gap-5">
                  <div className="p-4 rounded-2xl bg-[#FFE5D9] text-[#FF6B35]">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      AI Website Voice Widget
                    </h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">
                      AI speech-to-speech bot that engages visitors and converts
                      leads 24/7
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* MOBILE ONLY: Show these buttons right under the widget card when selected */}
              {currentStep.startsWith("widget") && (
                <div className="mt-6 flex flex-col sm:hidden gap-4">
                  <button
                    onClick={() => setCurrentStep("widget-custom")}
                    className="bg-[#ffe5d9f7] rounded-2xl shadow-md p-6 border-2 border-gray-200 hover:border-white text-left flex items-start gap-4"
                  >
                    <Sparkles className="w-8 h-8 text-[#ff4d0c] shrink-0" />
                    <div>
                      <h4 className="text-xl font-bold text-[#ff4d0c]">
                        Create Custom Widget
                      </h4>
                      <p className="text-[#ff4d0c] text-sm">
                        Build a speech-to-speech agent from scratch
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentStep("widget-sample")}
                    className="bg-[#ffe5d9f7] rounded-2xl shadow-md p-6 border-2 border-gray-200 hover:border-white text-left flex items-start gap-4"
                  >
                    <MessageSquare className="w-8 h-8 text-[#ff4d0c] shrink-0" />
                    <div>
                      <h4 className="text-xl font-bold text-[#ff4d0c]">
                        Sample Bot
                      </h4>
                      <p className="text-[#ff4d0c] text-sm">
                        Instant prebuilt demo
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* AI Calling Tab */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => setCurrentStep("calling-confirm")}
              className={`cursor-pointer rounded-3xl p-8 transition-all shadow-lg border-4 ${
                currentStep.startsWith("calling")
                  ? "bg-white border-[#FF6B35] shadow-2xl scale-105"
                  : "bg-white/70 border-transparent hover:border-[#FF8B60]"
              }`}
            >
              <div className="flex items-start gap-5">
                <div className="p-4 rounded-2xl bg-[#FFE5D9] text-[#FF6B35]">
                  <Phone className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    AI Calling
                  </h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    AI phone caller that handles calls, books appointments, and
                    follows up
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* MOBILE ONLY: Freebie + Book Demo Buttons (stacked below cards) */}
          <div className="block sm:hidden space-y-4 max-w-md mx-auto mb-12 px-6">
            <button
              onClick={() => setShowBookDemoPopup(true)}
              className="w-full bg-white text-orange-600 font-extrabold py-5 rounded-2xl border-4 border-orange-500 shadow-xl hover:shadow-2xl transition-all text-lg 
      hover:bg-orange-50 
     
      animate-pulse
      z-50"
            >
              Book A Free 1:1 AI Consultation Call
            </button>
            <button
              onClick={() => setShowFreebiePopup(true)}
              className="
    fixed
    top-36
    right-0
    bg-gradient-to-r from-orange-500 to-orange-600
    text-white
    text-lg
    font-extrabold
    px-3 py-2
    rounded-xl
    shadow-[0_0_12px_rgba(255,107,53,0.7)]
    rotate-90 origin-top-right
    z-[9999]
  "
            >
              🎁 Get Freebie
            </button>
          </div>

          {/* DESKTOP: Original floating side buttons (unchanged) */}
          {/* <div className="hidden sm:block">
            <button
              onClick={() => setShowBookDemoPopup(true)}
              className="fixed left-24 -rotate-90 origin-left bg-white text-orange-600 font-extrabold px-4 py-2 rounded-xl border-2 border-orange-500 shadow-[0_0_15px_rgba(255,107,53,0.6)] hover:shadow-[0_0_25px_rgba(255,107,53,1)] hover:bg-orange-50 transition-all animate-pulse z-50"
            >
              Book A Free 1:1 AI Consultation Call
            </button>

            <button
              onClick={() => setShowFreebiePopup(true)}
              className="fixed top-1/2 right-24 rotate-90 origin-right bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(255,107,53,0.7)] hover:shadow-[0_0_25px_rgba(255,107,53,1)] hover:opacity-90 transition-all animate-pulse z-50"
            >
              🎁 Get Freebie
            </button>
          </div> */}

          {/* Dynamic Demo Content Area */}

          <AnimatePresence mode="wait">
            {/* Widget Flow */}
            {currentStep.startsWith("widget") && (
              <div className="hidden md:block">
                <motion.div
                  key="widget-tabs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-row gap-6 mb-12 max-w-3xl"
                >
                  <button
                    onClick={() => setCurrentStep("widget-custom")}
                    className="bg-[#ffe5d9f7] rounded-2xl shadow-md p-6 border-2 border-gray-200 hover:border-white text-left w-72 whitespace-normal break-words"
                  >
                    <div className="flex items-start gap-4">
                      <Sparkles className="w-8 h-8 text-[#ff4d0c] shrink-0" />
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-[#ff4d0c]">
                          Create Custom Widget
                        </h4>
                        <p className="text-[#ff4d0c] text-sm">
                          Build a speech-to-speech agent from scratch
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentStep("widget-sample")}
                    className="bg-[#ffe5d9f7] rounded-2xl shadow-md p-6 border-2 border-gray-200 hover:border-white text-left w-72 whitespace-normal break-words"
                  >
                    <div className="flex items-start gap-4">
                      <MessageSquare className="w-8 h-8 text-[#ff4d0c] shrink-0" />
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-[#ff4d0c]">
                          Sample Bot
                        </h4>
                        <p className="text-[#ff4d0c] text-sm">
                          Instant prebuilt demo
                        </p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              </div>
            )}

            {/* {currentStep.startsWith("widget") && (
              <AnimatePresence mode="wait">
                {currentStep === "widget-custom" && (
                  <motion.div
                    key="widget-custom"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10"
                  >
                    <h3 className="text-3xl font-bold text-center mb-8">
                      Custom AI Widget Builder
                    </h3>
                    <Dynamic />
                  </motion.div>
                )}

                {currentStep === "widget-sample" && (
                  <motion.div
                    key="widget-sample"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-10"
                  >
                    <h3 className="text-3xl font-bold text-center mb-8">
                      Sample AI Speech-to-Speech bot
                    </h3>
                    <RavanForm />
                  </motion.div>
                )}
              </AnimatePresence>
            )} */}

            {/* AI Calling Flow */}
            {/* {currentStep === "calling-confirm" && (
              <motion.div
                key="calling-confirm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-10"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-[#FFE5D9] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Phone className="w-10 h-10 text-[#FF6B35]" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    Request AI Calling Demo
                  </h3>
                  <p className="text-gray-600">
                    Our AI Phone Caller will call you shortly to demonstrate how it handles inbound & outbound calls, transfers calls to your team, books appointments, and automatically follows up with every lead—all in real time.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formData.name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formData.countryCode}
                      {formData.phone || " Not provided"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCallingRequest}
                  disabled={isCallingSubmitting || callingSubmitSuccess}
                  className={`w-full py-6 rounded-full text-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 ${
                    callingSubmitSuccess
                      ? "bg-green-500"
                      : isCallingSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#FF6B35] hover:bg-[#FF8B60] text-white"
                  }`}
                >
                  {isCallingSubmitting ? (
                    "Requesting Call..."
                  ) : callingSubmitSuccess ? (
                    <>
                      <Check className="w-6 h-6" />
                      Call Requested!
                    </>
                  ) : (
                    <>
                      <Phone className="w-6 h-6" />
                      Request Demo Call
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {currentStep === "calling-success" && (
              <motion.div
                key="calling-success"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-16"
              >
                <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Check className="w-14 h-14 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold mb-6">
                  Demo Call Requested!
                </h3>
                <p className="text-gray-600 text-lg mb-10">
                  Our AI will call <strong>{formData.name}</strong> at{" "}
                  <strong>
                    {formData.countryCode}
                    {formData.phone}
                  </strong>{" "}
                  shortly.
                </p>
                <div className="text-sm text-gray-500">
                  Switch to another demo above
                </div>
              </motion.div>
            )} */}
          </AnimatePresence>
        </div>
      </section>

      {/* INITIAL INFO MODAL — Now with react-select country picker */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => {}}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500/30 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-20 -right-20 w-48 h-48 bg-orange-400/30 rounded-full blur-3xl"
              />

              <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                <div className="relative h-32 bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden">
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <motion.div
                      initial={{ scale: 0, y: 30 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <div className="relative">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl p-3 border-4 border-white">
                          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center overflow-hidden">
                            <img
                              src={ravanLogo}
                              alt="Ravan Logo"
                              className="w-20 h-20 object-contain"
                            />
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full text-[10px]">
                          AI SHOW
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="absolute top-4 left-0 right-0 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/40"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span className="text-white text-sm font-bold tracking-wider">
                        GLOBAL AI SHOW 2025
                      </span>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                    </motion.div>
                  </div>
                </div>

                <div className="pt-16 pb-8 px-6">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-6"
                  >
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Welcome to{" "}
                      <span className="text-orange-500 font-extrabold">
                        Ravan.ai
                      </span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Experience your AI sales workforce — start your
                      interactive AI demo.
                    </p>
                  </motion.div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name *"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full h-11 px-4 bg-gray-50 border rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition ${
                          errors.name ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </motion.div>

                    {/* Country Code + Phone */}
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      <label className="text-xs text-gray-500">
                        Phone Number *
                      </label>
                      <div className="flex gap-3 mt-1">
                        <div className="w-32">
                          <CountryDropdown
                            formData={formData}
                            setFormData={setFormData}
                            isOpen={isCountryDropdownOpen}
                            setIsOpen={setIsCountryDropdownOpen}
                            search={countrySearch}
                            setSearch={setCountrySearch}
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full h-11 px-4 bg-gray-50 border rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition ${
                              errors.phone
                                ? "border-red-500"
                                : "border-gray-200"
                            }`}
                          />
                        </div>
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address *"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full h-11 px-4 bg-gray-50 border rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition ${
                          errors.email ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 }}
                    >
                      <input
                        type="text"
                        name="businessName"
                        placeholder="Company Name"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="pt-3"
                    >
                      <button
                        type="submit"
                        disabled={isSubmitting || submitSuccess}
                        className={`w-full h-12 text-base font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                          submitSuccess
                            ? "bg-green-500 text-white"
                            : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white"
                        }`}
                      >
                        {isSubmitting ? (
                          "Unlocking..."
                        ) : submitSuccess ? (
                          <>
                            <Check className="w-5 h-5" /> Unlocked!
                          </>
                        ) : (
                          <>
                            Continue to Demo{" "}
                            <ChevronRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="text-center text-xs text-gray-400"
                    >
                      Thank you for visiting our booth — enjoy your personalized
                      AI demo.{" "}
                    </motion.p>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* AI CALLING DEMO POPUP */}
      <AnimatePresence>
        {(currentStep === "calling-confirm" ||
          currentStep === "calling-success") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setCurrentStep("selection")}
          >
            {/* CARD */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 250 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl mx-auto p-12"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setCurrentStep("selection")}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
              >
                <X className="w-7 h-7" />
              </button>

              {/* CONTENT (calling-confirm) */}
              {currentStep === "calling-confirm" && (
                <motion.div
                  key="calling-confirm"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="text-center"
                >
                  {/* ICON */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl mx-auto mb-8">
                    <Phone className="w-14 h-14 text-white" />
                  </div>

                  {/* HEADING */}
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-5">
                    AI Calling
                  </h3>

                  <p className="text-gray-600 text-sm mb-10">
                    Our AI Phone Caller will call you shortly to demonstrate how
                    it handles inbound & outbound calls, books appointments, and
                    automatically follows up with every lead.
                  </p>

                  {/* PHONE NUMBER */}
                  <p className="text-lg text-gray-500 mb-2">
                    We'll call you at:
                  </p>
                  <div className="flex items-center justify-center gap-3 mb-10">
                    {/* Country Code (read only dropdown optional) */}
                    <CountryDropdown
                      formData={formData}
                      setFormData={setFormData}
                      isOpen={isCountryDropdownOpen}
                      setIsOpen={setIsCountryDropdownOpen}
                      search={countrySearch}
                      setSearch={setCountrySearch}
                    />

                    {/* Editable phone input */}
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full max-w-xs h-14 text-center bg-gray-50 border border-gray-300 rounded-2xl font-bold text-2xl tracking-wider"
                      placeholder="Enter number"
                    />
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleCallingRequest}
                    disabled={isCallingSubmitting || callingSubmitSuccess}
                    className={`w-full py-5 rounded-full text-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 max-w-md mx-auto ${
                      callingSubmitSuccess
                        ? "bg-green-500 text-white"
                        : isCallingSubmitting
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white"
                    }`}
                  >
                    {isCallingSubmitting ? (
                      "Requesting Call..."
                    ) : callingSubmitSuccess ? (
                      <>
                        <Check className="w-6 h-6" />
                        Call Requested!
                      </>
                    ) : (
                      <>
                        <Phone className="w-6 h-6" />
                        Start Demo Call
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* SUCCESS STATE (popup remains!) */}
              {currentStep === "calling-success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Check className="w-12 h-12 text-green-600" />
                  </div>

                  <h3 className="text-3xl font-extrabold text-gray-900 mb-3">
                    Demo Call Requested!
                  </h3>

                  <p className="text-gray-600 mb-10">
                    Our AI will call <strong>{formData.name}</strong> at{" "}
                    <strong>
                      {formData.countryCode}
                      {formData.phone}
                    </strong>{" "}
                    shortly.
                  </p>

                  <button
                    onClick={() => setCurrentStep("selection")}
                    className="text-gray-500 hover:text-gray-700 underline text-sm"
                  >
                    ← Back to demo options
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WIDGET POPUP — autosize to component */}
      <AnimatePresence>
        {(currentStep === "widget-custom" ||
          currentStep === "widget-sample") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setCurrentStep("selection")}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 250 }}
              className="
          relative
          bg-white
          rounded-2xl
          shadow-2xl
          w-auto
          max-w-4xl
          max-h-[90vh]
          overflow-auto
          p-6
        "
              onClick={(e) => e.stopPropagation()} // Prevent closing on inner click
            >
              {/* Close Button */}
              {/* <button
                onClick={() => setCurrentStep("selection")}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-7 h-7" />
              </button> */}

              {/* DYNAMIC CONTENT ONLY (auto size) */}
              <div className="mt-4">
                {currentStep === "widget-custom" && <Dynamic />}
                {currentStep === "widget-sample" && <RavanForm />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FREEBIE POPUP */}
      <AnimatePresence>
        {showFreebiePopup && (
          <FreebiePopup onClose={() => setShowFreebiePopup(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBookDemoPopup && (
          <BookDemoPopup onClose={() => setShowBookDemoPopup(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default DemoExperienceSection;
