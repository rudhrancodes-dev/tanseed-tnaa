export default function Header() {
  return (
    <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-900 rounded-full" />
        <span className="text-xl font-bold text-blue-900">TANSEED</span>
        <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-900 rounded-full">
          Grant Assistant
        </span>
      </div>
    </header>
  );
}
