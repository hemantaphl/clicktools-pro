import { useState, useEffect, useCallback, useRef } from "react";

interface UsePullToRefreshOptions {
  onRefresh?: () => Promise<void> | void;
  threshold?: number;
}

export function usePullToRefresh({ 
  onRefresh, 
  threshold = 80 
}: UsePullToRefreshOptions = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default: reload the page
        window.location.reload();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull if at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      
      // Only track downward pull when at top
      if (diff > 0 && window.scrollY === 0) {
        // Apply resistance to make it feel natural
        const resistance = 0.4;
        setPullDistance(Math.min(diff * resistance, threshold + 40));
        
        // Prevent default scroll when pulling
        if (diff > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current) return;
      
      if (pullDistance >= threshold && !isRefreshing) {
        handleRefresh();
      }
      
      setPullDistance(0);
      isPulling.current = false;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, threshold, isRefreshing, handleRefresh]);

  return {
    isRefreshing,
    pullDistance,
    shouldRefresh: pullDistance >= threshold
  };
}
