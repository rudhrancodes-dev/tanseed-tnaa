export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)' }}
        >
          <span className="text-white text-xs font-bold tracking-tight">T</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}
          >
            TANSEED
          </span>
          <span
            className="px-2.5 py-0.5 text-xs font-medium rounded-full"
            style={{ background: '#F0EFFE', color: '#4338CA', letterSpacing: '0.01em' }}
          >
            Grant Assistant
          </span>
        </div>
      </div>
    </header>
  );
}
