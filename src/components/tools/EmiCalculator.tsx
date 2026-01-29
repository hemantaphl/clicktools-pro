import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";

export function EmiCalculator() {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(12);
  const [tenure, setTenure] = useState(12);
  const [tenureType, setTenureType] = useState<"months" | "years">("months");

  const tenureInMonths = tenureType === "years" ? tenure * 12 : tenure;

  const result = useMemo(() => {
    const p = principal;
    const r = rate / 12 / 100;
    const n = tenureInMonths;

    if (p > 0 && r > 0 && n > 0) {
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalAmount = emi * n;
      const totalInterest = totalAmount - p;

      return {
        emi,
        totalInterest,
        totalAmount,
      };
    }
    return null;
  }, [principal, rate, tenureInMonths]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-NP", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatSliderValue = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(0)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-4">
      {/* Loan Details */}
      <div className="bg-card rounded-lg p-5 space-y-6">
        <h3 className="text-sm font-semibold text-foreground">Loan Details</h3>

        {/* Loan Amount */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-muted-foreground">Loan Amount</label>
            <div className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-lg">
              <span className="text-xs text-muted-foreground">रु.</span>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-24 text-right text-sm font-medium bg-transparent text-foreground focus:outline-none"
              />
            </div>
          </div>
          <input
            type="range"
            min="10000"
            max="100000000"
            step="10000"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full accent-primary h-2 rounded-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>रु. 10K</span>
            <span>रु. 1Cr</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-muted-foreground">Interest Rate (% p.a.)</label>
            <div className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-lg">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                step="0.1"
                className="w-16 text-right text-sm font-medium bg-transparent text-foreground focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-primary h-2 rounded-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Loan Tenure */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-muted-foreground">Loan Tenure</label>
            <div className="flex items-center gap-2">
              <div className="flex bg-surface rounded-lg p-0.5">
                <button
                  onClick={() => setTenureType("months")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    tenureType === "months"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Months
                </button>
                <button
                  onClick={() => setTenureType("years")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    tenureType === "years"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Years
                </button>
              </div>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max={tenureType === "months" ? 360 : 30}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full accent-primary h-2 rounded-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 {tenureType === "months" ? "Month" : "Year"}</span>
            <span className="font-medium text-foreground">{tenure} {tenureType}</span>
            <span>{tenureType === "months" ? "360 Months" : "30 Years"}</span>
          </div>
        </div>
      </div>

      {/* Monthly EMI */}
      {result && (
        <div className="bg-primary/10 rounded-lg p-5 text-center">
          <p className="text-sm text-muted-foreground mb-1">Monthly EMI</p>
          <p className="text-2xl font-bold text-primary">
            NPR {formatCurrency(result.emi)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            for {tenureInMonths} months
          </p>
        </div>
      )}

      {/* Payment Breakdown */}
      {result && (
        <div className="bg-card rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Payment Breakdown</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Principal</span>
              <span className="font-medium text-foreground">NPR {formatCurrency(principal)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Interest</span>
              <span className="font-medium text-destructive">NPR {formatCurrency(result.totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-foreground">Total Payment</span>
              <span className="font-bold text-primary text-lg">NPR {formatCurrency(result.totalAmount)}</span>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="mt-4">
            <div className="h-3 rounded-full overflow-hidden flex">
              <div 
                className="bg-primary"
                style={{ width: `${(principal / result.totalAmount) * 100}%` }}
              />
              <div 
                className="bg-destructive"
                style={{ width: `${(result.totalInterest / result.totalAmount) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Principal ({((principal / result.totalAmount) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Interest ({((result.totalInterest / result.totalAmount) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
