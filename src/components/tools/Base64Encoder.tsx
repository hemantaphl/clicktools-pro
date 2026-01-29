import { useState } from "react";
import { FileCode, Copy, Check, ArrowRightLeft } from "lucide-react";

export function Base64Encoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const process = () => {
    setError("");
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setError(mode === "decode" ? "Invalid Base64 string" : "Encoding failed");
      setOutput("");
    }
  };

  const toggleMode = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput("");
    setError("");
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="bg-card rounded-lg p-1.5 flex gap-1">
        <button
          onClick={() => { setMode("encode"); setOutput(""); setError(""); }}
          className={`flex-1 py-3 rounded-md text-sm font-medium transition-all ${
            mode === "encode" 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground"
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => { setMode("decode"); setOutput(""); setError(""); }}
          className={`flex-1 py-3 rounded-md text-sm font-medium transition-all ${
            mode === "decode" 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground"
          }`}
        >
          Decode
        </button>
      </div>

      {/* Input */}
      <div className="bg-card rounded-lg p-5 space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            {mode === "encode" ? "Text to Encode" : "Base64 to Decode"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Enter text..." : "Enter Base64 string..."}
            rows={4}
            className="w-full p-4 rounded-lg bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono text-sm"
          />
        </div>

        <button
          onClick={process}
          disabled={!input}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <FileCode className="w-5 h-5" />
          {mode === "encode" ? "Encode" : "Decode"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 rounded-lg p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="bg-card rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              {mode === "encode" ? "Encoded Result" : "Decoded Result"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={toggleMode}
                className="p-2 rounded-lg bg-surface active:scale-95 transition-transform"
              >
                <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={copyOutput}
                className="p-2 rounded-lg bg-surface active:scale-95 transition-transform"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-accent" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          <p className="font-mono text-sm text-muted-foreground break-all bg-surface p-4 rounded-lg">
            {output}
          </p>
        </div>
      )}
    </div>
  );
}
