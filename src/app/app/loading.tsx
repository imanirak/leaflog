export default function Loading() {
  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b px-8 py-3" style={{ background: "var(--cream)", borderColor: "#cfe3d6" }}>
        <div className="flex-1">
          <div className="h-3 w-24 rounded animate-pulse" style={{ background: "#d3e6da" }} />
          <div className="mt-2 h-5 w-32 rounded animate-pulse" style={{ background: "#d3e6da" }} />
        </div>
      </div>
      <div className="px-8 py-6">
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-[68px] rounded-2xl animate-pulse" style={{ background: "var(--card)", border: "1px solid #d9e8de" }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="overflow-hidden rounded-2xl animate-pulse" style={{ background: "var(--card)", border: "1px solid #d9e8de" }}>
              <div className="h-44" style={{ background: "#d9e8de" }} />
              <div className="p-3.5">
                <div className="h-3.5 w-2/3 rounded" style={{ background: "#d9e8de" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
