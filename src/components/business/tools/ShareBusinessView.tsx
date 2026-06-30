import { useState } from "react";
import { ArrowLeft, Check, Copy, QrCode, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import logo from "@/assets/kuikchat-logo.png";

interface ShareBusinessViewProps {
  businessName: string;
  logoUrl?: string | null;
  shareLink: string;
  onBack: () => void;
}

export const ShareBusinessView = ({
  businessName,
  logoUrl,
  shareLink,
  onBack,
}: ShareBusinessViewProps) => {
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const shareUrl = new URL(shareLink);
  const displayLink = `${shareUrl.host}/chat`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareLink)}`;

  const writeToClipboard = async (value: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  };

  const copyLink = async () => {
    await writeToClipboard(shareLink);
    setCopied(true);
    toast.success("Business link copied");
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareBusiness = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: `Message ${businessName} on KuikChat`,
          url: shareLink,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await copyLink();
  };

  const actions = [
    { label: "Share link", icon: Share2, onClick: shareBusiness },
    { label: copied ? "Copied" : "Copy link", icon: copied ? Check : Copy, onClick: copyLink },
    { label: "QR code", icon: QrCode, onClick: () => setShowQrCode(true) },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto bg-[#050505] text-white">
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-5 pb-28 pt-4 md:pb-12 md:pt-6">
        <header className="relative flex h-12 items-center justify-center">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Tools"
            className="absolute left-0 grid h-11 w-11 place-items-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
          <h1 className="text-xl font-semibold tracking-tight">Share your business</h1>
        </header>

        <main className="flex flex-1 flex-col items-center pt-12 text-center md:pt-14">
          <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-[#101010] shadow-xl ring-1 ring-white/5">
            <img
              src={logoUrl || logo}
              alt={`${businessName} logo`}
              className="h-full w-full object-contain p-3"
            />
          </div>

          <h2 className="mt-6 text-2xl font-medium">{businessName}</h2>
          <p className="mt-1 w-full max-w-sm truncate px-4 text-lg text-white/55">{displayLink}</p>

          <div className="mt-9 grid w-full max-w-xs grid-cols-3 gap-3">
            {actions.map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="group flex min-w-0 flex-col items-center gap-2.5 whitespace-nowrap text-xs text-white focus-visible:outline-none sm:text-sm"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white/[0.08] transition-colors group-hover:bg-white/[0.14] group-focus-visible:ring-2 group-focus-visible:ring-emerald-400">
                  <Icon className="h-6 w-6" />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <p className="mt-11 max-w-md text-left text-base leading-relaxed text-white/55">
            Share your link with customers so they can start a KuikChat conversation with you.{" "}
            <span className="font-medium text-emerald-400">Learn more</span>
          </p>
        </main>
      </div>

      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="max-w-xs border-white/10 bg-[#111b21] text-white">
          <DialogHeader>
            <DialogTitle className="text-center">Business QR code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-3 text-center">
            <div className="rounded-2xl bg-white p-4">
              <img src={qrCodeUrl} alt={`QR code for ${businessName}`} className="h-52 w-52" />
            </div>
            <p className="text-sm text-white/60">Scan to open {businessName} on KuikChat.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
