import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { haptic } from "@/lib/haptics";

interface SubnetResult {
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: string;
  usableHosts: string;
  subnetMask: string;
  wildcardMask: string;
  binaryMask: string;
  ipClass: string;
  ipType: string;
}

interface IPv6Result {
  fullAddress: string;
  shortAddress: string;
  networkPrefix: string;
  hostPart: string;
  totalAddresses: string;
  prefixLength: number;
  addressType: string;
  scope: string;
}

export function SubnetCalculator() {
  const [ipType, setIpType] = useState<"ipv4" | "ipv6">("ipv4");
  const [ip, setIp] = useState("192.168.1.0");
  const [ipv6, setIpv6] = useState("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
  const [cidr, setCidr] = useState(24);
  const [cidr6, setCidr6] = useState(64);
  const [result, setResult] = useState<SubnetResult | null>(null);
  const [result6, setResult6] = useState<IPv6Result | null>(null);
  const [copied, setCopied] = useState("");

  const commonSubnets = [8, 16, 24, 28, 30];
  const commonSubnets6 = [48, 56, 64, 112, 128];

  const getIpClass = (ip: string): string => {
    const firstOctet = parseInt(ip.split(".")[0]);
    if (firstOctet >= 1 && firstOctet <= 126) return "Class A";
    if (firstOctet >= 128 && firstOctet <= 191) return "Class B";
    if (firstOctet >= 192 && firstOctet <= 223) return "Class C";
    if (firstOctet >= 224 && firstOctet <= 239) return "Class D";
    return "Class E";
  };

  const getIpType = (ip: string): string => {
    const parts = ip.split(".").map(Number);
    if (parts[0] === 10) return "Private";
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return "Private";
    if (parts[0] === 192 && parts[1] === 168) return "Private";
    if (parts[0] === 127) return "Loopback";
    return "Public";
  };

  const calculateSubnet = () => {
    haptic.light();
    const ipParts = ip.split(".").map(Number);
    if (ipParts.length !== 4 || ipParts.some(p => isNaN(p) || p < 0 || p > 255)) {
      haptic.error();
      return;
    }

    if (cidr < 0 || cidr > 32) return;

    const ipBinary = ipParts.map(p => p.toString(2).padStart(8, "0")).join("");
    const networkBinary = ipBinary.slice(0, cidr).padEnd(32, "0");
    const broadcastBinary = ipBinary.slice(0, cidr).padEnd(32, "1");

    const binaryToIp = (binary: string) => {
      const parts = [];
      for (let i = 0; i < 32; i += 8) {
        parts.push(parseInt(binary.slice(i, i + 8), 2));
      }
      return parts.join(".");
    };

    const networkAddress = binaryToIp(networkBinary);
    const broadcastAddress = binaryToIp(broadcastBinary);

    const firstHostBinary = networkBinary.slice(0, 31) + "1";
    const lastHostBinary = broadcastBinary.slice(0, 31) + "0";

    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = Math.max(0, totalHosts - 2);

    const maskBinary = "1".repeat(cidr).padEnd(32, "0");
    const subnetMask = binaryToIp(maskBinary);

    const wildcardBinary = "0".repeat(cidr).padEnd(32, "1");
    const wildcardMask = binaryToIp(wildcardBinary);

    const binaryMask = maskBinary.match(/.{8}/g)?.join(".") || "";

    setResult({
      networkAddress,
      broadcastAddress,
      firstHost: binaryToIp(firstHostBinary),
      lastHost: binaryToIp(lastHostBinary),
      totalHosts: totalHosts.toLocaleString(),
      usableHosts: usableHosts.toLocaleString(),
      subnetMask,
      wildcardMask,
      binaryMask,
      ipClass: getIpClass(ip),
      ipType: getIpType(ip),
    });
    haptic.success();
  };

  // IPv6 Helper Functions
  const expandIPv6 = (address: string): string => {
    // Handle :: expansion
    let parts = address.split("::");
    
    if (parts.length === 2) {
      const left = parts[0] ? parts[0].split(":") : [];
      const right = parts[1] ? parts[1].split(":") : [];
      const missing = 8 - left.length - right.length;
      const middle = Array(missing).fill("0000");
      parts = [...left, ...middle, ...right];
    } else {
      parts = address.split(":");
    }
    
    return parts.map(p => p.padStart(4, "0")).join(":");
  };

  const compressIPv6 = (address: string): string => {
    const parts = address.split(":").map(p => p.replace(/^0+/, "") || "0");
    
    // Find longest run of zeros
    let longestStart = -1;
    let longestLen = 0;
    let currentStart = -1;
    let currentLen = 0;
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === "0") {
        if (currentStart === -1) currentStart = i;
        currentLen++;
      } else {
        if (currentLen > longestLen) {
          longestStart = currentStart;
          longestLen = currentLen;
        }
        currentStart = -1;
        currentLen = 0;
      }
    }
    
    if (currentLen > longestLen) {
      longestStart = currentStart;
      longestLen = currentLen;
    }
    
    if (longestLen > 1) {
      const before = parts.slice(0, longestStart).join(":");
      const after = parts.slice(longestStart + longestLen).join(":");
      return `${before}::${after}`;
    }
    
    return parts.join(":");
  };

  const getIPv6Type = (address: string): string => {
    const full = expandIPv6(address).toLowerCase();
    
    if (full.startsWith("fe80:")) return "Link-Local";
    if (full.startsWith("fc") || full.startsWith("fd")) return "Unique Local";
    if (full.startsWith("ff")) return "Multicast";
    if (full === "0000:0000:0000:0000:0000:0000:0000:0001") return "Loopback";
    if (full === "0000:0000:0000:0000:0000:0000:0000:0000") return "Unspecified";
    if (full.startsWith("2001:0db8:")) return "Documentation";
    if (full.startsWith("2") || full.startsWith("3")) return "Global Unicast";
    
    return "Reserved";
  };

  const getIPv6Scope = (type: string): string => {
    switch (type) {
      case "Link-Local": return "Local network only";
      case "Unique Local": return "Organization-wide";
      case "Multicast": return "One-to-many";
      case "Loopback": return "Local machine";
      case "Global Unicast": return "Internet-routable";
      case "Documentation": return "Examples only";
      default: return "Special purpose";
    }
  };

  const calculateIPv6Subnet = () => {
    haptic.light();
    
    try {
      const fullAddress = expandIPv6(ipv6);
      const shortAddress = compressIPv6(fullAddress);
      
      // Convert to binary
      const hexParts = fullAddress.split(":");
      const binaryStr = hexParts.map(h => 
        parseInt(h, 16).toString(2).padStart(16, "0")
      ).join("");
      
      // Get network prefix (binary)
      const networkBinary = binaryStr.slice(0, cidr6).padEnd(128, "0");
      
      // Convert back to hex
      const networkHex: string[] = [];
      for (let i = 0; i < 128; i += 16) {
        networkHex.push(parseInt(networkBinary.slice(i, i + 16), 2).toString(16).padStart(4, "0"));
      }
      const networkPrefix = compressIPv6(networkHex.join(":"));
      
      // Get host part
      const hostBinary = binaryStr.slice(cidr6);
      const hostPart = hostBinary.length > 0 ? `::${parseInt(hostBinary, 2).toString(16) || "0"}` : "::0";
      
      // Calculate total addresses
      const hostBits = 128 - cidr6;
      let totalAddresses: string;
      if (hostBits >= 64) {
        totalAddresses = `2^${hostBits} (≈ ${(Math.pow(2, Math.min(hostBits, 53)) / 1e18).toFixed(0)}+ quintillion)`;
      } else if (hostBits >= 40) {
        totalAddresses = `2^${hostBits} (≈ ${(Math.pow(2, hostBits) / 1e12).toFixed(0)} trillion)`;
      } else {
        totalAddresses = Math.pow(2, hostBits).toLocaleString();
      }
      
      const addressType = getIPv6Type(ipv6);
      
      setResult6({
        fullAddress,
        shortAddress,
        networkPrefix,
        hostPart,
        totalAddresses,
        prefixLength: cidr6,
        addressType,
        scope: getIPv6Scope(addressType),
      });
      
      haptic.success();
    } catch (e) {
      haptic.error();
    }
  };

  const copyValue = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    haptic.medium();
    setTimeout(() => setCopied(""), 2000);
  };

  const ResultRow = ({ label, value, copyKey }: { label: string; value: string; copyKey: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-foreground">{value}</span>
        <button
          onClick={() => copyValue(value, copyKey)}
          className="p-1.5 rounded-lg bg-surface touch-feedback"
        >
          {copied === copyKey ? (
            <Check className="w-3.5 h-3.5 text-accent" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* IP Type Toggle */}
      <div className="bg-card rounded-lg p-1 flex">
        <button
          onClick={() => { setIpType("ipv4"); haptic.light(); }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors touch-feedback ${
            ipType === "ipv4"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
        >
          IPv4
        </button>
        <button
          onClick={() => { setIpType("ipv6"); haptic.light(); }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors touch-feedback ${
            ipType === "ipv6"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
        >
          IPv6
        </button>
      </div>

      {ipType === "ipv4" ? (
        <>
          {/* IPv4 Network Details */}
          <div className="bg-card rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Network Details</h3>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">IP Address</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="e.g., 192.168.1.0"
                className="w-full h-12 px-4 rounded-lg bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-muted-foreground">CIDR Notation (/{cidr})</label>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={cidr}
                onChange={(e) => setCidr(Number(e.target.value))}
                className="w-full accent-primary h-2 rounded-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>/0</span>
                <span>/8</span>
                <span>/16</span>
                <span>/24</span>
                <span>/32</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Common Subnets</label>
              <div className="flex gap-2 flex-wrap">
                {commonSubnets.map((subnet) => (
                  <button
                    key={subnet}
                    onClick={() => { setCidr(subnet); haptic.light(); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-feedback ${
                      cidr === subnet
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-muted-foreground"
                    }`}
                  >
                    /{subnet}
                  </button>
                ))}
              </div>
            </div>

            {ip && (
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <p className="font-mono text-lg font-bold text-primary">
                  {ip}/{cidr}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result ? `${result.usableHosts} Usable Hosts` : "Calculate to see results"}
                </p>
              </div>
            )}

            <button
              onClick={calculateSubnet}
              disabled={!ip}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium touch-feedback disabled:opacity-50"
            >
              Calculate
            </button>
          </div>

          {/* IPv4 Results */}
          {result && (
            <div className="bg-card rounded-lg p-5 animate-scale-in">
              <h3 className="text-sm font-semibold text-foreground mb-4">Results</h3>
              
              <ResultRow label="Network Address" value={result.networkAddress} copyKey="network" />
              <ResultRow label="Broadcast Address" value={result.broadcastAddress} copyKey="broadcast" />
              <ResultRow label="First Usable Host" value={result.firstHost} copyKey="first" />
              <ResultRow label="Last Usable Host" value={result.lastHost} copyKey="last" />
              <ResultRow label="Subnet Mask" value={result.subnetMask} copyKey="mask" />
              <ResultRow label="Wildcard Mask" value={result.wildcardMask} copyKey="wildcard" />
              
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Total Hosts</span>
                <span className="font-mono text-sm font-medium text-foreground">{result.totalHosts}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">IP Class</span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">{result.ipClass}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">IP Type</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  result.ipType === "Private" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                }`}>{result.ipType}</span>
              </div>

              <div className="pt-3">
                <span className="text-sm text-muted-foreground block mb-2">Binary Netmask</span>
                <p className="font-mono text-xs text-foreground bg-surface p-3 rounded-lg break-all">
                  {result.binaryMask}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* IPv6 Network Details */}
          <div className="bg-card rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">IPv6 Network Details</h3>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">IPv6 Address</label>
              <input
                type="text"
                value={ipv6}
                onChange={(e) => setIpv6(e.target.value)}
                placeholder="e.g., 2001:db8::1"
                className="w-full h-12 px-4 rounded-lg bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm text-muted-foreground">Prefix Length (/{cidr6})</label>
              </div>
              <input
                type="range"
                min="1"
                max="128"
                value={cidr6}
                onChange={(e) => setCidr6(Number(e.target.value))}
                className="w-full accent-primary h-2 rounded-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>/1</span>
                <span>/48</span>
                <span>/64</span>
                <span>/112</span>
                <span>/128</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Common Prefixes</label>
              <div className="flex gap-2 flex-wrap">
                {commonSubnets6.map((prefix) => (
                  <button
                    key={prefix}
                    onClick={() => { setCidr6(prefix); haptic.light(); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-feedback ${
                      cidr6 === prefix
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-muted-foreground"
                    }`}
                  >
                    /{prefix}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="font-mono text-sm font-bold text-primary break-all">
                {compressIPv6(expandIPv6(ipv6))}/{cidr6}
              </p>
            </div>

            <button
              onClick={calculateIPv6Subnet}
              disabled={!ipv6}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium touch-feedback disabled:opacity-50"
            >
              Calculate
            </button>
          </div>

          {/* IPv6 Results */}
          {result6 && (
            <div className="bg-card rounded-lg p-5 animate-scale-in">
              <h3 className="text-sm font-semibold text-foreground mb-4">IPv6 Results</h3>
              
              <ResultRow label="Full Address" value={result6.fullAddress} copyKey="full" />
              <ResultRow label="Short Address" value={result6.shortAddress} copyKey="short" />
              <ResultRow label="Network Prefix" value={`${result6.networkPrefix}/${result6.prefixLength}`} copyKey="prefix" />
              
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Total Addresses</span>
                <span className="font-mono text-xs font-medium text-foreground text-right max-w-[180px]">{result6.totalAddresses}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Address Type</span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">{result6.addressType}</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">Scope</span>
                <span className="text-sm font-medium text-foreground">{result6.scope}</span>
              </div>
            </div>
          )}

          {/* IPv6 Info */}
          <div className="bg-surface rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">IPv6 Address Types:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <span className="font-mono">2000::/3</span> - Global Unicast</li>
              <li>• <span className="font-mono">fc00::/7</span> - Unique Local</li>
              <li>• <span className="font-mono">fe80::/10</span> - Link-Local</li>
              <li>• <span className="font-mono">ff00::/8</span> - Multicast</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
