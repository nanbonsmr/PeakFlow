import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeIndicatorProps {
  visible: boolean;
}

const SwipeIndicator = ({ visible }: SwipeIndicatorProps) => {
  if (!visible) return null;

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-30 lg:hidden pointer-events-none">
      {/* Gradient edge hint */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-24 bg-gradient-to-b from-transparent via-dashboard-accent/30 to-transparent rounded-r-full" />
      
      {/* Animated chevron indicator */}
      <div className="relative flex items-center">
        <div className="absolute left-0 flex items-center animate-pulse">
          <div className="w-6 h-12 bg-gradient-to-r from-dashboard-accent/10 to-transparent rounded-r-full flex items-center justify-start pl-0.5">
            <ChevronRight className="h-4 w-4 text-dashboard-accent/60 animate-bounce-horizontal" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeIndicator;