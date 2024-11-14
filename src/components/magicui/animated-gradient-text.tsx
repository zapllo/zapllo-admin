import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function AnimatedGradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group mt-32 relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl  px-4 py-1.5 md:text-3xl font-medium   ",
        className,
      )}
    >
     

      {children}
    </div>
  );
}
