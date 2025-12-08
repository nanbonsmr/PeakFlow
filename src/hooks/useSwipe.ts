import { useEffect, useRef, useCallback } from "react";

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  edgeWidth?: number;
}

export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  edgeWidth = 30,
}: SwipeConfig) => {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isEdgeSwipe = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchEndX.current = null;
      
      // Check if swipe started from the left edge (for opening sidebar)
      isEdgeSwipe.current = touchStartX.current < edgeWidth;
    },
    [edgeWidth]
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current || !touchStartY.current) {
      return;
    }

    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = Math.abs(touchEndX.current - touchStartX.current);
    
    // Only trigger if horizontal swipe is greater than vertical
    if (Math.abs(deltaX) < deltaY) {
      return;
    }

    // Swipe right (open sidebar) - must start from edge
    if (deltaX > threshold && isEdgeSwipe.current) {
      onSwipeRight?.();
    }
    
    // Swipe left (close sidebar) - can start anywhere
    if (deltaX < -threshold) {
      onSwipeLeft?.();
    }

    // Reset values
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    isEdgeSwipe.current = false;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  useEffect(() => {
    const element = document;
    
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
};