import { ChevronsRight } from "lucide-react";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center bg-gradient-brand rounded-md shadow-glow"
        style={{ width: size, height: size, transform: "rotate(45deg)" }}
      >
        <ChevronsRight
          className="text-white"
          style={{ width: size * 0.55, height: size * 0.55, transform: "rotate(-45deg)" }}
          strokeWidth={3}
        />
      </div>
      <div className="leading-none">
        <div className="font-display text-lg font-bold tracking-tight">
          CENTRAL FRETES
        </div>
        <div className="font-display text-sm text-gradient-brand font-bold tracking-widest">
          RS
        </div>
      </div>
    </div>
  );
}
