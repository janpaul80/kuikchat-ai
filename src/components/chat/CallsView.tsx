import { Heart, LockKeyhole, Phone, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface CallsViewProps {
  onStartCall: () => void;
}

export const CallsView = ({ onStartCall }: CallsViewProps) => {
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

  const inviteFriend = async () => {
    const inviteUrl = `${window.location.origin}/auth`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on KuikChat",
          text: "Chat and make private calls with me on KuikChat.",
          url: inviteUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await writeToClipboard(inviteUrl);
    toast.success("Invite link copied");
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto bg-[#050505] px-6 pb-28 pt-8 text-white md:pb-10">
      <header className="mx-auto flex w-full max-w-5xl items-start justify-between">
        <h1 className="pt-8 text-5xl font-bold tracking-tight md:text-4xl">Calls</h1>
        <button
          type="button"
          onClick={onStartCall}
          aria-label="Start a new call"
          className="grid h-12 w-12 place-items-center rounded-full bg-white text-black transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40"
        >
          <Plus className="h-8 w-8" strokeWidth={2.2} />
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center pb-10 pt-12 text-center md:pt-8">
        <div className="relative h-52 w-60" aria-hidden="true">
          <Phone className="absolute bottom-1 left-4 h-36 w-36 -rotate-[28deg] text-emerald-500" strokeWidth={5.5} />
          <Heart className="absolute bottom-16 right-5 h-16 w-16 fill-lime-300 text-lime-300" />
          <Heart className="absolute bottom-4 right-20 h-16 w-16 fill-emerald-100 text-emerald-100" />
          <div className="absolute left-1/2 top-1 h-36 w-32 -translate-x-1/2">
            <div className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 rounded-t-[2.5rem] border-[12px] border-b-0 border-[#f7f2e9]" />
            <div className="absolute bottom-0 left-1/2 h-24 w-32 -translate-x-1/2 rounded-2xl border-[7px] border-[#151515] bg-[#f7f2e9] shadow-xl">
              <LockKeyhole className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 text-[#151515]" strokeWidth={1.7} />
            </div>
          </div>
        </div>

        <h2 className="mt-5 text-3xl font-semibold tracking-tight">Make private calls</h2>
        <p className="mt-3 max-w-sm text-xl leading-snug text-white/85">
          Stay connected with secure video and audio calls to any device.
        </p>

        <div className="mt-5 flex items-center gap-3" aria-label="Call introduction, slide 1 of 3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        </div>

        <button
          type="button"
          onClick={onStartCall}
          className="mt-9 rounded-full bg-white px-7 py-3 text-xl font-semibold text-black transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40"
        >
          Start a call
        </button>
        <button
          type="button"
          onClick={inviteFriend}
          className="mt-6 inline-flex items-center gap-2 text-xl font-semibold text-emerald-400 hover:text-emerald-300 focus-visible:outline-none focus-visible:underline"
        >
          <UserPlus className="h-5 w-5" />
          Invite a friend
        </button>
      </main>
    </div>
  );
};
