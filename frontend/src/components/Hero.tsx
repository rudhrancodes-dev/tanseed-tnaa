interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="flex flex-col items-center justify-center py-20 text-center bg-gray-50">
      <h1 className="text-5xl font-extrabold text-blue-900">
        Fast-Track Your TANSEED Application
      </h1>
      <p className="mt-4 text-xl text-gray-600">
        AI-powered eligibility check and document preparation.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 mt-8 text-lg font-bold text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-700"
      >
        Start New Application
      </button>
    </section>
  );
}
