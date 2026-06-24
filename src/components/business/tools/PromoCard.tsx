import { Share2 } from "lucide-react";

export const PromoCard = () => {
  return (
    <div className="brand-gradient rounded-2xl p-5 flex items-center gap-4">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <Share2 className="w-6 h-6 text-white" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-white leading-tight">
          Share your business
        </h3>
        <p className="text-sm text-white/80 mt-0.5 leading-snug">
          Let customers find and message you instantly
        </p>
      </div>

      {/* CTA */}
      <div className="shrink-0">
        <button
          disabled
          className="text-xs font-semibold text-white/60 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg cursor-not-allowed"
        >
          Soon
        </button>
      </div>
    </div>
  );
};
