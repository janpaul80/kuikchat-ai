/* KuikChat - "You" / Settings experience (branded prototype)
 * Rebrands the WhatsApp settings/profile flow to KuikChat:
 *  - brand gradient blue hsl(217 91% 60%) -> green hsl(142 71% 45%)
 *  - dark theme, KuikChat logo, Hermes purple accent for AI/premium
 *  - tabs: Updates / Calls / Communities / Chats / You
 * This is a UI prototype: navigation + toggles work; data is sample.
 */

import { KC } from '@/theme/tokens';

const BLUE = KC.brand.blue;
const GREEN = KC.brand.green;
const grad = KC.brand.gradient;
const LOGO = "data:image/png;base64,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8fmHy5Off7NouEY7k1vAUkmwN9X/MXu+hhgZCQalofYdxEtCqBj0H/9C3d/9+sXb/+Oj7ZVtDa7FUxndns890dn+7C+qTb+o0M3b3eNwhh1WpMJkBuAVWJre6hLzn1II2qceHPiLxZUHfmr+tre0tH9rcC2+s9FddyDMvvDzoZArtZw+I3rS/k+1Ik35V0pqp9HJSvqvz6C3991PHvrqPx7c+0dH2ivZGlyLvyH6Bz572Lad8+lO6J4rOn2h08WpkoE1/XDFYhoQ4lO4rVhV7X/rgT03/xIPv3O5vYKtwbX4W6Le95WFpU0bPl6GjVUI/pyg0xPq0wgdVEKqHqHE6rlDvZU9vzx3y5vfwvzdbWX+/4fRlnb9/wQbrvz153bDST+pvvHFTme7iGsV/Um8/kKUx98zf+v/cVd7lVqDa/G/G9tfPz254cxN3ulpb99DRzj0sbZEq0WLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1atFh/+H8APdjXkKRkokwAAAAASUVORK5CYII="; // KuikChat brand logo (embedded). In production: import from your asset path.

// ---------- tiny inline icon set ----------
const Ic = ({ d, size = 22, color = "currentColor", stroke = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={stroke ? "none" : color} stroke={stroke ? color : "none"}
    strokeWidth={stroke ? 2 : 0} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const I = {
  search: "M21 21l-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z",
  qr: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3z",
  gem: "M6 3h12l3 6-9 12L3 9z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  broadcast: "M3 11l18-5v12L3 14v-3zM11 14v5",
  star: "M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z",
  device: "M4 5h16v10H4zM2 19h20M9 19v2M15 19v2",
  key: "M15 7a4 4 0 1 1-5.6 5.6L4 18v3h3l1-1h2v-2h2l1.4-1.4A4 4 0 0 1 15 7z",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  chat: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  palette: "M12 2a10 10 0 1 0 0 20 2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h3a4 4 0 0 0 4-4 8 8 0 0 0-9-8zM7 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  chevron: "M9 6l6 6-6 6",
  back: "M15 18l-6-6 6-6",
  x: "M18 6L6 18M6 6l12 12",
  updates: "M12 3a9 9 0 1 0 9 9M12 3v4M12 3a9 9 0 0 1 9 9",
  call: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
  community: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  sparkle: "M12 2l1.8 4.5L18 8l-3.5 3 1 4.7L12 13.8 8.5 15.7l1-4.7L6 8l4.2-1.5z",
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  plus: "M12 5v14M5 12h14",
};

// ---------- shared chrome ----------
function Row({ icon, label, value, sub, accent, onClick, last }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 text-left active:bg-white/5 transition"
      style={{ borderBottom: last ? "none" : `1px solid ${KC.hairline}` }}>
      <span style={{ color: accent || "#cbd5e1" }}><Ic d={icon} size={21} stroke /></span>
      <span className="flex-1">
        <span className="block text-[15.5px] text-slate-100">{label}</span>
        {sub && <span className="block text-[12px] text-slate-500 mt-0.5">{sub}</span>}
      </span>
      {value && <span className="text-[14px] text-slate-400">{value}</span>}
      <span className="text-slate-600"><Ic d={I.chevron} size={18} stroke /></span>
    </button>
  );
}
function Card({ children, className = "" }) {
  return <div className={`rounded-2xl bg-[#15181d] border border-white/[.06] overflow-hidden ${className}`}>{children}</div>;
}
function Toggle({ on, set }) {
  return (
    <button onClick={() => set(!on)}
      className="w-[50px] h-[30px] rounded-full p-[3px] transition-colors flex"
      style={{ background: on ? grad : "#3a3f47", justifyContent: on ? "flex-end" : "flex-start" }}>
      <span className="w-6 h-6 rounded-full bg-white shadow" />
    </button>
  );
}
function Header({ title, onBack, right }) {
  return (
    <div className="flex items-center gap-2 px-3 py-3 sticky top-0 z-10 bg-[#0c0e11]/90 backdrop-blur">
      {onBack && (
        <button onClick={onBack} className="w-9 h-9 grid place-items-center rounded-full bg-white/5 text-slate-200">
          <Ic d={I.back} size={20} stroke />
        </button>
      )}
      <h1 className="flex-1 text-center text-[17px] font-semibold text-slate-100">{title}</h1>
      <div className="w-9 flex justify-end">{right}</div>
    </div>
  );
}

// ---------- screens ----------
function YouScreen({ go }) {
  return (
    <div className="pb-2">
      <div className="flex items-center justify-between px-4 pt-4">
        <button className="w-10 h-10 grid place-items-center rounded-full bg-white/5 text-slate-200"><Ic d={I.search} size={20} stroke /></button>
        <div className="flex gap-2">
          <button className="px-3 h-10 grid place-items-center rounded-full bg-white/5 text-slate-200"><Ic d={I.qr} size={19} stroke /></button>
          <button className="w-10 h-10 grid place-items-center rounded-full bg-white/5 text-slate-200"><Ic d={I.edit} size={18} stroke /></button>
        </div>
      </div>

      <div className="flex flex-col items-center mt-3 mb-5">
        <div className="px-3 py-1.5 rounded-2xl bg-white/8 text-slate-300 text-[13px] mb-3 relative">
          What's happening?
          <span className="absolute left-1/2 -bottom-1 w-2 h-2 bg-white/8 rotate-45 -translate-x-1/2" />
        </div>
        <div className="w-24 h-24 rounded-full grid place-items-center overflow-hidden border border-white/10" style={{ background: KC.bg.avatar }}>
          <img src={LOGO.src || LOGO} alt="KuikChat" className="w-20 h-20 object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.innerHTML = '<span style="font-weight:800;font-size:13px;background:linear-gradient(135deg,#3b82f6,#22c55e);-webkit-background-clip:text;color:transparent">KuikChat</span>'; }} />
        </div>
        <div className="flex items-center gap-1 mt-3">
          <span className="text-[22px] font-semibold text-slate-50">Paul Hartmann</span>
          <Ic d={I.chevron} size={18} stroke color="#64748b" />
        </div>
      </div>

      <div className="px-3 space-y-3">
        <Card>
          <Row icon={I.gem} label="Subscriptions" accent={GREEN} onClick={() => go("subs")} />
          <Row icon={I.list} label="Lists" onClick={() => go("lists")} />
          <Row icon={I.broadcast} label="Broadcast messages" onClick={() => go("broadcast")} />
          <Row icon={I.star} label="Starred" onClick={() => go("starred")} />
          <Row icon={I.device} label="Linked devices" onClick={() => go("devices")} last />
        </Card>
        <Card>
          <Row icon={I.key} label="Account" onClick={() => go("account")} />
          <Row icon={I.lock} label="Privacy" onClick={() => go("privacy")} />
          <Row icon={I.chat} label="Chats" value="1" onClick={() => go("chats")} />
          <Row icon={I.palette} label="Appearance" onClick={() => go("appearance")} />
          <Row icon={I.bell} label="Notifications" onClick={() => go("notifications")} last />
        </Card>
      </div>
    </div>
  );
}

function SubsScreen({ go }) {
  const feats = [
    { i: I.sparkle, t: "Send exclusive stickers" },
    { i: I.palette, t: "Choose a custom app icon" },
    { i: I.palette, t: "Change your app theme" },
    { i: I.bell, t: "Get exclusive ringtones" },
    { i: I.list, t: "Upgrade your chat lists" },
    { i: I.star, t: "Pin extra chats" },
  ];
  return (
    <div>
      <Header onBack={() => go("you")} title="" right={<button onClick={() => go("you")} className="text-slate-300"><Ic d={I.x} size={20} stroke /></button>} />
      <div className="flex justify-center -mt-1 mb-2">
        <div className="w-12 h-12 rounded-2xl grid place-items-center overflow-hidden" style={{ background: grad }}>
          <Ic d={I.sparkle} size={24} color="#fff" />
        </div>
      </div>
      <div className="px-6 text-center">
        <h2 className="text-[26px] font-bold leading-tight text-slate-50">
          Try <span style={{ background: grad, WebkitBackgroundClip: "text", color: "transparent" }}>KuikChat Plus</span> free for one month
        </h2>
        <p className="text-slate-300 mt-2 text-[15px]">Upgrade your messaging experience</p>
        <p className="text-slate-500 mt-1 text-[13px]">$1.49/month . Price may include taxes</p>
      </div>
      <div className="px-4 mt-5">
        <Card>
          {feats.map((f, idx) => (
            <Row key={idx} icon={f.i} label={f.t} accent={KC.brand.hermes} last={idx === feats.length - 1} onClick={() => {}} />
          ))}
        </Card>
      </div>
      <div className="px-6 mt-6 text-center text-[13px] text-slate-500">
        By continuing, you agree to KuikChat's <span style={{ color: BLUE }}>Terms of Service</span> and <span style={{ color: BLUE }}>Privacy Policy</span>. This subscription renews until canceled.
      </div>
      <div className="px-4 mt-4">
        <button className="w-full py-4 rounded-full font-semibold text-white text-[16px]" style={{ background: grad }}>
          Start your free month
        </button>
      </div>
    </div>
  );
}

function ListsScreen({ go }) {
  return (
    <div>
      <Header onBack={() => go("you")} title="Lists" right={<span className="text-[14px] text-slate-300 whitespace-nowrap">Reorder</span>} />
      <div className="px-4">
        <Card className="p-5 text-center">
          <div className="flex justify-center gap-2 mb-4">
            {[I.star, I.broadcast, I.plus].map((d, i) => (
              <div key={i} className="w-12 h-12 rounded-full grid place-items-center" style={{ background: "rgba(34,197,94,.15)", color: GREEN }}><Ic d={d} size={20} stroke /></div>
            ))}
          </div>
          <p className="text-slate-400 text-[14px] mb-4">Any list you create becomes a filter at the top of your Chats tab.</p>
          <button className="w-full py-3 rounded-full font-semibold text-[15px]" style={{ background: "rgba(34,197,94,.12)", color: GREEN, border: `1px solid ${GREEN}55` }}>
            + Create a custom list
          </button>
        </Card>
        <p className="text-slate-500 text-[12.5px] uppercase tracking-wide mt-5 mb-2 px-1">Your lists</p>
        <Card>
          <Row icon={I.chat} label="Unread (preset)" onClick={() => {}} />
          <Row icon={I.star} label="Favourites" onClick={() => {}} />
          <Row icon={I.community} label="Groups (preset)" onClick={() => {}} last />
        </Card>
      </div>
    </div>
  );
}

function PrivacyScreen({ go }) {
  return (
    <div>
      <Header onBack={() => go("you")} title="Privacy" />
      <div className="px-4 space-y-4">
        <Card className="p-4 flex gap-3 items-start">
          <span style={{ color: GREEN }} className="mt-0.5"><Ic d={I.lock} size={22} stroke /></span>
          <div className="flex-1">
            <p className="text-slate-100 font-semibold text-[15px]">Privacy checkup</p>
            <p className="text-slate-400 text-[13px] mt-0.5">Control your privacy and choose the right settings for you. <span style={{ color: GREEN }}>Start checkup</span></p>
          </div>
        </Card>
        <Card>
          <Row icon={I.lock} label="Last seen & online" value="Everyone" onClick={() => {}} />
          <Row icon={I.lock} label="Profile picture" value="Everyone" onClick={() => {}} />
          <Row icon={I.lock} label="About" value="Everyone" onClick={() => {}} />
          <Row icon={I.lock} label="Links" value="My contacts" onClick={() => {}} />
          <Row icon={I.lock} label="Groups" value="Everyone" onClick={() => {}} last />
        </Card>
        <Card><Row icon={I.lock} label="Live location" value="None" onClick={() => {}} last /></Card>
      </div>
    </div>
  );
}

function AppearanceScreen({ go }) {
  return (
    <div>
      <Header onBack={() => go("you")} title="Appearance" />
      <div className="px-4 space-y-4">
        <Card><Row icon={I.palette} label="Default chat theme" onClick={() => {}} last /></Card>
        <Card><Row icon={I.sparkle} label="Animations" sub="Choose whether emoji, stickers and GIFs move automatically." onClick={() => {}} last /></Card>
        <div>
          <p className="flex items-center gap-1.5 text-[14px] font-semibold mb-2 px-1" style={{ color: KC.brand.hermes }}>
            <Ic d={I.gem} size={15} stroke /> KuikChat Plus
          </p>
          <Card>
            <Row icon={I.palette} label="App icon" onClick={() => {}} />
            <Row icon={I.palette} label="App theme" onClick={() => {}} last />
          </Card>
          <p className="text-slate-500 text-[12.5px] mt-2 px-1">Subscribe to KuikChat Plus to change your app icon, theme and more. <span style={{ color: GREEN }}>Explore benefits</span></p>
        </div>
      </div>
    </div>
  );
}

function NotificationsScreen({ go }) {
  const [a, setA] = useState(true); const [b, setB] = useState(true); const [c, setC] = useState(true); const [d, setD] = useState(true);
  const T = ({ label, on, set, last }) => (
    <div className="flex items-center px-4 py-3.5" style={{ borderBottom: last ? "none" : `1px solid ${KC.hairline}` }}>
      <span className="flex-1 text-[15px] text-slate-100">{label}</span><Toggle on={on} set={set} />
    </div>
  );
  return (
    <div>
      <Header onBack={() => go("you")} title="Notifications" />
      <div className="px-4 space-y-4">
        <p className="text-slate-500 text-[12.5px] uppercase tracking-wide px-1">Message notifications</p>
        <Card>
          <T label="Show notifications" on={a} set={setA} />
          <Row icon={I.bell} label="Sound" value="Note" onClick={() => {}} />
          <T label="Reaction notifications" on={b} set={setB} last />
        </Card>
        <p className="text-slate-500 text-[12.5px] uppercase tracking-wide px-1">Group notifications</p>
        <Card>
          <T label="Show notifications" on={c} set={setC} />
          <T label="Reaction notifications" on={d} set={setD} last />
        </Card>
      </div>
    </div>
  );
}

function DevicesScreen({ go }) {
  return (
    <div>
      <Header onBack={() => go("you")} title="Linked devices" />
      <div className="px-6 text-center">
        <div className="w-28 h-28 mx-auto rounded-3xl grid place-items-center my-4" style={{ background: "rgba(59,130,246,.12)" }}>
          <Ic d={I.device} size={48} color={GREEN} stroke />
        </div>
        <h2 className="text-[22px] font-bold text-slate-50">Use KuikChat on other devices</h2>
        <p className="text-slate-400 mt-2 text-[14px]">Link other devices to this account, including Windows, Mac and Web. <span style={{ color: GREEN }}>Learn more</span></p>
        <p className="text-slate-400 text-[13px] mt-6 flex items-center justify-center gap-2"><Ic d={I.lock} size={14} stroke /> Your messages are <span style={{ color: GREEN }}>end-to-end encrypted</span></p>
      </div>
      <div className="px-4 mt-8">
        <button className="w-full py-4 rounded-full font-semibold text-white text-[16px]" style={{ background: grad }}>Link a device</button>
      </div>
    </div>
  );
}

function StubScreen({ go, title, msg }) {
  return (
    <div>
      <Header onBack={() => go("you")} title={title} />
      <div className="px-8 text-center mt-24 text-slate-500 text-[14px] leading-relaxed">{msg}</div>
    </div>
  );
}

// ---------- bottom tab bar ----------
function TabBar({ tab, setTab }) {
  const tabs = [
    { k: "updates", label: "Updates", d: I.updates },
    { k: "calls", label: "Calls", d: I.call },
    { k: "communities", label: "Communities", d: I.community },
    { k: "chats", label: "Chats", d: I.chat },
    { k: "you", label: "You", d: null },
  ];
  return (
    <div className="absolute bottom-0 inset-x-0 px-3 pb-3">
      <div className="flex items-center justify-around rounded-full bg-[#1b1f25]/95 backdrop-blur border border-white/[.06] py-2">
        {tabs.map((t) => {
          const active = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)} className="flex flex-col items-center gap-1 w-16">
              {t.k === "you" ? (
                <span className="w-7 h-7 rounded-full grid place-items-center overflow-hidden border-2"
                  style={{ borderColor: active ? GREEN : "transparent", background: KC.bg.avatar }}>
                  <img src={LOGO.src || LOGO} className="w-6 h-6 object-contain" alt=""
                    onError={(e) => { e.currentTarget.style.display = "none"; }} />
                </span>
              ) : (
                <span style={{ color: active ? "#f1f5f9" : "#64748b" }}><Ic d={t.d} size={22} stroke /></span>
              )}
              <span className="text-[10.5px]" style={{ color: active ? "#f1f5f9" : "#64748b" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- shell ----------
export default function App() {
  const [tab, setTab] = useState("you");
  const [screen, setScreen] = useState("you"); // sub-screen inside You
  const go = (s) => setScreen(s);

  const youFlow = () => {
    switch (screen) {
      case "you": return <YouScreen go={go} />;
      case "subs": return <SubsScreen go={go} />;
      case "lists": return <ListsScreen go={go} />;
      case "privacy": return <PrivacyScreen go={go} />;
      case "appearance": return <AppearanceScreen go={go} />;
      case "notifications": return <NotificationsScreen go={go} />;
      case "devices": return <DevicesScreen go={go} />;
      case "broadcast": return <StubScreen go={go} title="Broadcast messages" msg="Use broadcast lists to message multiple people at once. Only contacts who have you in their address book will receive your broadcast messages." />;
      case "starred": return <StubScreen go={go} title="Starred" msg="Tap and hold any message to star it. Your starred messages appear here." />;
      case "account": return <StubScreen go={go} title="Account" msg="Security notifications, two-step verification, change number, and account info live here." />;
      case "chats": return <StubScreen go={go} title="Chats" msg="Default chat theme, animations, backup, export chat, and voice message transcripts." />;
      default: return <YouScreen go={go} />;
    }
  };

  const content = () => {
    if (tab === "you") return youFlow();
    const titles = {
      updates: ["Updates", "Status, recent updates and channels appear here."],
      calls: ["Calls", "Recent calls, the keypad, and favourites appear here."],
      communities: ["Communities", "Bring members together in topic-based groups."],
      chats: ["Chats", "Your conversations appear here, with the / command palette and branded message styles."],
    };
    const [t, m] = titles[tab];
    return (
      <div>
        <div className="px-5 pt-6"><h1 className="text-[30px] font-bold text-slate-50">{t}</h1></div>
        <div className="px-8 text-center mt-24 text-slate-500 text-[14px] leading-relaxed">{m}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full grid place-items-center p-4" style={{ background: KC.bg.app, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="text-center">
        <div className="relative mx-auto rounded-[40px] overflow-hidden border border-white/10 shadow-2xl"
          style={{ width: 380, height: 760, background: KC.bg.screen }}>
          <div className="absolute inset-0 overflow-y-auto pb-24"
            style={{ scrollbarWidth: "none" }}
            onScroll={() => {}}>
            {content()}
          </div>
          <TabBar tab={tab} setTab={(k) => { setTab(k); if (k === "you") setScreen("you"); }} />
        </div>
        <p className="text-slate-500 text-[12px] mt-4 max-w-[380px]">
          KuikChat "You" / Settings prototype. Tap <b className="text-slate-300">You</b>, then open Subscriptions, Lists, Privacy, Appearance, Notifications, Linked devices. Branding, dark theme and logo applied.
        </p>
      </div>
    </div>
  );
}
