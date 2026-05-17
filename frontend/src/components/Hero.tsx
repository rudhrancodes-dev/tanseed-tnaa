interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section
      className="flex flex-col items-center justify-center px-6 py-32 text-center relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFBFB 100%)' }}
    >
      {/* Soft radial glow behind headline */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(67, 56, 202, 0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-3xl">
        <div
          className="inline-block px-4 py-1.5 rounded-full text-xs font-medium mb-8 tracking-wide"
          style={{ background: '#F0EFFE', color: '#4338CA', letterSpacing: '0.05em' }}
        >
          AI-POWERED GRANT ELIGIBILITY
        </div>

        <h1
          className="text-6xl font-bold leading-tight mb-6"
          style={{ color: '#1D1D1F', letterSpacing: '-0.03em', lineHeight: '1.05' }}
        >
          Fast-Track Your
          <br />
          <span style={{ color: '#4338CA' }}>TANSEED Application</span>
        </h1>

        <p
          className="text-xl font-normal mb-12 max-w-xl mx-auto"
          style={{ color: '#6E6E73', letterSpacing: '-0.01em', lineHeight: '1.6' }}
        >
          Our AI checks your eligibility in seconds and prepares a polished grant application draft — so you can focus on building.
        </p>

        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)',
            boxShadow: '0 4px 24px rgba(67, 56, 202, 0.35)',
            letterSpacing: '-0.01em',
          }}
        >
          Start New Application
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </button>
      </div>
    </section>
  );
}
