import { useState, useRef } from "react";
import {
  Camera,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { haptic } from "@/lib/haptics";
import jsQR from "jsqr";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import { usePermissions } from "@/contexts/PermissionsContext";

type QrData = Record<string, any>;

export function QrScanner() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { permissions, requestStoragePermission } = usePermissions();

  // ✅ Helper: detect URL
  const isUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  // ✅ Native scan (FAST + RELIABLE)
  const startNativeScan = async () => {
    setError(null);
    setResult(null);
    setCopied(false);
    setIsScanning(true);
    haptic.light();

    try {
      // ✅ Request camera permission (native)
      const perm = await BarcodeScanner.requestPermissions();
      if (perm.camera !== "granted") {
        setError("Camera permission denied. Please enable it in settings.");
        haptic.error();
        setIsScanning(false);
        return;
      }

      // ✅ Open native scanner UI
      const scanResult = await BarcodeScanner.scan();

      if (scanResult.barcodes?.length > 0) {
        const value = scanResult.barcodes[0].rawValue;
        setResult(value);
        haptic.success();
      } else {
        setError("No QR code found. Try again.");
        haptic.error();
      }
    } catch (err) {
      console.log("Native scan error:", err);
      setError("Scanner failed. Please try again.");
      haptic.error();
    } finally {
      setIsScanning(false);
    }
  };

  // ✅ Upload QR Image & scan with jsQR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (permissions.storage === "denied" || permissions.storage === "not-asked") {
      await requestStoragePermission();
    }

    setError(null);
    setResult(null);
    setCopied(false);
    haptic.light();

    try {
      const img = new window.Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          setError("Unable to read image.");
          haptic.error();
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setResult(code.data);
          haptic.success();
        } else {
          setError("No QR code found in image. Try another.");
          haptic.error();
        }

        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        setError("Failed to load image file.");
        haptic.error();
      };

      img.src = URL.createObjectURL(file);
    } catch {
      setError("Failed to scan QR from image.");
      haptic.error();
    }

    // reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = async () => {
    if (permissions.storage === "denied" || permissions.storage === "not-asked") {
      await requestStoragePermission();
    }
    haptic.light();
    fileInputRef.current?.click();
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    haptic.medium();
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setCopied(false);
    haptic.light();
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Card */}
      <div className="bg-card rounded-xl overflow-hidden border border-border">
        {!result ? (
          <div className="p-5 space-y-4">
            {/* Top Illustration */}
            <div className="aspect-square max-h-64 mx-auto relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl flex items-center justify-center overflow-hidden">
              {/* Frame */}
              <div className="w-44 h-44 relative">
                <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-2xl" />
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-xl" />

                {/* Center QR blocks */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 grid grid-cols-3 gap-1 opacity-40">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${i === 4 ? "bg-transparent" : "bg-foreground"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* pulse */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-56 h-56 border border-primary/20 rounded-2xl animate-ping"
                  style={{ animationDuration: "2.2s" }}
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-foreground">Scan QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Use camera or upload an image
              </p>
            </div>

            {/* Buttons */}
            <button
              onClick={startNativeScan}
              disabled={isScanning}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold touch-feedback flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              <Camera className="w-5 h-5" />
              {isScanning ? "Opening Scanner..." : "Open Camera"}
            </button>

            <button
              onClick={handleUploadClick}
              className="w-full py-4 rounded-xl bg-surface text-foreground font-medium touch-feedback flex items-center justify-center gap-3 border border-border"
            >
              <ImageIcon className="w-5 h-5" />
              Upload from Gallery
            </button>
          </div>
        ) : null}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 rounded-xl p-4 flex items-start gap-3 animate-scale-in">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={reset}
              className="text-sm text-destructive font-medium mt-2 flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-card rounded-xl p-5 space-y-4 animate-scale-in border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">QR Code Found!</h4>
              <p className="text-xs text-muted-foreground">
                Tap to copy or open link
              </p>
            </div>
          </div>

          {/* Result box */}
          <div
            onClick={copyResult}
            className="p-4 rounded-xl bg-surface border border-border touch-feedback cursor-pointer"
          >
            <p className="text-sm text-foreground break-all font-mono">{result}</p>

            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-accent" />
                  <span className="text-accent">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Tap to copy</span>
                </>
              )}
            </div>
          </div>

          {/* Open Link */}
          {isUrl(result) && (
            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => haptic.medium()}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 touch-feedback"
            >
              <ExternalLink className="w-5 h-5" />
              Open Link
            </a>
          )}

          {/* Scan Again */}
          <button
            onClick={reset}
            className="w-full py-3.5 rounded-xl bg-surface text-foreground font-medium flex items-center justify-center gap-2 touch-feedback border border-border"
          >
            <RotateCcw className="w-5 h-5" />
            Scan Another
          </button>
        </div>
      )}
    </div>
  );
}
