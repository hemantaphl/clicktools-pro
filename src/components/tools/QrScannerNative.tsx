import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import { useState } from "react";
import { haptic } from "@/lib/haptics";

export function QrScannerNative() {
  const [result, setResult] = useState<string | null>(null);

  const startScan = async () => {
    haptic.light();

    // ✅ Request permission
    const perm = await BarcodeScanner.requestPermissions();
    if (perm.camera !== "granted") {
      alert("Camera permission denied!");
      return;
    }

    // ✅ Start scanning
    const { barcodes } = await BarcodeScanner.scan();

    if (barcodes.length > 0) {
      setResult(barcodes[0].rawValue);
      haptic.success();
    } else {
      haptic.error();
      alert("No QR found!");
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={startScan}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold"
      >
        Open Native QR Scanner
      </button>

      {result && (
        <div className="p-4 bg-card rounded-xl border border-border">
          <h3 className="font-semibold mb-2">Result:</h3>
          <p className="text-sm break-all">{result}</p>
        </div>
      )}
    </div>
  );
}
