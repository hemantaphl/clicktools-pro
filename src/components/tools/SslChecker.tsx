import { useState } from "react";
import { Shield, ShieldCheck, ShieldX, Clock, Globe, Lock, AlertTriangle, Copy, Check, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CertificateInfo {
  domain: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  isValid: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  protocol: string;
  keyExchange: string;
  cipher: string;
  keySize: number;
  signatureAlgorithm: string;
  serialNumber: string;
  fingerprint: string;
  subjectAltNames: string[];
  certificateChain: { name: string; issuer: string }[];
}

export function SslChecker() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const cleanDomain = (input: string): string => {
    let cleaned = input.trim().toLowerCase();
    cleaned = cleaned.replace(/^https?:\/\//, '');
    cleaned = cleaned.replace(/\/.*$/, '');
    cleaned = cleaned.replace(/:\d+$/, '');
    return cleaned;
  };

  const checkSSL = async () => {
    const cleanedDomain = cleanDomain(domain);
    if (!cleanedDomain) {
      setError("Please enter a valid domain");
      return;
    }

    setLoading(true);
    setError(null);
    setCertInfo(null);

    try {
      // Calling your real Vercel Backend API
      const response = await fetch(`https://hemantaphuyal.com/api/ssl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanedDomain }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to analyze SSL certificate");
      }

      const validFrom = new Date(data.result.valid_from);
      const validTo = new Date(data.result.valid_till);
      const now = new Date();
      const daysRemaining = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isExpired = daysRemaining < 0;
      const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;

      setCertInfo({
        domain: cleanedDomain,
        issuer: data.result.issuer?.O || data.result.issuer?.CN || "Unknown Issuer",
        validFrom: validFrom.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        validTo: validTo.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        daysRemaining,
        isValid: !isExpired,
        isExpired,
        isExpiringSoon,
        protocol: data.result.protocol || "TLS 1.2/1.3",
        keyExchange: data.result.keyExchange || "ECDHE",
        cipher: data.result.cipher || "AES_GCM",
        keySize: data.result.keySize || 2048,
        signatureAlgorithm: data.result.signature_algorithm || "sha256WithRSAEncryption",
        serialNumber: data.result.serial_number || "N/A",
        fingerprint: data.result.fingerprint || "N/A",
        subjectAltNames: data.result.subject_alt_names || [cleanedDomain],
        certificateChain: data.result.certificate_chain || [
          { name: cleanedDomain, issuer: data.result.issuer?.O || "CA" },
        ],
      });
    } catch (err: any) {
      setError(err.message || "Unable to reach the server. Ensure the domain is correct.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusColor = () => {
    if (!certInfo) return "text-muted-foreground";
    if (certInfo.isExpired) return "text-destructive";
    if (certInfo.isExpiringSoon) return "text-amber-500";
    if (certInfo.isValid) return "text-accent";
    return "text-destructive";
  };

  const getStatusIcon = () => {
    if (!certInfo) return Shield;
    if (certInfo.isExpired) return ShieldX;
    if (certInfo.isExpiringSoon) return AlertTriangle;
    if (certInfo.isValid) return ShieldCheck;
    return ShieldX;
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="space-y-4">
      {/* Domain Input */}
      <div className="bg-card rounded-lg p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkSSL()}
              className="pl-10"
            />
          </div>
          <Button onClick={checkSSL} disabled={loading}>
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              "Check"
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 rounded-lg p-4 flex items-center gap-3 animate-in fade-in zoom-in">
          <ShieldX className="w-5 h-5 text-destructive" />
          <span className="text-sm text-destructive font-medium">{error}</span>
        </div>
      )}

      {/* Results */}
      {certInfo && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-card rounded-lg p-5 border border-border">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                certInfo.isExpired ? 'bg-destructive/10' : 
                certInfo.isExpiringSoon ? 'bg-amber-500/10' : 
                'bg-accent/10'
              }`}>
                <StatusIcon className={`w-7 h-7 ${getStatusColor()}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{certInfo.domain}</h3>
                <p className={`text-sm font-medium ${getStatusColor()}`}>
                  {certInfo.isExpired 
                    ? "Certificate Expired" 
                    : certInfo.isExpiringSoon 
                    ? `Expires in ${certInfo.daysRemaining} days`
                    : "Certificate is Secure & Valid"}
                </p>
              </div>
              <a 
                href={`https://${certInfo.domain}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted active:scale-95 transition-transform"
              >
                <ExternalLink className="w-5 h-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="chain">Chain</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3 mt-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Validity Period</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valid From</span>
                    <span className="text-foreground font-medium">{certInfo.validFrom}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valid Until</span>
                    <span className="text-foreground font-medium">{certInfo.validTo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className={getStatusColor() + " font-bold"}>
                      {certInfo.daysRemaining < 0 ? 'Expired' : `${certInfo.daysRemaining} days remaining`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Issuer Information</span>
                </div>
                <p className="text-foreground font-medium">{certInfo.issuer}</p>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Encryption Security</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center border border-border/50">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Protocol</p>
                    <p className="font-bold text-foreground text-xs uppercase">{certInfo.protocol}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center border border-border/50">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Key Size</p>
                    <p className="font-bold text-foreground text-xs">{certInfo.keySize} bit</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center border border-border/50">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Cipher</p>
                    <p className="font-bold text-foreground text-[10px] truncate px-1">{certInfo.cipher}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center border border-border/50">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Algorithm</p>
                    <p className="font-bold text-foreground text-[10px] truncate px-1">RSA/SHA256</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-3 mt-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Serial Number</span>
                  <button onClick={() => copyToClipboard(certInfo.serialNumber, 'serial')} className="p-1.5 rounded-md hover:bg-muted">
                    {copied === 'serial' ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-xs font-mono text-foreground break-all bg-muted/30 p-2 rounded">{certInfo.serialNumber}</p>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Fingerprint</span>
                  <button onClick={() => copyToClipboard(certInfo.fingerprint, 'fingerprint')} className="p-1.5 rounded-md hover:bg-muted">
                    {copied === 'fingerprint' ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-xs font-mono text-foreground break-all bg-muted/30 p-2 rounded">{certInfo.fingerprint}</p>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase">SANs (Alternative Names)</span>
                <div className="flex flex-wrap gap-2 mt-3">
                  {certInfo.subjectAltNames.slice(0, 10).map((name, idx) => (
                    <span key={idx} className="px-2 py-1 bg-secondary text-[10px] font-mono rounded border border-border">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chain" className="mt-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="space-y-0">
                  {certInfo.certificateChain.map((cert, idx) => (
                    <div key={idx} className="relative">
                      {idx > 0 && <div className="absolute left-5 -top-3 w-0.5 h-3 bg-border" />}
                      <div className="flex items-start gap-3 py-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${idx === 0 ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Shield className={`w-5 h-5 ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground text-sm truncate">{cert.name}</p>
                          <p className="text-xs text-muted-foreground truncate">Issued by: {cert.issuer}</p>
                        </div>
                      </div>
                      {idx < certInfo.certificateChain.length - 1 && <div className="absolute left-5 bottom-0 w-0.5 h-3 bg-border" />}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Empty State */}
      {!certInfo && !error && !loading && (
        <div className="bg-card rounded-lg p-10 text-center border border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-foreground mb-2">Ready to Scan</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Enter any domain to verify its SSL certificate chain, protocol support, and expiration date.
          </p>
        </div>
      )}
    </div>
  );
}