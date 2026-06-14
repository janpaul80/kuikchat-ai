# Dark theme for the Login page

The current /login (screenshot 4) is light. Apply these changes to the existing
login component (likely src/app/(auth)/login/page.tsx or src/app/login/page.tsx
or a LoginForm component — TEAM: tell Paul the exact path and he will send a full
drop-in replacement if you prefer).

CORE CHANGES (Tailwind):
- Page/background container:  bg-white  ->  bg-black  (or relative + <GlowBackground/>)
  Left panel gradient: replace the light blue/green wash with:
      style={{ background: "linear-gradient(135deg, hsl(217 91% 60% / 0.18), hsl(142 71% 45% / 0.12))" }}
  OR drop in the animated glow:
      import GlowBackground from "@/components/ui/GlowBackground";
      ...<div className="relative ..."><GlowBackground /> ...
- Card:        bg-white  ->  bg-[#0d0f14]/90 border border-white/10 backdrop-blur-xl
- Headings:    text-gray-900/black  ->  text-white
- Sub text:    text-gray-500  ->  text-white/60
- Inputs:      bg-gray-50 border-gray-200 text-black
               ->  bg-white/5 border-white/10 text-white placeholder-white/40
               focus:border-[hsl(217,91%,60%)]
- OAuth buttons (Google/Apple): bg-white border
               ->  bg-white/5 border border-white/10 text-white hover:bg-white/10
- "OR" divider: border-gray-200 -> border-white/10 ; text-gray-400 -> text-white/40
- Primary "Log in" button: keep the blue->green gradient (already on-brand) — good as is.
- Links (Forgot password / Sign up): text-blue-600 -> text-[hsl(217,91%,60%)]
- Logo top-left: use <Image src="/logo.png" .../> (same as footer)

TEAM: send Paul the login file path and he will return a complete dark drop-in.
