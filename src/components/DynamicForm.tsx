import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageSquare,
  Gift,
  Sparkles,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import Dynamic from "./Dynamic";
import RavanForm from "./RavanForm";

interface DemoFormData {
  name: string;
  phone: string;
  email: string;
  businessName: string;
}

type DemoStep =
  | "selection"           // Initial card selection
  | "widget-mode-select"  // Custom vs Sample choice
  | "widget-custom"
  | "widget-sample"
  | "calling-form"
  | "calling";

interface CallingFormData {
  name: string;
  phone: string;
}




const DemoExperienceSection = () => {
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [formData, setFormData] = useState<DemoFormData>({
    name: "",
    phone: "",
    email: "",
    businessName: "",
  });
  const [errors, setErrors] = useState<Partial<DemoFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [currentStep, setCurrentStep] = useState<DemoStep>("selection");
  const [showFreebiePopup, setShowFreebiePopup] = useState(false);

  // Widget-specific states (retained for now)
  const [widgetMode, setWidgetMode] = useState<"custom" | "sample" | null>(null);

  // Calling form states
  const [callingFormData, setCallingFormData] = useState<CallingFormData>({
    name: "",
    phone: "",
  });
  const [callingErrors, setCallingErrors] = useState<Partial<CallingFormData>>({});
  const [isCallingSubmitting, setIsCallingSubmitting] = useState(false);
  const [callingSubmitSuccess, setCallingSubmitSuccess] = useState(false);

  // Form validation for initial modal
  const validateForm = (): boolean => {
    const newErrors: Partial<DemoFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/[^\d+]/g, "")))
      newErrors.phone = "Enter a valid phone number";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email address";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const BackToSelection = () => (
  <div className="mt-8 text-center">
    <button
      onClick={() => setCurrentStep("selection")}
      className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 underline-offset-4 hover:underline transition"
    >
      <ArrowRight className="w-4 h-4 rotate-180" />
      Back to Demo Selection
    </button>
  </div>
);

  // Handle input change for initial modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on typing
    if (errors[name as keyof DemoFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Submit form to API for initial modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await axios.post("https://test.snowie.ai/api/start-demo/", {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        business_name: formData.businessName.trim() || null,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setShowInfoModal(false);
      }, 1500);
    } catch (err: any) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calling form validation
  const validateCallingForm = (): boolean => {
    const newErrors: Partial<CallingFormData> = {};

    if (!callingFormData.name.trim()) newErrors.name = "Name is required";
    if (!callingFormData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[\d\s\-\+\(\)]{10,}$/.test(callingFormData.phone.replace(/[^\d+]/g, "")))
      newErrors.phone = "Enter a valid phone number";

    setCallingErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change for calling form
  const handleCallingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCallingFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on typing
    if (callingErrors[name as keyof CallingFormData]) {
      setCallingErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Submit calling form to API
  const handleCallingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCallingForm()) return;

    setIsCallingSubmitting(true);

    try {
      await axios.post("https://app.closerx.ai/api/testcall/voizerfreeaccount/", {
        access_key: "testmycall",
        calling_number: "+18582520325",
        email: "gkf@m.com", // You can make this dynamic if needed, e.g., from initial formData.email
        name: callingFormData.name.trim(),
        new_agent: 164,
        receiver_number: callingFormData.phone.trim(),
      });

      setCallingSubmitSuccess(true);
      setTimeout(() => {
        setCurrentStep("calling"); // Transition to success/thank you screen
      }, 1500);
    } catch (err: any) {
      console.error("Calling submission failed:", err);
      // Optionally set an error message
    } finally {
      setIsCallingSubmitting(false);
    }
  };

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
              Try our powerful AI tools firsthand and see how they can transform your business
            </p>
          </div>

          {/* Demo Selection Cards */}
          {currentStep === "selection" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              {/* Website Widget */}
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => setCurrentStep("widget-mode-select")}
                className="cursor-pointer rounded-3xl p-8 bg-white shadow-lg border-2 transition-all border-gray-200 hover:border-[#FF8B60]"
              >
                <div className="flex items-start gap-5">
                  <div className="p-4 rounded-2xl bg-[#FFE5D9] text-[#FF6B35]">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Website Widget</h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">
                      AI chatbot that engages visitors and converts leads 24/7
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* AI Calling */}
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => setCurrentStep("calling-form")}
                className="cursor-pointer rounded-3xl p-8 bg-white shadow-lg border-2 transition-all border-gray-200 hover:border-[#FF8B60]"
              >
                <div className="flex items-start gap-5">
                  <div className="p-4 rounded-2xl bg-[#FFE5D9] text-[#FF6B35]">
                    <Phone className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">AI Calling</h3>
                    <p className="mt-2 text-gray-600 leading-relaxed">
                      Voice AI that handles calls, books appointments, and follows up
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Conditional Demo Content */}
          <AnimatePresence mode="wait">
            {/* Widget Mode Selection */}
            {currentStep === "widget-mode-select" && (
              <motion.div
                key="widget-mode-select"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto"
              >
                <button
                  onClick={() => setCurrentStep("widget-custom")}
                  className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-all group"
                >
                  <Sparkles className="w-14 h-14 text-[#FF6B35] mx-auto mb-5 group-hover:scale-110 transition" />
                  <h4 className="text-2xl font-bold mb-3">Create Custom Widget</h4>
                  <p className="text-gray-600">Build your own AI chatbot from scratch</p>
                </button>

                <button
                  onClick={() => {
                    setCurrentStep("widget-sample");
                    setTimeout(() => setShowFreebiePopup(true), 1500);
                  }}
                  className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-all group"
                >
                  <MessageSquare className="w-14 h-14 text-[#FF6B35] mx-auto mb-5 group-hover:scale-110 transition" />
                  <h4 className="text-2xl font-bold mb-3">Try Sample Bot</h4>
                  <p className="text-gray-600">Instantly test a pre-built demo</p>
                </button>
                <div className="mt-8 text-center">
    <button
      onClick={() => setCurrentStep("selection")}
      className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 underline-offset-4 hover:underline transition"
    >
      <ArrowRight className="w-4 h-4 rotate-180" />
      Back to Demo Selection
    </button>
  </div>
              </motion.div>
            )}

            {/* Custom Widget Builder */}
            {currentStep === "widget-custom" && (
              <motion.div
                key="widget-custom"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10"
              >
                <h3 className="text-3xl font-bold text-center mb-8">Custom AI Widget Builder</h3>
                <Dynamic />
                <div className="mt-8 text-center">
    <button
      onClick={() => setCurrentStep("selection")}
      className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 underline-offset-4 hover:underline transition"
    >
      <ArrowRight className="w-4 h-4 rotate-180" />
      Back to Demo Selection
    </button>
  </div>
              </motion.div>
            )}

            {/* Sample Chatbot */}
            {currentStep === "widget-sample" && (
              <motion.div
                key="widget-sample"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-10"
              >
                <h3 className="text-3xl font-bold text-center mb-8">Sample AI Chatbot</h3>
                <RavanForm />
                <div className="mt-8 text-center">
    <button
      onClick={() => setCurrentStep("selection")}
      className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 underline-offset-4 hover:underline transition"
    >
      <ArrowRight className="w-4 h-4 rotate-180" />
      Back to Demo Selection
    </button>
  </div>
              </motion.div>
            )}

            {/* AI Calling Form */}
            {currentStep === "calling-form" && (
              <motion.div
                key="calling-form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-10"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-[#FFE5D9] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Phone className="w-10 h-10 text-[#FF6B35]" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Request AI Calling Demo</h3>
                  <p className="text-gray-600">
                    Provide your details, and our AI will call you to demonstrate natural conversation and appointment booking.
                  </p>
                </div>

                <form onSubmit={handleCallingSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name *"
                        value={callingFormData.name}
                        onChange={handleCallingChange}
                        className={`w-full px-6 py-5 rounded-xl border-2 transition-all ${
                          callingErrors.name ? "border-red-500" : "border-gray-300 focus:border-[#FF6B35]"
                        } focus:outline-none`}
                        required
                        disabled={isCallingSubmitting}
                      />
                      {callingErrors.name && <p className="text-red-500 text-sm mt-2">{callingErrors.name}</p>}
                    </div>

                    <div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number *"
                        value={callingFormData.phone}
                        onChange={handleCallingChange}
                        className={`w-full px-6 py-5 rounded-xl border-2 transition-all ${
                          callingErrors.phone ? "border-red-500" : "border-gray-300 focus:border-[#FF6B35]"
                        } focus:outline-none`}
                        required
                        disabled={isCallingSubmitting}
                      />
                      {callingErrors.phone && <p className="text-red-500 text-sm mt-2">{callingErrors.phone}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCallingSubmitting || callingSubmitSuccess}
                    className={`w-full py-6 rounded-full text-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 ${
                      isCallingSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : callingSubmitSuccess
                        ? "bg-green-500"
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
                </form>

                <button
                  onClick={() => setCurrentStep("selection")}
                  className="mt-6 text-gray-500 hover:text-gray-700 underline text-sm"
                >
                  ← Back to Demo Selection
                </button>
              </motion.div>
            )}

            {/* AI Calling Success Screen */}
            {currentStep === "calling" && (
              <motion.div
                key="calling"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="text-center max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-16"
              >
                <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Check className="w-14 h-14 text-green-500" />
                </div>
                <h3 className="text-3xl font-bold mb-6">Demo Call Requested!</h3>
                <p className="text-gray-600 text-lg mb-10">
                  Our AI will call you shortly at <strong>{callingFormData.phone}</strong> to showcase our voice AI capabilities.
                </p>
                <button
                  onClick={() => setCurrentStep("selection")}
                  className="bg-[#FF6B35] text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-[#FF8B60] transition shadow-lg"
                >
                  Explore Other Demos
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Freebie CTA */}
          {currentStep !== "selection" && !showFreebiePopup && (
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

      {/* INITIAL INFO MODAL WITH API SUBMISSION */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => !isSubmitting && setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => !isSubmitting && setShowInfoModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition"
                disabled={isSubmitting}
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-4xl font-black text-center mb-4">
                Experience Ravan AI Live
              </h2>
              <p className="text-center text-gray-600 text-lg mb-10">
                Enter your details to unlock the demos
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-6 py-5 rounded-xl border-2 transition-all ${
                        errors.name ? "border-red-500" : "border-gray-300 focus:border-[#FF6B35]"
                      } focus:outline-none`}
                      required
                      disabled={isSubmitting}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
                  </div>

                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-6 py-5 rounded-xl border-2 transition-all ${
                        errors.phone ? "border-red-500" : "border-gray-300 focus:border-[#FF6B35]"
                      } focus:outline-none`}
                      required
                      disabled={isSubmitting}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-2">{errors.phone}</p>}
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-6 py-5 rounded-xl border-2 transition-all ${
                        errors.email ? "border-red-500" : "border-gray-300 focus:border-[#FF6B35]"
                      } focus:outline-none`}
                      required
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                  </div>

                  <div>
                    <input
                      type="text"
                      name="businessName"
                      placeholder="Business Name (Optional)"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full px-6 py-5 rounded-xl border-2 border-gray-300 focus:border-[#FF6B35] focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || submitSuccess}
                  className={`w-full py-6 rounded-full text-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : submitSuccess
                      ? "bg-green-500"
                      : "bg-[#000000] hover:bg-[#000000] text-white"
                  }`}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : submitSuccess ? (
                    <>
                      <Check className="w-6 h-6" />
                      Unlocked!
                    </>
                  ) : (
                    <>
                      Continue to Demos
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>
              </form>
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
              <h3 className="text-2xl font-bold mb-4">Claim Your Free AI Video!</h3>
              <p className="text-gray-600 mb-8">
                Follow us on Instagram & tag us to unlock your personalized AI influencer video!
              </p>
              <a
                href="https://instagram.com/yourhandle"
                target="_blank"
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