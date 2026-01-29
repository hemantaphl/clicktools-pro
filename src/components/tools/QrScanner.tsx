import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Image, Copy, Check, X, ExternalLink, AlertCircle, Flashlight, FlashlightOff, RotateCcw } from "lucide-react";
import { usePermissions } from "@/contexts/PermissionsContext";
import { haptic } from "@/lib/haptics";
import jsQR from "jsqr";

export function QrScanner() {
  const [result, setResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [torch, setTorch] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const { permissions, requestCameraPermission, requestStoragePermission } = usePermissions();

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setTorch(false);
  }, []);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      setResult(code.data);
      haptic.success();
      stopCamera();
      return;
    }

    animationRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  const startCamera = async () => {
    setError(null);
    setResult(null);
    haptic.light();
    
    if (permissions.camera === "denied") {
      const granted = await requestCameraPermission();
      if (!granted) {
        setError("Camera access denied. Please enable camera access in your device settings.");
        haptic.error();
        return;
      }
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setIsScanning(true);
        animationRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera access to scan QR codes.");
      haptic.error();
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    
    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
    
    if (capabilities?.torch) {
      const newTorchState = !torch;
      await track.applyConstraints({
        advanced: [{ torch: newTorchState } as MediaTrackConstraintSet]
      });
      setTorch(newTorchState);
      haptic.light();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (permissions.storage === "denied" || permissions.storage === "not-asked") {
      await requestStoragePermission();
    }

    setError(null);
    setResult(null);
    haptic.light();

    try {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        if (context) {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            setResult(code.data);
            haptic.success();
          } else {
            setError("No QR code found in the image. Please try another image.");
            haptic.error();
          }
        }
        URL.revokeObjectURL(img.src);
      };
      
      img.onerror = () => {
        setError("Failed to load the image file.");
        haptic.error();
      };
      
      img.src = URL.createObjectURL(file);
    } catch (err) {
      setError("Failed to read the image file.");
      haptic.error();
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = async () => {
    if (permissions.storage === "denied" || permissions.storage === "not-asked") {
      await requestStoragePermission();
    }
    haptic.light();
    fileInputRef.current?.click();
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      haptic.medium();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scanAgain = () => {
    setResult(null);
    setError(null);
    haptic.light();
  };

  const isUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-4">
      {/* Hidden canvas for QR processing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Scanner Card */}
      <div className="bg-card rounded-xl overflow-hidden">
        {!isScanning && !result ? (
          <div className="p-5 space-y-4">
            {/* Scanner illustration */}
            <div className="aspect-square max-h-64 mx-auto relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl flex items-center justify-center overflow-hidden">
              {/* Scanner frame illustration */}
              <div className="w-40 h-40 relative">
                <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-2xl" />
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                
                {/* QR icon in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 grid grid-cols-3 gap-1 opacity-40">
                    <div className="bg-foreground rounded-sm" />
                    <div className="bg-foreground rounded-sm" />
                    <div className="bg-foreground rounded-sm" />
                    <div className="bg-foreground rounded-sm" />
                    <div className="bg-transparent" />
                    <div className="bg-foreground rounded-sm" />
                    <div className="bg-foreground rounded-sm" />
                    <div className="bg-foreground rounded-sm" />
                    <div className="bg-foreground rounded-sm" />
                  </div>
                </div>
              </div>
              
              {/* Animated pulse */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border border-primary/20 rounded-2xl animate-ping" style={{ animationDuration: "2s" }} />
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-semibold text-foreground">Scan QR Code</h3>
              <p className="text-sm text-muted-foreground">Use camera or upload an image</p>
            </div>

            <button
              onClick={startCamera}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold touch-feedback flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
            >
              <Camera className="w-5 h-5" />
              Open Camera
            </button>

            <button
              onClick={handleUploadClick}
              className="w-full py-4 rounded-xl bg-surface text-foreground font-medium touch-feedback flex items-center justify-center gap-3 border border-border"
            >
              <Image className="w-5 h-5" />
              Upload from Gallery
            </button>
          </div>
        ) : isScanning ? (
          /* Camera View */
          <div className="relative aspect-[3/4] bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0">
              {/* Dark corners */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
              
              {/* Center cutout area */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Corner brackets */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 256">
                    {/* Top-left */}
                    <path d="M 8 48 L 8 8 L 48 8" fill="none" stroke="hsl(270, 70%, 60%)" strokeWidth="6" strokeLinecap="round" />
                    {/* Top-right */}
                    <path d="M 208 8 L 248 8 L 248 48" fill="none" stroke="hsl(270, 70%, 60%)" strokeWidth="6" strokeLinecap="round" />
                    {/* Bottom-left */}
                    <path d="M 8 208 L 8 248 L 48 248" fill="none" stroke="hsl(270, 70%, 60%)" strokeWidth="6" strokeLinecap="round" />
                    {/* Bottom-right */}
                    <path d="M 208 248 L 248 248 L 248 208" fill="none" stroke="hsl(270, 70%, 60%)" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                  
                  {/* Scanning line */}
                  <div 
                    className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-lg shadow-primary/50"
                    style={{ 
                      animation: "scanLine 2s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Top controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <button
                onClick={() => { stopCamera(); haptic.light(); }}
                className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center touch-feedback"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md">
                <span className="text-xs text-white font-medium">Scanning...</span>
              </div>
              
              <button
                onClick={toggleTorch}
                className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center touch-feedback"
              >
                {torch ? (
                  <Flashlight className="w-5 h-5 text-yellow-400" />
                ) : (
                  <FlashlightOff className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            
            {/* Bottom controls */}
            <div className="absolute bottom-8 left-0 right-0">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-white/90 font-medium text-center px-4">
                  Position QR code within the frame
                </p>
                <button
                  onClick={() => { handleUploadClick(); }}
                  className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center touch-feedback border-2 border-white/30"
                >
                  <Image className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
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
              onClick={scanAgain}
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
        <div className="bg-card rounded-xl p-5 space-y-4 animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">QR Code Found!</h4>
              <p className="text-xs text-muted-foreground">Tap to copy or open link</p>
            </div>
          </div>

          <div 
            onClick={copyResult}
            className="p-4 rounded-xl bg-surface border border-border touch-feedback cursor-pointer"
          >
            <p className="text-sm text-foreground break-all font-mono">
              {result}
            </p>
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

          <button
            onClick={scanAgain}
            className="w-full py-3.5 rounded-xl bg-surface text-foreground font-medium flex items-center justify-center gap-2 touch-feedback border border-border"
          >
            <RotateCcw className="w-5 h-5" />
            Scan Another
          </button>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0% { top: 16px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: calc(100% - 16px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
