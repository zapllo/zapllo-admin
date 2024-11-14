import { CSSProperties, FC, ReactNode } from "react";

interface AnimatedShinyOverlayProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
}

const AnimatedShinyOverlay: FC<AnimatedShinyOverlayProps> = ({
  children,
  className,
  shimmerWidth = 100,
}) => {
  return (
    <div className="relative">
      <div
        style={
          {
            "--shimmer-width": `${shimmerWidth}px`,
          } as CSSProperties
        }
        className={`absolute z-20 inset-0 bg-no-repeat bg-[length:var(--shimmer-width)_100%] transition-[background-position_1s_cubic-bezier(.6,.6,0,1)_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmerPartner rounded-xl`}
      ></div>
      <div className={`relative ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default AnimatedShinyOverlay;
