export default function StatusCheck() {
  return (
    <section className="flex flex-col items-center justify-center py-10 bg-white">
      <h2 className="text-2xl font-bold text-gray-900">Check Existing Status</h2>
      <div className="flex gap-4 mt-4">
        <input
          type="text"
          placeholder="Application ID"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
        <button className="px-6 py-2 font-bold text-white transition rounded-lg bg-blue-900 hover:bg-blue-800">
          Check Status
        </button>
      </div>
    </section>
  );
}
