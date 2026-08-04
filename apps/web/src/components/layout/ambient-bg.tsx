"use client";

export function AmbientBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-amber-500/[0.07] blur-[120px]" />
      <div className="absolute top-[40%] -left-32 h-[420px] w-[420px] rounded-full bg-sky-500/[0.05] blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-[380px] w-[480px] rounded-full bg-violet-500/[0.04] blur-[110px]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950" />
    </div>
  );
}
