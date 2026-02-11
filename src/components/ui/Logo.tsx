import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div
          className={cn(
            "rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center overflow-hidden",
            sizes[size]
          )}>
          <img src={logo} alt="ClickTools Logo" className="w-full h-full object-contain scale-100"/>
        </div>

      {showText && (
        <span className={cn("font-bold text-foreground", textSizes[size])}>
          ClickTools Pro
        </span>
      )}
    </div>
  );
}
