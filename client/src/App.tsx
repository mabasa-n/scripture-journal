import { useQuery } from "@tanstack/react-query";

const fetchDbHealth = async () => {
  const response = await fetch("/api/v1/health/db");
  if (!response.ok) {
    throw new Error("Failed to fetch database health");
  } else {
    return response.json();
  }
};

export default function App() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["healthcheck-db"],
    queryFn: fetchDbHealth,
  });

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 space-y-6 border border-slate-200">
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            Tracer Bullet Complete
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Scripture Journal
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            End-to-end integration verified successfully.
          </p>
        </div>

        {/* Server State UI */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm font-mono">
          {isLoading && (
            <p className="text-slate-500 animate-pulse">
              Connecting to database...
            </p>
          )}

          {isError && (
            <p className="text-red-500">Error: {(error as Error).message}</p>
          )}

          {data && (
            <div className="space-y-2">
              <p className="text-slate-700">
                <span className="font-semibold text-indigo-600">
                  API Status:
                </span>{" "}
                {data.status}
              </p>
              <p className="text-slate-700 truncate">
                <span className="font-semibold text-indigo-600">API Time:</span>{" "}
                {new Date(data.apiTimestamp).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
