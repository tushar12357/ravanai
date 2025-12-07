import { useEffect } from "react";
import { X } from "lucide-react";

export const BookDemoPopup = ({ onClose }: { onClose: () => void }) => {

  useEffect(() => {
    // Dynamically load script (runs once)
    const script = document.createElement("script");
    script.src = "https://link.ravan.ai/js/form_embed.js";
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-[800px] bg-white rounded-lg overflow-hidden">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/30 hover:bg-black/50"
        >
          <X className="text-white" size={20} />
        </button>

        {/* Iframe */}
  <div
  className="h-[80vh] overflow-y-auto"
  style={{ WebkitOverflowScrolling: "touch" }}
>
  <iframe
    src="https://link.ravan.ai/widget/booking/z0y3cgJJ3zTzb7hW7bLg"
    className="w-full border-0"
    style={{
      height: "100%",      // stays inside container
      overflow: "hidden"   // prevent internal growing
    }}
  />
</div>


      </div>
    </div>
  );
};
