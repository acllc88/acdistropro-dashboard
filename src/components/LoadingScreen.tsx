export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/30 text-2xl font-black text-white">
          AC
        </div>
        <div className="absolute -inset-2 rounded-3xl border-2 border-violet-500/30 animate-ping" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white">ACDistro Pro</h2>
        <p className="text-slate-400 text-sm">Connecting to real-time database...</p>
      </div>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
