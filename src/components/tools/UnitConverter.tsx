import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownUp, Copy, Check } from "lucide-react";
import { toast } from "sonner";

// ── Unit definitions ──────────────────────────────────────────────

interface UnitDef {
  label: string;
  /** Factor to convert TO the base unit. For temperature, handled specially. */
  factor: number;
}

interface UnitCategory {
  label: string;
  base: string;
  units: Record<string, UnitDef>;
}

const categories: Record<string, UnitCategory> = {
  length: {
    label: "Length",
    base: "m",
    units: {
      km: { label: "Kilometer (km)", factor: 1000 },
      m: { label: "Meter (m)", factor: 1 },
      cm: { label: "Centimeter (cm)", factor: 0.01 },
      mm: { label: "Millimeter (mm)", factor: 0.001 },
      um: { label: "Micrometer (µm)", factor: 1e-6 },
      nm: { label: "Nanometer (nm)", factor: 1e-9 },
      mi: { label: "Mile (mi)", factor: 1609.344 },
      yd: { label: "Yard (yd)", factor: 0.9144 },
      ft: { label: "Foot (ft)", factor: 0.3048 },
      in: { label: "Inch (in)", factor: 0.0254 },
      nmi: { label: "Nautical Mile (nmi)", factor: 1852 },
    },
  },
  weight: {
    label: "Weight",
    base: "kg",
    units: {
      t: { label: "Metric Ton (t)", factor: 1000 },
      kg: { label: "Kilogram (kg)", factor: 1 },
      g: { label: "Gram (g)", factor: 0.001 },
      mg: { label: "Milligram (mg)", factor: 1e-6 },
      ug: { label: "Microgram (µg)", factor: 1e-9 },
      lb: { label: "Pound (lb)", factor: 0.453592 },
      oz: { label: "Ounce (oz)", factor: 0.0283495 },
      st: { label: "Stone (st)", factor: 6.35029 },
    },
  },
  temperature: {
    label: "Temperature",
    base: "c",
    units: {
      c: { label: "Celsius (°C)", factor: 0 },
      f: { label: "Fahrenheit (°F)", factor: 0 },
      k: { label: "Kelvin (K)", factor: 0 },
    },
  },
  volume: {
    label: "Volume",
    base: "l",
    units: {
      m3: { label: "Cubic Meter (m³)", factor: 1000 },
      l: { label: "Liter (L)", factor: 1 },
      ml: { label: "Milliliter (mL)", factor: 0.001 },
      gal_us: { label: "US Gallon", factor: 3.78541 },
      gal_uk: { label: "UK Gallon", factor: 4.54609 },
      qt: { label: "US Quart", factor: 0.946353 },
      pt: { label: "US Pint", factor: 0.473176 },
      cup: { label: "US Cup", factor: 0.236588 },
      fl_oz: { label: "US Fluid Ounce", factor: 0.0295735 },
      tbsp: { label: "Tablespoon", factor: 0.0147868 },
      tsp: { label: "Teaspoon", factor: 0.00492892 },
    },
  },
  area: {
    label: "Area",
    base: "m2",
    units: {
      km2: { label: "Square Kilometer (km²)", factor: 1e6 },
      m2: { label: "Square Meter (m²)", factor: 1 },
      cm2: { label: "Square Centimeter (cm²)", factor: 1e-4 },
      ha: { label: "Hectare (ha)", factor: 1e4 },
      ac: { label: "Acre (ac)", factor: 4046.86 },
      mi2: { label: "Square Mile (mi²)", factor: 2.59e6 },
      ft2: { label: "Square Foot (ft²)", factor: 0.092903 },
      in2: { label: "Square Inch (in²)", factor: 6.4516e-4 },
      ropani: { label: "Ropani", factor: 508.72 },
      anna: { label: "Anna", factor: 31.80 },
      bigha: { label: "Bigha", factor: 6772.63 },
      kattha: { label: "Kattha", factor: 338.63 },
      dhur: { label: "Dhur", factor: 16.93 },
    },
  },
  speed: {
    label: "Speed",
    base: "ms",
    units: {
      ms: { label: "Meter/second (m/s)", factor: 1 },
      kmh: { label: "Kilometer/hour (km/h)", factor: 0.277778 },
      mph: { label: "Mile/hour (mph)", factor: 0.44704 },
      kn: { label: "Knot (kn)", factor: 0.514444 },
      fts: { label: "Foot/second (ft/s)", factor: 0.3048 },
    },
  },
  time: {
    label: "Time",
    base: "s",
    units: {
      ns: { label: "Nanosecond (ns)", factor: 1e-9 },
      us: { label: "Microsecond (µs)", factor: 1e-6 },
      ms_t: { label: "Millisecond (ms)", factor: 0.001 },
      s: { label: "Second (s)", factor: 1 },
      min: { label: "Minute (min)", factor: 60 },
      hr: { label: "Hour (hr)", factor: 3600 },
      day: { label: "Day", factor: 86400 },
      wk: { label: "Week", factor: 604800 },
      yr: { label: "Year (365d)", factor: 31536000 },
    },
  },
  data: {
    label: "Digital Storage",
    base: "B",
    units: {
      b: { label: "Bit (b)", factor: 0.125 },
      B: { label: "Byte (B)", factor: 1 },
      KB: { label: "Kilobyte (KB)", factor: 1024 },
      MB: { label: "Megabyte (MB)", factor: 1048576 },
      GB: { label: "Gigabyte (GB)", factor: 1073741824 },
      TB: { label: "Terabyte (TB)", factor: 1099511627776 },
      PB: { label: "Petabyte (PB)", factor: 1125899906842624 },
    },
  },
};

// ── Temperature helpers ──────────────────────────────────────────

function convertTemp(value: number, from: string, to: string): number {
  if (from === to) return value;
  // Convert to Celsius first
  let celsius: number;
  if (from === "c") celsius = value;
  else if (from === "f") celsius = (value - 32) * (5 / 9);
  else celsius = value - 273.15; // kelvin

  // Convert from Celsius to target
  if (to === "c") return celsius;
  if (to === "f") return celsius * (9 / 5) + 32;
  return celsius + 273.15; // kelvin
}

// ── Formatter ────────────────────────────────────────────────────

function formatResult(num: number): string {
  if (num === 0) return "0";
  const abs = Math.abs(num);
  if (abs >= 1e15 || (abs > 0 && abs < 1e-10)) {
    return num.toExponential(8);
  }
  // Up to 10 significant digits, trim trailing zeros
  return parseFloat(num.toPrecision(10)).toString();
}

// ── Component ────────────────────────────────────────────────────

export function UnitConverter() {
  const [category, setCategory] = useState("length");
  const cat = categories[category];
  const unitKeys = Object.keys(cat.units);

  const [fromUnit, setFromUnit] = useState(unitKeys[0]);
  const [toUnit, setToUnit] = useState(unitKeys[1]);
  const [inputValue, setInputValue] = useState("1");
  const [copied, setCopied] = useState(false);

  // Reset units when category changes
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    const keys = Object.keys(categories[val].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1]);
    setInputValue("1");
  };

  const result = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return "";
    if (category === "temperature") {
      return formatResult(convertTemp(num, fromUnit, toUnit));
    }
    const baseValue = num * cat.units[fromUnit].factor;
    return formatResult(baseValue / cat.units[toUnit].factor);
  }, [inputValue, fromUnit, toUnit, category, cat]);

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result) setInputValue(result);
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      {/* Category Selector */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Category</Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([key, c]) => (
            <Button
              key={key}
              size="sm"
              variant={category === key ? "default" : "outline"}
              className="rounded-full text-xs h-8"
              onClick={() => handleCategoryChange(key)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-border/50 bg-surface">
        <CardContent className="p-4 space-y-4">
          {/* From */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger className="rounded-xl bg-background border-border/50 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {unitKeys.map((u) => (
                  <SelectItem key={u} value={u}>
                    {cat.units[u].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter value"
              className="text-lg font-semibold"
            />
          </div>

          {/* Swap */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 border-primary/30 hover:bg-primary/10"
              onClick={swap}
            >
              <ArrowDownUp className="h-4 w-4 text-primary" />
            </Button>
          </div>

          {/* To */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger className="rounded-xl bg-background border-border/50 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {unitKeys.map((u) => (
                  <SelectItem key={u} value={u}>
                    {cat.units[u].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Result */}
            <div
              className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={copyResult}
            >
              <span className="text-lg font-bold text-foreground">
                {result || "—"}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula info */}
      {inputValue && result && (
        <p className="text-xs text-muted-foreground text-center">
          {inputValue} {cat.units[fromUnit].label} = {result} {cat.units[toUnit].label}
        </p>
      )}
    </div>
  );
}
