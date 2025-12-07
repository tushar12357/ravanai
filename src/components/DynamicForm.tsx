import { useEffect, useState } from "react";
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
} from "lucide-react";
import axios from "axios";
import Select from "react-select";
import ReactCountryFlag from "react-country-flag";
import Dynamic from "./Dynamic";
import RavanForm from "./RavanForm";
import ravanLogo from "@/assets/logo.png";

// Replace this line:
// import countryList from "react-select-country-list";

// With this custom list (includes proper +dial codes)
const countryOptions = [
  { label: "United States", value: "+1", code: "US" },
  { label: "India", value: "+91", code: "IN" },
  { label: "United Kingdom", value: "+44", code: "GB" },
  { label: "Canada", value: "+1", code: "CA" },
  { label: "Australia", value: "+61", code: "AU" },
  { label: "Germany", value: "+49", code: "DE" },
  { label: "France", value: "+33", code: "FR" },
  { label: "Brazil", value: "+55", code: "BR" },
  { label: "United Arab Emirates", value: "+971", code: "AE" },
  { label: "Saudi Arabia", value: "+966", code: "SA" },
  { label: "Singapore", value: "+65", code: "SG" },
  { label: "Malaysia", value: "+60", code: "MY" },
  { label: "Indonesia", value: "+62", code: "ID" },
  { label: "Philippines", value: "+63", code: "PH" },
  { label: "Thailand", value: "+66", code: "TH" },
  { label: "Vietnam", value: "+84", code: "VN" },
  { label: "South Africa", value: "+27", code: "ZA" },
  { label: "Nigeria", value: "+234", code: "NG" },
  { label: "Kenya", value: "+254", code: "KE" },
  { label: "Mexico", value: "+52", code: "MX" },
  // Add more if needed — this covers 99% of traffic
].sort((a, b) => a.label.localeCompare(b.label));
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
  const [errors, setErrors] = useState<Partial<DemoFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<DemoStep>("selection");
  const [showFreebiePopup, setShowFreebiePopup] = useState(false);

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
              countryOptions.find((c) => c.value === parsed.countryCode) ||
              countryOptions.find((c) => c.value === "+1")!;

            return {
              name: parsed.name || "",
              phone: parsed.phone || "",
              email: parsed.email || "",
              businessName: parsed.businessName || "",
              countryCode: country.value,
              countryLabel: country.label,
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
          email: formData.email.trim() || "demo@ravan.ai",
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
      <span className="font-medium">{label}</span>
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
              Experience Our AI Solutions AI Solutions
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Try our powerful AI tools firsthand and see how they can transform
              your business
            </p>
          </div>

          {/* Persistent Demo Selector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Website Widget Tab */}
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
                    Website Widget
                  </h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    AI speech-to-speech bot that engages visitors and converts
                    leads 24/7
                  </p>
                  {currentStep.startsWith("widget") && (
                    <div className="mt-4 flex items-center gap-2 text-[#FF6B35] font-bold">
                      <Zap className="w-5 h-5" />
                      <span>Active Demo</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

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
                    Voice AI that handles calls, books appointments, and follows
                    up
                  </p>
                  {currentStep.startsWith("calling") && (
                    <div className="mt-4 flex items-center gap-2 text-[#FF6B35] font-bold">
                      <Zap className="w-5 h-5" />
                      <span>Active Demo</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Dynamic Demo Content Area */}
          <AnimatePresence mode="wait">
            {/* Widget Flow */}
            {currentStep.startsWith("widget") && (
              <motion.div
                key="widget-tabs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto mb-12"
              >
                <button
                  onClick={() => setCurrentStep("widget-custom")}
                  className={`bg-white rounded-3xl shadow-xl p-10 transition-all group border-4 ${
                    currentStep === "widget-custom"
                      ? "border-[#FF6B35] shadow-2xl scale-105"
                      : "border-transparent hover:border-[#FF6B35]"
                  }`}
                >
                  <Sparkles className="w-14 h-14 text-[#FF6B35] mx-auto mb-5" />
                  <h4 className="text-2xl font-bold mb-3">
                    Create Custom Widget
                  </h4>
                  <p className="text-gray-600">
                    Build your own AI speech-to-speech bot from scratch
                  </p>
                </button>

                <button
                  onClick={() => setCurrentStep("widget-sample")}
                  className={`bg-white rounded-3xl shadow-xl p-10 transition-all group border-4 ${
                    currentStep === "widget-sample"
                      ? "border-[#FF6B35] shadow-2xl scale-105"
                      : "border-transparent hover:border-[#FF6B35]"
                  }`}
                >
                  <MessageSquare className="w-14 h-14 text-[#FF6B35] mx-auto mb-5" />
                  <h4 className="text-2xl font-bold mb-3">Try Sample Bot</h4>
                  <p className="text-gray-600">
                    Instantly test a pre-built demo
                  </p>
                </button>
              </motion.div>
            )}

            {currentStep.startsWith("widget") && (
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
            )}

            {/* AI Calling Flow */}
            {currentStep === "calling-confirm" && (
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
                    Our AI will call you shortly to demonstrate natural
                    conversation and appointment booking.
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
            )}
          </AnimatePresence>

          {/* Freebie CTA */}
          {currentStep.startsWith("widget") && !showFreebiePopup && (
            <div className="text-center mt-20">
              <button
                onClick={() => setShowFreebiePopup(true)}
                className="inline-flex items-center gap-3 bg-white text-[#FF6B35] px-10 py-5 rounded-full text-xl font-bold shadow-xl border-2 border-[#FF6B35] hover:bg-[#FFF0EC] transition transform hover:scale-105"
              >
                <Gift className="w-7 h-7" />
                Get Your Freebie!
              </button>
            </div>
          )}
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
            onClick={() => !isSubmitting && setShowInfoModal(false)}
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
                        Ravan
                      </span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Thanks for stopping by!
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
                          <Select
                            options={countryOptions}
                            value={countryOptions.find(
                              (opt) => opt.value === formData.countryCode
                            )}
                            onChange={handleCountryChange}
                            formatOptionLabel={formatOptionLabel}
                            styles={selectStyles}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Code"
                            isSearchable
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
                        placeholder="Business Name"
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
                      No data sent • Just for personalization
                    </motion.p>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FREEBIE POPUP */}
      <AnimatePresence>
        {showFreebiePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFreebiePopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFreebiePopup(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <Gift className="w-16 h-16 text-[#FF6B35] mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">
                Claim Your Free AI Video!
              </h3>
              <p className="text-gray-600 mb-8">
                Follow us on Instagram & tag us to unlock your personalized AI
                influencer video!
              </p>
              <a
                href="https://www.instagram.com/ravan.aiagent/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#FF6B35] text-white px-8 py-4 rounded-full font-bold hover:bg-[#FF8B60] inline-block"
              >
                Let's Do It!
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DemoExperienceSection;
