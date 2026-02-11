import { RefreshCw } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface PullToRefreshProps {
  onRefresh?: () => Promise<void> | void;
}

export function PullToRefresh({ onRefresh }: PullToRefreshProps) {
  const { isRefreshing, pullDistance, shouldRefresh } = usePullToRefresh({ 
    onRefresh,
    threshold: 80 
  });

  const showIndicator = pullDistance > 10 || isRefreshing;
  const opacity = Math.min(pullDistance / 60, 1);
  const scale = Math.min(0.5 + (pullDistance / 160), 1);
  const rotation = shouldRefresh || isRefreshing ? 180 : (pullDistance / 80) * 180;

  if (!showIndicator) return null;

  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{ 
        top: `calc(env(safe-area-inset-top, 0px) + ${Math.min(pullDistance, 100)}px)`,
        opacity,
        transform: `translateX(-50%) scale(${scale})`,
        transition: isRefreshing ? 'none' : 'top 0.1s ease-out'
      }}
    >
      <div className="bg-primary/10 backdrop-blur-sm rounded-full p-3 shadow-lg border border-primary/20">
        <RefreshCw 
          className={`h-5 w-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: isRefreshing ? 'none' : 'transform 0.1s ease-out'
          }}
        />
      </div>
    </div>
  );
}
