import { useState, useEffect } from "react";
import { Copy, Check, MapPin, Wifi } from "lucide-react";

interface IpData {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
  timezone?: string;
}

export function IpChecker() {
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchIpData();
  }, []);

  const fetchIpData = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      setIpData({
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name,
        org: data.org,
        timezone: data.timezone,
      });
    } catch {
      // Fallback to simpler API
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setIpData({ ip: data.ip });
      } catch {
        setIpData({ ip: "Unable to fetch IP" });
      }
    }
    setLoading(false);
  };

  const copyIp = () => {
    if (ipData?.ip) {
      navigator.clipboard.writeText(ipData.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* IP Address Card */}
      <div className="bg-card rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Your IP Address</span>
          </div>
          <button
            onClick={copyIp}
            className="p-2 rounded-lg bg-surface active:scale-95 transition-transform"
          >
            {copied ? (
              <Check className="w-5 h-5 text-accent" />
            ) : (
              <Copy className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
        <p className="text-2xl font-bold text-foreground font-mono">{ipData?.ip}</p>
      </div>

      {/* Location Info */}
      {ipData?.city && (
        <div className="bg-card rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">Location</span>
          </div>
          <div className="space-y-3">
            {ipData.city && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">City</span>
                <span className="font-medium text-foreground">{ipData.city}</span>
              </div>
            )}
            {ipData.region && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Region</span>
                <span className="font-medium text-foreground">{ipData.region}</span>
              </div>
            )}
            {ipData.country && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Country</span>
                <span className="font-medium text-foreground">{ipData.country}</span>
              </div>
            )}
            {ipData.org && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">ISP</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">{ipData.org}</span>
              </div>
            )}
            {ipData.timezone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Timezone</span>
                <span className="font-medium text-foreground">{ipData.timezone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchIpData}
        className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium active:scale-[0.98] transition-transform"
      >
        Refresh
      </button>
    </div>
  );
}
