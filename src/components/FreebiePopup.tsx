import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Check, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BookDemoPopup } from "./BookDemoPopup";
import axios from "axios";
import { Loader2 } from "lucide-react";
type FreebieStep = "intro" | "steps" | "details" | "success";

const FreebiePopup = ({ onClose }: { onClose: () => void }) => {
  const LOCAL_STORAGE_KEY = "ravan_demo_user_data";
  const [step, setStep] = useState<FreebieStep>("intro");
  const [showBookDemo, setShowBookDemo] = useState(false); // 👈 NEW
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const user_info = useRef<{
    email: string;
    name: string;
    phone: string;
    countryCode: string;
    businessName: string;
  }>({ email: "", name: "", phone: "", countryCode: "", businessName: "" });
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [competitorName, setCompetitorName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const customer_info = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (customer_info) {
      user_info.current = JSON.parse(customer_info);
    }
    if (videoUrl.trim()) {
      setError("");
    }
  }, [videoUrl]);

  const handlevideourlSubmit = async () => {
    if (videoUrl.trim()) {
      setError("");
    } else {
      setError("Please paste your Instagram story link.");
      return;
    }
    setLoading(true);
    await axios.post(
      "https://services.leadconnectorhq.com/hooks/LK2LrQP5tkIZ3ahmumnr/webhook-trigger/0725d46e-622e-45e5-bfc5-20061f7750e6",
      {
        email: user_info.current.email,
        name: user_info.current.name,
        phone:
          user_info.current.countryCode +
          user_info.current.phone.replace(/[^\d]/g, ""),
        businessName: user_info.current.businessName,
        videoUrl: videoUrl,
      }
    );
    setStep("details");
    setLoading(false);
  };

  const handleDetailsSubmit = async () => {
    if (companyWebsite.trim()) {
      setError("");
    } else {
      setError("Please enter your company website.");
      return;
    }
    setLoading(true);
    await axios.post(
      "https://services.leadconnectorhq.com/hooks/LK2LrQP5tkIZ3ahmumnr/webhook-trigger/8ee0dcd6-2203-446f-a019-ad38dc1d81ab",
      {
        email: user_info.current.email,
        name: user_info.current.name,
        phone:
          user_info.current.countryCode +
          user_info.current.phone.replace(/[^\d]/g, ""),
        businessName: user_info.current.businessName,
        companyWebsite: companyWebsite,
        competitorName: competitorName,
        targetAudience: targetAudience,
      }
    );
    // await axios.post(
    //   "https://aiinfluencer.ravan.ai/api/v1/protected/demo/generate-business-info-video/",
    //   {
    //     user_id: "0e866be4-ab17-466e-b865-808dc277a780",
    //     website_url: companyWebsite,
    //     project_id: "d5d7cd9e-1bff-4a0b-bdb3-a5db96bdda3d",
    //     client_email: user_info.current.email,
    //     key_competitors: competitorName,
    //   }
    // );
    setStep("success");
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>

          {/* INTRO */}
          {step === "intro" && (
            <>
              <Gift className="w-16 h-16 text-orange-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-center mb-2">
                Free 30-Second AI Influencer Video!
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Get a personalized AI video promoting your company — made for
                you!
              </p>

              <button
                onClick={() => setStep("steps")}
                className="bg-orange-500 text-white font-bold w-full py-4 rounded-xl hover:bg-orange-600 transition flex items-center justify-center gap-2"
              >
                How to get it
                <ArrowRight />
              </button>
            </>
          )}
          {step === "steps" && (
            <>
              <h2 className="text-xl font-bold mb-6 text-center">
                3 Simple Steps
              </h2>

              <div className="space-y-4">
                {/* STEP 1 */}
                <div className="flex items-center gap-4 bg-orange-50 rounded-xl p-4">
                  <div className="w-8 h-8 bg-orange-500 text-white font-bold rounded-full flex items-center justify-center">
                    1
                  </div>
                  <p className="text-gray-800 text-sm">
                    Take a selfie with Ravan.ai’s Booth
                  </p>
                </div>

                {/* STEP 2 */}
                <div className="flex items-center gap-4 bg-orange-50 rounded-xl p-4">
                  <div className="w-8 h-8 bg-orange-500 text-white font-bold rounded-full flex items-center justify-center">
                    2
                  </div>
                  <p className="text-gray-800 text-sm">
                    Post a story on Instagram tagging @ravan.aiagent
                  </p>
                </div>

                {/* STEP 3 (with input) */}
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-8 h-8 bg-orange-500 text-white font-bold rounded-full flex items-center justify-center">
                      3
                    </div>
                    <p className="text-gray-800 text-sm">
                      Paste your story link here:
                    </p>
                  </div>

                  <input
                    type="text"
                    placeholder="Paste Instagram story link..."
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              </div>

              <button
                onClick={() => {
                  handlevideourlSubmit();
                }}
                className={`bg-orange-500 text-white font-bold w-full py-4 rounded-xl mt-6 hover:bg-orange-600 transition flex items-center justify-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  "I've Done It! Get My Video"
                )}
              </button>
            </>
          )}

          {/* DETAILS */}
          {step === "details" && (
            <>
              <h2 className="text-xl font-bold text-center mb-6">
                Almost There!
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Company Website URL *"
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <input
                  type="text"
                  placeholder="Competitors Name  (optional but recommended)"
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Target audience  (optional but recommended)"
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>

              <button
                onClick={() => {
                  handleDetailsSubmit();
                }}
                className={`bg-orange-500 text-white font-bold w-full py-4 rounded-xl mt-6 hover:bg-orange-600 transition flex items-center justify-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating Your Video...
                  </>
                ) : (
                  "Generate My Free AI Video!"
                )}
              </button>
            </>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <Check className="w-12 h-12 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-center mb-4">
                You’ve Claimed Your Freebie 🎉
              </h2>

              <p className="text-gray-600 text-center text-sm leading-relaxed mb-4">
                You will receive it shortly via email from info@ravan.ai.
              </p>

              <p className="text-gray-400 text-center text-xs mb-3">
                Check Spam / Junk if you don’t see it.
              </p>
              <button
                onClick={() => setShowBookDemo(true)}
                className={`bg-orange-500 text-white font-bold w-full py-2  rounded-xl hover:bg-orange-600 transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                Book A Free 1:1 AI Consultation Call
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
      {showBookDemo && <BookDemoPopup onClose={() => setShowBookDemo(false)} />}
    </AnimatePresence>
  );
};

export default FreebiePopup;
