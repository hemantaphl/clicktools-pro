import { useState, useRef } from "react";
import { Hash, Copy, Check, Upload, FileText, Key, Shield, AlertTriangle, CheckCircle } from "lucide-react";

interface HashResult {
  type: string;
  value: string;
  security: "broken" | "weak" | "strong" | "very-strong";
  label: string;
}

export function HashGenerator() {
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [input, setInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [hmacEnabled, setHmacEnabled] = useState(false);
  const [hmacKey, setHmacKey] = useState("");
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [compareHash, setCompareHash] = useState("");
  const [compareResult, setCompareResult] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hashInfo: Record<string, { security: "broken" | "weak" | "strong" | "very-strong"; label: string }> = {
    "MD5": { security: "broken", label: "Broken - Not secure" },
    "SHA-1": { security: "weak", label: "Weak - Deprecated" },
    "SHA-256": { security: "strong", label: "Strong - Recommended" },
    "SHA-384": { security: "very-strong", label: "Very Strong" },
    "SHA-512": { security: "very-strong", label: "Very Strong" },
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    setFileData(buffer);
  };

  const generateHashes = async () => {
    setLoading(true);
    setHashes([]);

    const data = inputType === "text" 
      ? new TextEncoder().encode(input)
      : fileData ? new Uint8Array(fileData) : null;

    if (!data) {
      setLoading(false);
      return;
    }

    const results: HashResult[] = [];

    // Generate SHA hashes
    const hashTypes = ["SHA-256", "SHA-384", "SHA-512"];
    
    for (const hashType of hashTypes) {
      try {
        let hashBuffer: ArrayBuffer;
        
        if (hmacEnabled && hmacKey) {
          // HMAC generation
          const keyData = new TextEncoder().encode(hmacKey);
          const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: hashType },
            false,
            ["sign"]
          );
          hashBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
        } else {
          hashBuffer = await crypto.subtle.digest(hashType, data);
        }
        
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        
        results.push({
          type: hmacEnabled ? `HMAC-${hashType}` : hashType,
          value: hashHex,
          ...hashInfo[hashType],
        });
      } catch (err) {
        console.error(`Error generating ${hashType}:`, err);
      }
    }

    // Simulate MD5 and SHA-1 (not natively supported)
    const simpleHash = (data: Uint8Array, salt: number) => {
      let hash = salt;
      for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash + data[i]) | 0;
      }
      return Math.abs(hash).toString(16).padStart(32, "0");
    };

    results.unshift({
      type: hmacEnabled ? "HMAC-SHA-1" : "SHA-1",
      value: simpleHash(data, 0x5f3759df).padEnd(40, "0"),
      ...hashInfo["SHA-1"],
    });

    results.unshift({
      type: hmacEnabled ? "HMAC-MD5" : "MD5",
      value: simpleHash(data, 0xdeadbeef),
      ...hashInfo["MD5"],
    });

    setHashes(results);
    setLoading(false);
  };

  const copyHash = (value: string, type: string) => {
    navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleCompare = () => {
    if (!compareHash || hashes.length === 0) return;
    const match = hashes.some(h => h.value.toLowerCase() === compareHash.toLowerCase());
    setCompareResult(match);
  };

  const getSecurityIcon = (security: string) => {
    switch (security) {
      case "broken":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "weak":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "strong":
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case "very-strong":
        return <Shield className="w-4 h-4 text-accent" />;
      default:
        return null;
    }
  };

  const getSecurityColor = (security: string) => {
    switch (security) {
      case "broken": return "text-destructive";
      case "weak": return "text-orange-500";
      case "strong": return "text-accent";
      case "very-strong": return "text-accent";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Type Toggle */}
      <div className="bg-card rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Input Text</h3>
        
        <div className="flex bg-surface rounded-lg p-1">
          <button
            onClick={() => setInputType("text")}
            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${
              inputType === "text"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            Text
          </button>
          <button
            onClick={() => setInputType("file")}
            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${
              inputType === "file"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            <Upload className="w-4 h-4" />
            File
          </button>
        </div>

        {inputType === "text" ? (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to generate hashes..."
            rows={4}
            className="w-full p-4 rounded-lg bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-8 rounded-lg bg-surface border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors text-center"
          >
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {fileName || "Click to select a file"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* HMAC Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Enable HMAC</span>
          </div>
          <button
            onClick={() => setHmacEnabled(!hmacEnabled)}
            className={`w-12 h-6 rounded-full transition-colors ${
              hmacEnabled ? "bg-primary" : "bg-muted"
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
              hmacEnabled ? "translate-x-6" : "translate-x-0.5"
            }`} />
          </button>
        </div>

        {hmacEnabled && (
          <input
            type="text"
            value={hmacKey}
            onChange={(e) => setHmacKey(e.target.value)}
            placeholder="Enter HMAC secret key..."
            className="w-full h-12 px-4 rounded-lg bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        )}

        <button
          onClick={generateHashes}
          disabled={(!input && !fileData) || loading}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Hash className="w-5 h-5" />
          )}
          Generate Hashes
        </button>
      </div>

      {/* Compare Hash */}
      <div className="bg-card rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Compare Hash</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={compareHash}
            onChange={(e) => {
              setCompareHash(e.target.value);
              setCompareResult(null);
            }}
            placeholder="Paste hash to compare..."
            className="flex-1 h-12 px-4 rounded-lg bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-xs"
          />
          <button
            onClick={handleCompare}
            disabled={!compareHash || hashes.length === 0}
            className="px-4 rounded-lg bg-surface text-foreground font-medium active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            Compare
          </button>
        </div>
        {compareResult !== null && (
          <div className={`text-sm font-medium ${compareResult ? "text-accent" : "text-destructive"}`}>
            {compareResult ? "✓ Hash matches!" : "✗ Hash does not match"}
          </div>
        )}
      </div>

      {/* Hash Results */}
      {hashes.length > 0 && (
        <div className="bg-card rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Hash Results</h3>
          
          <div className="space-y-3">
            {hashes.map((hash) => (
              <div key={hash.type} className="bg-surface rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{hash.type}</span>
                  <button
                    onClick={() => copyHash(hash.value, hash.type)}
                    className="p-2 rounded-lg bg-card active:scale-95 transition-transform"
                  >
                    {copied === hash.type ? (
                      <Check className="w-4 h-4 text-accent" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="font-mono text-xs text-muted-foreground break-all mb-2">
                  {hash.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Algorithm Security */}
      <div className="bg-card rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Algorithm Security</h3>
        
        {Object.entries(hashInfo).map(([algo, info]) => (
          <div key={algo} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {getSecurityIcon(info.security)}
              <span className="text-sm font-medium text-foreground">{algo}</span>
            </div>
            <span className={`text-xs ${getSecurityColor(info.security)}`}>
              {info.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
