const GRID_BACKGROUND: React.CSSProperties = {
  backgroundColor: "#11281b",
  backgroundImage: [
    "radial-gradient(circle at 22% 18%, rgba(45,106,79,0.55), transparent 45%)",
    "radial-gradient(circle at 82% 85%, rgba(15,46,28,0.65), transparent 50%)",
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
    "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  ].join(", "),
  backgroundSize: "auto, auto, 42px 42px, 42px 42px",
};

function LeafDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute -right-16 -top-20 h-80 w-80 opacity-70" style={{ filter: "blur(1px)" }} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="leaf1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#74c69d" />
            <stop offset="100%" stopColor="#1b4332" />
          </linearGradient>
        </defs>
        <path d="M50,6 C82,10 92,46 64,76 C46,94 20,90 12,64 C4,38 18,2 50,6 Z" fill="url(#leaf1)" transform="rotate(18 50 50)" />
      </svg>
      <svg className="absolute -bottom-24 -left-16 h-72 w-72 opacity-60" style={{ filter: "blur(1px)" }} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="leaf2" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#2d6a4f" />
            <stop offset="100%" stopColor="#95d5b2" />
          </linearGradient>
        </defs>
        <path d="M50,6 C82,10 92,46 64,76 C46,94 20,90 12,64 C4,38 18,2 50,6 Z" fill="url(#leaf2)" transform="rotate(-110 50 50)" />
      </svg>
      <svg className="absolute right-10 bottom-1/4 h-40 w-40 opacity-40" style={{ filter: "blur(2px)" }} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="leaf3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d8f3dc" />
            <stop offset="100%" stopColor="#52b788" />
          </linearGradient>
        </defs>
        <path d="M50,6 C82,10 92,46 64,76 C46,94 20,90 12,64 C4,38 18,2 50,6 Z" fill="url(#leaf3)" transform="rotate(60 50 50)" />
      </svg>
    </div>
  );
}

export default function AuthShell({ children, floral = false }: { children: React.ReactNode; floral?: boolean }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12" style={GRID_BACKGROUND}>
      {floral && <LeafDecorations />}
      <div
        className="relative w-full max-w-sm rounded-[28px] p-8 shadow-2xl backdrop-blur-xl"
        style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 24px 60px rgba(6,30,18,.45)" }}
      >
        {children}
      </div>
    </main>
  );
}
