export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-alabaster bg-alabaster-grid p-4 sm:p-6 lg:p-8 text-obsidian">
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        {/* Top Navbar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border-2 border-obsidian p-4 shadow-brutal">
          <div className="flex items-center gap-3">
            <div className="w-28 h-8 bg-obsidian/10 border border-obsidian/20"></div>
            <div className="h-6 w-px bg-obsidian/20 hidden sm:block"></div>
            <div className="w-40 h-5 bg-obsidian/15"></div>
          </div>
          <div className="w-32 h-7 bg-amber-200 border border-amber-300"></div>
        </div>

        {/* Header Skeleton */}
        <header className="bg-white border-2 border-obsidian p-6 sm:p-8 shadow-brutal-xl space-y-3">
          <div className="w-48 h-5 bg-amber-100 border border-amber-300"></div>
          <div className="w-72 h-10 bg-obsidian/20"></div>
          <div className="w-full max-w-xl h-4 bg-obsidian/10"></div>
        </header>

        {/* Metrics Grid Skeleton */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border-2 border-obsidian p-5 shadow-brutal space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-20 h-3 bg-obsidian/15"></div>
                <div className="w-8 h-8 bg-amber-500/20 border border-obsidian/30"></div>
              </div>
              <div className="w-28 h-8 bg-obsidian/20"></div>
            </div>
          ))}
        </div>

        {/* Control Box Skeleton */}
        <div className="bg-white border-2 border-obsidian p-8 shadow-brutal-xl space-y-6">
          <div className="w-56 h-6 bg-obsidian/20"></div>
          <div className="w-full h-16 bg-amber-500/30 border-2 border-obsidian shadow-brutal"></div>
          <div className="w-full h-48 bg-obsidian border-2 border-obsidian"></div>
        </div>
      </div>
    </main>
  );
}
