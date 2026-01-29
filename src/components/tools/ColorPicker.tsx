import { useState, useEffect, useRef } from "react";
import { Copy, Check, Pipette, RefreshCw, Palette, Shuffle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

interface ColorFormats {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

export function ColorPicker() {
  const [color, setColor] = useState<ColorFormats>({
    hex: "#6366f1",
    rgb: { r: 99, g: 102, b: 241 },
    hsl: { h: 239, s: 84, l: 67 },
    hsv: { h: 239, s: 59, v: 95 },
    cmyk: { c: 59, m: 58, y: 0, k: 5 },
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("#6366f1");
  const [harmonies, setHarmonies] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    calculateHarmonies(color.hsl.h);
  }, [color.hsl.h]);

  useEffect(() => {
    drawColorWheel();
  }, []);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    if (r === 0 && g === 0 && b === 0) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }

    const c = 1 - r / 255;
    const m = 1 - g / 255;
    const y = 1 - b / 255;
    const k = Math.min(c, m, y);

    return {
      c: Math.round(((c - k) / (1 - k)) * 100),
      m: Math.round(((m - k) / (1 - k)) * 100),
      y: Math.round(((y - k) / (1 - k)) * 100),
      k: Math.round(k * 100),
    };
  };

  const updateFromHex = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      setColor({ hex, rgb, hsl, hsv, cmyk });
      setInputValue(hex);
    }
  };

  const updateFromRgb = (rgb: { r: number; g: number; b: number }) => {
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setColor({ hex, rgb, hsl, hsv, cmyk });
    setInputValue(hex);
  };

  const updateFromHsl = (hsl: { h: number; s: number; l: number }) => {
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setColor({ hex, rgb, hsl, hsv, cmyk });
    setInputValue(hex);
  };

  const calculateHarmonies = (h: number) => {
    const complementary = (h + 180) % 360;
    const triadic1 = (h + 120) % 360;
    const triadic2 = (h + 240) % 360;
    const analogous1 = (h + 30) % 360;
    const analogous2 = (h - 30 + 360) % 360;
    const splitComp1 = (h + 150) % 360;
    const splitComp2 = (h + 210) % 360;

    const toHex = (hue: number) => {
      const rgb = hslToRgb(hue, color.hsl.s, color.hsl.l);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    };

    setHarmonies([
      toHex(complementary),
      toHex(triadic1),
      toHex(triadic2),
      toHex(analogous1),
      toHex(analogous2),
      toHex(splitComp1),
      toHex(splitComp2),
    ]);
  };

  const drawColorWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 5;

    for (let angle = 0; angle < 360; angle++) {
      const startAngle = ((angle - 1) * Math.PI) / 180;
      const endAngle = ((angle + 1) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, `hsl(${angle}, 0%, 100%)`);
      gradient.addColorStop(0.5, `hsl(${angle}, 100%, 50%)`);
      gradient.addColorStop(1, `hsl(${angle}, 100%, 25%)`);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  };

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left - canvas.width / 2;
    const y = clientY - rect.top - canvas.height / 2;
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    const h = (angle + 360) % 360;
    
    const distance = Math.sqrt(x * x + y * y);
    const maxRadius = canvas.width / 2 - 5;
    const s = Math.min(100, (distance / maxRadius) * 100);

    updateFromHsl({ h: Math.round(h), s: Math.round(s), l: color.hsl.l });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateRandomColor = () => {
    const hex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    updateFromHex(hex);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      updateFromHex(value);
    }
  };

  const getContrastColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return "#ffffff";
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  return (
    <div className="space-y-4">
      {/* Color Preview */}
      <div
        className="h-32 rounded-xl relative overflow-hidden shadow-lg"
        style={{ backgroundColor: color.hex }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-2xl font-bold font-mono"
            style={{ color: getContrastColor(color.hex) }}
          >
            {color.hex.toUpperCase()}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={generateRandomColor}
            className="p-2 rounded-lg bg-white/20 backdrop-blur-sm active:scale-95 transition-transform"
          >
            <Shuffle className="w-4 h-4" style={{ color: getContrastColor(color.hex) }} />
          </button>
        </div>
      </div>

      {/* Color Input */}
      <div className="bg-card rounded-lg p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md border border-border"
              style={{ backgroundColor: color.hex }}
            />
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="pl-10 font-mono"
              placeholder="#000000"
            />
          </div>
          <input
            type="color"
            value={color.hex}
            onChange={(e) => updateFromHex(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
          />
        </div>
      </div>

      {/* Color Wheel */}
      <div className="bg-card rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Color Wheel</span>
        </div>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="cursor-crosshair rounded-full"
            onMouseDown={(e) => {
              setIsDragging(true);
              handleCanvasInteraction(e);
            }}
            onMouseMove={(e) => isDragging && handleCanvasInteraction(e)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={(e) => {
              setIsDragging(true);
              handleCanvasInteraction(e);
            }}
            onTouchMove={(e) => isDragging && handleCanvasInteraction(e)}
            onTouchEnd={() => setIsDragging(false)}
          />
        </div>
        {/* Lightness Slider */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Lightness</span>
            <span>{color.hsl.l}%</span>
          </div>
          <Slider
            value={[color.hsl.l]}
            min={0}
            max={100}
            step={1}
            onValueChange={([l]) => updateFromHsl({ ...color.hsl, l })}
            className="w-full"
          />
        </div>
      </div>

      {/* Format Tabs */}
      <Tabs defaultValue="formats" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="formats">Formats</TabsTrigger>
          <TabsTrigger value="harmonies">Harmonies</TabsTrigger>
        </TabsList>

        <TabsContent value="formats" className="space-y-2 mt-4">
          {/* HEX */}
          <div className="bg-card rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">HEX</span>
              <p className="font-mono text-foreground">{color.hex.toUpperCase()}</p>
            </div>
            <button
              onClick={() => copyToClipboard(color.hex.toUpperCase(), "hex")}
              className="p-2 rounded-lg bg-muted active:scale-95 transition-transform"
            >
              {copied === "hex" ? (
                <Check className="w-4 h-4 text-accent" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* RGB */}
          <div className="bg-card rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">RGB</span>
              <p className="font-mono text-foreground">
                rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, "rgb")}
              className="p-2 rounded-lg bg-muted active:scale-95 transition-transform"
            >
              {copied === "rgb" ? (
                <Check className="w-4 h-4 text-accent" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* HSL */}
          <div className="bg-card rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">HSL</span>
              <p className="font-mono text-foreground">
                hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, "hsl")}
              className="p-2 rounded-lg bg-muted active:scale-95 transition-transform"
            >
              {copied === "hsl" ? (
                <Check className="w-4 h-4 text-accent" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* HSV/HSB */}
          <div className="bg-card rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">HSV/HSB</span>
              <p className="font-mono text-foreground">
                hsv({color.hsv.h}, {color.hsv.s}%, {color.hsv.v}%)
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(`hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`, "hsv")}
              className="p-2 rounded-lg bg-muted active:scale-95 transition-transform"
            >
              {copied === "hsv" ? (
                <Check className="w-4 h-4 text-accent" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* CMYK */}
          <div className="bg-card rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">CMYK</span>
              <p className="font-mono text-foreground">
                cmyk({color.cmyk.c}%, {color.cmyk.m}%, {color.cmyk.y}%, {color.cmyk.k}%)
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`,
                  "cmyk"
                )
              }
              className="p-2 rounded-lg bg-muted active:scale-95 transition-transform"
            >
              {copied === "cmyk" ? (
                <Check className="w-4 h-4 text-accent" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </TabsContent>

        <TabsContent value="harmonies" className="mt-4">
          <div className="bg-card rounded-lg p-4 space-y-4">
            {/* Complementary */}
            <div>
              <span className="text-xs text-muted-foreground mb-2 block">Complementary</span>
              <div className="flex gap-2">
                <div
                  className="flex-1 h-12 rounded-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex, "comp-main")}
                >
                  {copied === "comp-main" && <Check className="w-4 h-4" style={{ color: getContrastColor(color.hex) }} />}
                </div>
                <div
                  className="flex-1 h-12 rounded-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: harmonies[0] }}
                  onClick={() => copyToClipboard(harmonies[0], "comp")}
                >
                  {copied === "comp" && <Check className="w-4 h-4" style={{ color: getContrastColor(harmonies[0]) }} />}
                </div>
              </div>
            </div>

            {/* Triadic */}
            <div>
              <span className="text-xs text-muted-foreground mb-2 block">Triadic</span>
              <div className="flex gap-2">
                <div
                  className="flex-1 h-12 rounded-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex, "tri-main")}
                >
                  {copied === "tri-main" && <Check className="w-4 h-4" style={{ color: getContrastColor(color.hex) }} />}
                </div>
                <div
                  className="flex-1 h-12 rounded-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: harmonies[1] }}
                  onClick={() => copyToClipboard(harmonies[1], "tri1")}
                >
                  {copied === "tri1" && <Check className="w-4 h-4" style={{ color: getContrastColor(harmonies[1]) }} />}
                </div>
                <div
                  className="flex-1 h-12 rounded-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: harmonies[2] }}
                  onClick={() => copyToClipboard(harmonies[2], "tri2")}
                >
                  {copied === "tri2" && <Check className="w-4 h-4" style={{ color: getContrastColor(harmonies[2]) }} />}
                </div>
              </div>
            </div>

            {/* Analogous */}
            <div>
              <span className="text-xs text-muted-foreground mb-2 block">Analogous</span>
              <div className="flex gap-2">
                <div
                  className="flex-1 h-12 rounded-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: harmonies[4] }}
                  onClick={() => copyToClipboard(harmonies[4], "ana1")}
                >
                  {copied === "ana1" && <Check className="w-4 h-4" style={{ color: getContrastColor(harmonies[4]) }} />}
                </div>
                <div
                  className="flex-1 h-12 rounded-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex, "ana-main")}
                >
                  {copied === "ana-main" && <Check className="w-4 h-4" style={{ color: getContrastColor(color.hex) }} />}
                </div>
                <div
                  className="flex-1 h-12 rounded-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: harmonies[3] }}
                  onClick={() => copyToClipboard(harmonies[3], "ana2")}
                >
                  {copied === "ana2" && <Check className="w-4 h-4" style={{ color: getContrastColor(harmonies[3]) }} />}
                </div>
              </div>
            </div>

            {/* Split Complementary */}
            <div>
              <span className="text-xs text-muted-foreground mb-2 block">Split Complementary</span>
              <div className="flex gap-2">
                <div
                  className="flex-1 h-12 rounded-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex, "split-main")}
                >
                  {copied === "split-main" && <Check className="w-4 h-4" style={{ color: getContrastColor(color.hex) }} />}
                </div>
                <div
                  className="flex-1 h-12 rounded-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: harmonies[5] }}
                  onClick={() => copyToClipboard(harmonies[5], "split1")}
                >
                  {copied === "split1" && <Check className="w-4 h-4" style={{ color: getContrastColor(harmonies[5]) }} />}
                </div>
                <div
                  className="flex-1 h-12 rounded-lg cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: harmonies[6] }}
                  onClick={() => copyToClipboard(harmonies[6], "split2")}
                >
                  {copied === "split2" && <Check className="w-4 h-4" style={{ color: getContrastColor(harmonies[6]) }} />}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
