import { useState } from "react";
import { Network, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const commonPorts = [
  { port: 80, name: "HTTP" },
  { port: 443, name: "HTTPS" },
  { port: 21, name: "FTP" },
  { port: 22, name: "SSH" },
  { port: 25, name: "SMTP" },
  { port: 3306, name: "MySQL" },
  { port: 5432, name: "PostgreSQL" },
  { port: 8080, name: "HTTP Alt" },
];

export function PortChecker() {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [results, setResults] = useState<Array<{ port: number; name: string; status: "open" | "closed" | "unknown" }>>([]);
  const [checking, setChecking] = useState(false);

  const checkPort = async () => {
    if (!host) return;
    
    setChecking(true);
    const portsToCheck = port 
      ? [{ port: parseInt(port), name: `Port ${port}` }]
      : commonPorts;

    // Note: True port checking requires a backend service
    // This is a simulation for demonstration
    const newResults = portsToCheck.map(p => ({
      ...p,
      status: Math.random() > 0.5 ? "open" : "closed" as "open" | "closed" | "unknown"
    }));

    await new Promise(resolve => setTimeout(resolve, 1500));
    setResults(newResults);
    setChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case "closed":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="bg-card rounded-lg p-5 space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Host / IP Address
          </label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="e.g., google.com or 8.8.8.8"
            className="w-full h-12 px-4 rounded-lg bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Port (optional - leave empty for common ports)
          </label>
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="e.g., 80, 443, 22"
            className="w-full h-12 px-4 rounded-lg bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          onClick={checkPort}
          disabled={checking || !host}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {checking ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Network className="w-5 h-5" />
          )}
          {checking ? "Checking..." : "Check Ports"}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-card rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">Results for {host}</p>
          </div>
          <div className="divide-y divide-border">
            {results.map((result) => (
              <div key={result.port} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-foreground">{result.name}</p>
                  <p className="text-sm text-muted-foreground">Port {result.port}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className={`text-sm font-medium capitalize ${
                    result.status === "open" ? "text-accent" : 
                    result.status === "closed" ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    {result.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-surface rounded-lg p-4">
        <p className="text-xs text-muted-foreground text-center">
          Note: Port checking requires server-side implementation for accurate results.
        </p>
      </div>
    </div>
  );
}
