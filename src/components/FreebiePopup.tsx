import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { BookDemoPopup } from "./BookDemoPopup";
type FreebieStep = "intro" | "steps" | "details" | "success";

const FreebiePopup = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<FreebieStep>("intro");
  const [showBookDemo, setShowBookDemo] = useState(false); // 👈 NEW

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
                Get a personalized AI video promoting your company — made for you!
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

          {/* STEPS */}
       {/* STEPS */}
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
        />
      </div>

    </div>

    <button
      onClick={() => setStep("details")}
      className="bg-orange-500 text-white font-bold w-full py-4 rounded-xl mt-6 hover:bg-orange-600 transition"
    >
      I’ve Done It! Get My Video
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
                />
                <input
                  type="text"
                  placeholder="Competitors Name  (optional but recommended)"
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Target audience  (optional but recommended)"
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <button
                onClick={() => setStep("success")}
                className="bg-orange-500 text-white font-bold w-full py-4 rounded-xl mt-6 hover:bg-orange-600"
              >
                Generate My Free AI Video!
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
                Your AI video is being processed.  
                You will receive it in 15–20 minutes via email from info@ravan.ai.
              </p>

              <p className="text-gray-400 text-center text-xs mb-3">
                Check Spam / Junk if you don’t see it.
              </p>
             <button
                onClick={() => setShowBookDemo(true)}
                className="bg-orange-500 text-white font-bold w-full py-2  rounded-xl hover:bg-orange-600 transition"
            >
              Book A Free 1:1 AI Consultation Call
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
         {showBookDemo && (
        <BookDemoPopup onClose={() => setShowBookDemo(false)} />
      )}
    </AnimatePresence>
  );
};

export default FreebiePopup;
