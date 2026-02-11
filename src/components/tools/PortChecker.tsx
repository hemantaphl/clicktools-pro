import { useState } from "react";
import { Network, CheckCircle2, XCircle, ShieldCheck, Info } from "lucide-react";

export function PortChecker() {
  const [host, setHost] = useState("");
  const [port, setPort] = useState(""); // Restored specific port state
  const [results, setResults] = useState<any[]>([]);
  const [checking, setChecking] = useState(false);

  const VERCEL_API_URL = "https://hemantaphuyal.com/api/scan";

  const runRealScan = async () => {
    if (!host) return;
    setChecking(true);
    setResults([]);

    try {
      const response = await fetch(VERCEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          host, 
          port: port ? parseInt(port) : null // Sends specific port if typed, else null for common ports
        }),
      });

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Scan Error:", error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-4 p-1 animate-in fade-in duration-500">
      {/* Input Section */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 ml-1 block">
            Target Host / IP
          </label>
          <input
            type="text"
            placeholder="e.g. google.com or 8.8.8.8"
            className="w-full h-12 px-4 rounded-xl bg-secondary/30 border border-border outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            value={host}
            onChange={(e) => setHost(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5 ml-1 block">
            Specific Port <span className="normal-case font-medium opacity-60">(Optional)</span>
          </label>
          <input
            type="number"
            placeholder="Leave empty for common ports"
            className="w-full h-12 px-4 rounded-xl bg-secondary/30 border border-border outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
        </div>

        <button
          onClick={runRealScan}
          disabled={checking || !host}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {checking ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Network className="w-5 h-5" />
          )}
          {checking ? "Scanning Target..." : "Start Real Scan"}
        </button>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
              Scan Results for {host}
            </h3>
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground">
              {results.length} Ports
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {results.map((res) => (
              <div 
                key={res.port} 
                className="bg-card px-4 py-3 rounded-xl border border-border flex items-center justify-between group active:bg-secondary/20 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold">Port {res.port}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {res.name || (res.port === 80 ? "HTTP" : res.port === 443 ? "HTTPS" : "TCP Service")}
                  </span>
                </div>
                
                <div className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider ${
                  res.status === 'open' 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {res.status === 'open' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {res.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="flex items-start gap-2 px-2 opacity-60">
        <Info className="w-3 h-3 mt-0.5" />
        <p className="text-[10px] leading-relaxed">
          Results are verified via hemantaphuyal.com cloud engine. Timeout is set to 3000ms for accurate detection across global networks.
        </p>
      </div>
    </div>
  );
}