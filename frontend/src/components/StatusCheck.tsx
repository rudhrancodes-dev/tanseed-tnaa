export default function StatusCheck() {
  return (
    <section className="py-20 px-6" style={{ background: '#FBFBFB' }}>
      <div className="max-w-lg mx-auto text-center">
        <h2
          className="text-2xl font-semibold mb-3"
          style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}
        >
          Check Existing Status
        </h2>
        <p className="text-sm mb-8" style={{ color: '#6E6E73' }}>
          Have an application ID? Check its current status instantly.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Application ID"
            className="flex-1 px-5 py-3.5 text-sm rounded-2xl border transition-all duration-150 focus:outline-none"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.1)',
              color: '#1D1D1F',
            }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.18)')}
            onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
          />
          <button
            className="px-6 py-3.5 text-sm font-semibold text-white rounded-2xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)',
              boxShadow: '0 4px 16px rgba(67,56,202,0.25)',
              letterSpacing: '-0.01em',
            }}
          >
            Check Status
          </button>
        </div>
      </div>
    </section>
  );
}
