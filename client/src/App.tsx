import { useEffect, useState } from "react";

interface DbHealthResponse {
  status: string;
  apiTimestamp: string;
}

export default function App() {
  const [data, setData] = useState<DbHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDbHealth = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/v1/health/db", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch database health");
        } else {
          const result: DbHealthResponse = await response.json();
          setData(result);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "An unknown error has occurred",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDbHealth();

    return () => {
      controller.abort();
    };
  }, []);

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

          {error && <p className="text-red-500">Error: {error}</p>}

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
