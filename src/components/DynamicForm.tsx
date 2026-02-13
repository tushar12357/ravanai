import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageSquare,
  Check,
  X,
  ChevronRight,
  Lock,
} from "lucide-react";
import axios from "axios";
import Dynamic from "./Dynamic";
import ravanLogo from "@/assets/logo.png";
import { countryCodes } from "./countryCodes";

interface DemoFormData {
  name: string;
  phone: string;
  email: string;
  businessName: string;
  countryCode: string;
  countryLabel: string;
}

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
        setSearch("");
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen, setSearch]);

  const filtered = countryCodes.filter((c) => {
    const s = search.toLowerCase().trim();
    return c.name.toLowerCase().includes(s) || c.code.includes(s);
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
        <svg
          className="w-4 h-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
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
            onMouseDown={(e) => e.stopPropagation()}
          />
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-center">
                No countries found
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={`${c.code}-${c.name}`}
                  type="button"
                  onClick={() => onSelect(c)}
                  onMouseDown={(e) => e.stopPropagation()}
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

// Portal wrapper component for modals
const ModalPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
};

const DemoExperienceSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [hasReachedSection, setHasReachedSection] = useState(false);

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

  // Modal states
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [pendingDemo, setPendingDemo] = useState<"widget" | "calling" | null>(
    null,
  );

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  // Calling states
  const [isCallingSubmitting, setIsCallingSubmitting] = useState(false);
  const [callingSubmitSuccess, setCallingSubmitSuccess] = useState(false);

  // Check if user has already completed form
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const country =
          countryCodes.find((c) => c.code === parsed.countryCode) ||
          countryCodes[0];
        setFormData({
          name: parsed.name || "",
          phone: parsed.phone || "",
          email: parsed.email || "",
          businessName: parsed.businessName || "",
          countryCode: country.code,
          countryLabel: country.name,
        });
        // If form data exists and is valid, mark as completed
        if (parsed.name && parsed.phone && parsed.email) {
          setIsFormCompleted(true);
        }
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Intersection Observer to detect when section is in view
  useEffect(() => {
    // Don't setup observer if form is already completed
    if (isFormCompleted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When section comes into view and form is not completed
          if (entry.isIntersecting && !isFormCompleted && !hasReachedSection) {
            setHasReachedSection(true);
            setShowInfoModal(true);
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of section is visible
        rootMargin: "-50px",
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isFormCompleted, hasReachedSection]);

  // CRITICAL: Prevent all scrolling and interactions when modal is open and form not completed
  useEffect(() => {
    if (showInfoModal && !isFormCompleted) {
      // Block body scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = "0";

      // Prevent escape key from closing
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener("keydown", handleKeyDown, { capture: true });

      return () => {
        document.removeEventListener("keydown", handleKeyDown, {
          capture: true,
        });
      };
    } else if (pendingDemo) {
      // Allow normal scroll blocking for demo modals
      document.body.style.overflow = "hidden";
    } else {
      // Restore scrolling
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
      document.body.style.top = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
      document.body.style.top = "unset";
    };
  }, [showInfoModal, isFormCompleted, pendingDemo]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Save to localStorage & send to webhook
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));

    try {
      await axios.post(
        "https://services.leadconnectorhq.com/hooks/LK2LrQP5tkIZ3ahmumnr/webhook-trigger/2YDqWleQcK5pdYFne1Wy",
        {
          email: formData.email.trim(),
          name: formData.name.trim(),
          receiver_number:
            formData.countryCode + formData.phone.replace(/[^\d]/g, ""),
          businessName: formData.businessName.trim(),
        },
      );
    } catch (err) {
      console.error("Webhook failed", err);
      // Still proceed — don't block demo
    }

    setSubmitSuccess(true);
    setIsFormCompleted(true);

    setTimeout(() => {
      setShowInfoModal(false);
      setIsSubmitting(false);
      setSubmitSuccess(false);

      // Now open the intended demo if user clicked on one
      if (pendingDemo === "widget") {
        const temp = pendingDemo;
        setPendingDemo(null);
        setTimeout(() => setPendingDemo(temp), 300);
      } else if (pendingDemo === "calling") {
        const temp = pendingDemo;
        setPendingDemo(null);
        setTimeout(() => setPendingDemo(temp), 300);
      }
    }, 800);
  };

  const openInfoModalFor = (demo: "widget" | "calling") => {
    if (!isFormCompleted) {
      // If form not completed, show form first
      setPendingDemo(demo);
      setShowInfoModal(true);
    } else {
      // If form already completed, open demo directly
      setPendingDemo(demo);
    }
  };

  const handleCallingRequest = async () => {
    const cleanPhone = formData.phone.replace(/[^\d]/g, "");
    const fullNumber = formData.countryCode + cleanPhone;

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
          receiver_number: fullNumber,
        },
      );

      setCallingSubmitSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to request call. Please try again.");
    } finally {
      setIsCallingSubmitting(false);
    }
  };

  return (
    <>
      {/* MAIN SECTION */}
      <section
        ref={sectionRef}
        className="py-20 bg-[#FDF9F5] relative overflow-hidden"
      >
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block px-5 py-2 bg-[#FFE5D9] text-[#FF6B35] rounded-full text-sm font-semibold tracking-wide">
              Interactive Demo
            </span>
            <h2 className="mt-6 text-5xl font-black text-gray-900 leading-tight">
              Experience Our AI Solutions
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Try live demos of our AI solutions and see how they can transform
              your business instantly.
            </p>
          </div>

          {/* Demo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* AI Website Voice Widget */}
            <motion.div
              whileHover={isFormCompleted ? { y: -4 } : {}}
              onClick={() => openInfoModalFor("widget")}
              className={`rounded-3xl p-8 transition-all shadow-lg border-4 bg-white/70 ${
                isFormCompleted
                  ? "cursor-pointer border-transparent hover:border-[#FF8B60]"
                  : "cursor-not-allowed border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start gap-5">
                <div className="p-4 rounded-2xl bg-[#FFE5D9] text-[#FF6B35] relative">
                  <MessageSquare className="w-8 h-8" />
                  {!isFormCompleted && (
                    <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    AI Website Voice Widget
                    {!isFormCompleted && (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    AI speech-to-speech bot that engages visitors and converts
                    leads 24/7
                  </p>
                  {!isFormCompleted && (
                    <p className="mt-3 text-sm text-orange-600 font-semibold">
                      Complete form to unlock
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* AI Calling */}
            <motion.div
              whileHover={isFormCompleted ? { y: -4 } : {}}
              onClick={() => openInfoModalFor("calling")}
              className={`rounded-3xl p-8 transition-all shadow-lg border-4 bg-white/70 ${
                isFormCompleted
                  ? "cursor-pointer border-transparent hover:border-[#FF8B60]"
                  : "cursor-not-allowed border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start gap-5">
                <div className="p-4 rounded-2xl bg-[#FFE5D9] text-[#FF6B35] relative">
                  <Phone className="w-8 h-8" />
                  {!isFormCompleted && (
                    <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    AI Calling
                    {!isFormCompleted && (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    AI phone caller that handles calls, books appointments, and
                    follows up
                  </p>
                  {!isFormCompleted && (
                    <p className="mt-3 text-sm text-orange-600 font-semibold">
                      Complete form to unlock
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ALL MODALS RENDERED IN PORTAL */}
      <ModalPortal>
        {/* MANDATORY INFO MODAL — Blocks everything until completed */}
        <AnimatePresence>
          {showInfoModal && !isFormCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
              style={{ pointerEvents: "auto" }}
              onClick={(e) => {
                // Completely prevent any outside clicks
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative bg-white rounded-3xl shadow-2xl border-4 border-orange-500 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="h-[150px] flex flex-col justify-center items-center rounded-t-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 gap-4">
                  <div className="w-[80px] h-[80px] bg-white rounded-3xl shadow-2xl p-3 border-4 border-white">
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center overflow-hidden">
                      <img
                        src={ravanLogo}
                        alt="Ravan Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 pb-8 px-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Welcome to{" "}
                      <span className="text-orange-500 font-extrabold">
                        Ravan.ai
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm mt-2 font-medium">
                      Complete this form to unlock our interactive demos
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full h-11 px-4 bg-gray-50 border-2 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition ${
                        errors.name ? "border-red-500" : "border-gray-200"
                      }`}
                      autoFocus
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs -mt-2">
                        {errors.name}
                      </p>
                    )}

                    <div>
                      <label className="text-xs text-gray-500 font-semibold">
                        Phone Number *
                      </label>
                      <div className="flex gap-3 mt-1">
                        <CountryDropdown
                          formData={formData}
                          setFormData={setFormData}
                          isOpen={isCountryDropdownOpen}
                          setIsOpen={setIsCountryDropdownOpen}
                          search={countrySearch}
                          setSearch={setCountrySearch}
                        />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`flex-1 h-11 px-4 bg-gray-50 border-2 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition ${
                            errors.phone ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs ">{errors.phone}</p>
                      )}
                    </div>

                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full h-11 px-4 bg-gray-50 border-2 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition ${
                        errors.email ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs -mt-2">
                        {errors.email}
                      </p>
                    )}

                    <input
                      type="text"
                      name="businessName"
                      placeholder="Company Name *"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full h-11 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting || submitSuccess}
                      className={`w-full h-12 text-base font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                        submitSuccess
                          ? "bg-green-500 text-white"
                          : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white hover:shadow-xl"
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Unlocking...
                        </div>
                      ) : submitSuccess ? (
                        <>
                          Unlocked! <Check className="w-5 h-5" />
                        </>
                      ) : (
                        <>
                          Unlock Demos <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-xs text-gray-400 mt-4">
                    Your information is safe and will never be shared
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CUSTOM WIDGET MODAL */}
        <AnimatePresence>
          {pendingDemo === "widget" && !showInfoModal && isFormCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setPendingDemo(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="relative bg-white rounded-2xl shadow-2xl w-auto max-w-4xl max-h-[90vh] overflow-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setPendingDemo(null)}
                  className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 shadow-md"
                >
                  <X className="w-5 h-5" />
                </button>
                <Dynamic />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI CALLING MODAL */}
        <AnimatePresence>
          {pendingDemo === "calling" && !showInfoModal && isFormCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
              onClick={() => setPendingDemo(null)}
            >
              <motion.div
                initial={{ scale: 0.92 }}
                animate={{ scale: 1 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl mx-auto p-12"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setPendingDemo(null)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-7 h-7" />
                </button>

                <div className="text-center">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl mx-auto mb-8">
                    <Phone className="w-14 h-14 text-white" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-5">
                    AI Calling Demo
                  </h3>
                  <p className="text-gray-600 text-sm mb-10">
                    Our AI will call you shortly to show how it books
                    appointments and follows up.
                  </p>

                  <p className="text-lg text-gray-500 mb-2">Calling:</p>
                  <div className="flex items-center justify-center gap-3 mb-10">
                    <CountryDropdown
                      formData={formData}
                      setFormData={setFormData}
                      isOpen={isCountryDropdownOpen}
                      setIsOpen={setIsCountryDropdownOpen}
                      search={countrySearch}
                      setSearch={setCountrySearch}
                    />
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
                    />
                  </div>

                  <button
                    onClick={handleCallingRequest}
                    disabled={isCallingSubmitting || callingSubmitSuccess}
                    className={`w-full py-5 rounded-full text-xl font-bold shadow-lg flex items-center justify-center gap-3 max-w-md mx-auto ${
                      callingSubmitSuccess
                        ? "bg-green-500 text-white"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white"
                    }`}
                  >
                    {isCallingSubmitting ? (
                      "Requesting..."
                    ) : callingSubmitSuccess ? (
                      <>
                        Call Requested! <Check className="w-6 h-6" />
                      </>
                    ) : (
                      <>
                        Start Demo Call <Phone className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ModalPortal>
    </>
  );
};

export default DemoExperienceSection;
