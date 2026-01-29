import { Link } from "react-router-dom";
import { Tool } from "@/lib/tools-data";
import { useState } from "react";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const isAvailable = tool.status === "available";
  const [isPressed, setIsPressed] = useState(false);
  
  const content = (
    <div 
      className="flex flex-col items-center text-center py-3 px-1 relative"
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {/* New Badge */}
      {tool.isNew && (
        <div className="absolute -top-0.5 -right-0.5 z-10">
          <span className="bg-accent text-accent-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide shadow-sm">
            New
          </span>
        </div>
      )}
      
      {/* Icon Container */}
      <div 
        className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-2.5 transition-all duration-200 ${
          isAvailable 
            ? `bg-gradient-to-br from-primary/15 to-primary/5 shadow-sm ${isPressed ? "scale-90" : ""}` 
            : "bg-muted/30"
        }`}
        style={{
          transform: isPressed && isAvailable ? "scale(0.92)" : "scale(1)",
          transition: "transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Glow effect for available tools */}
        {isAvailable && (
          <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-md opacity-50" />
        )}
        
        <tool.icon 
          className={`relative w-8 h-8 transition-all duration-200 ${
            isAvailable 
              ? "text-primary drop-shadow-sm" 
              : "text-muted-foreground/30"
          }`}
          strokeWidth={isAvailable ? 1.8 : 1.5}
        />
      </div>
      
      {/* Name */}
      <span className={`text-[11px] font-medium leading-tight line-clamp-2 transition-colors ${
        isAvailable ? "text-foreground" : "text-muted-foreground/40"
      }`}>
        {tool.name}
      </span>
    </div>
  );

  if (isAvailable) {
    return (
      <Link 
        to={`/tool/${tool.id}`} 
        className="block select-none"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="select-none grayscale">
      {content}
    </div>
  );
}
