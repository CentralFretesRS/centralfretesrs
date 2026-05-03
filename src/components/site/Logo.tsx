import logoUrl from "@/assets/logo-central-fretes.png";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <img
      src={logoUrl}
      alt="Central Fretes RS"
      style={{ height: size * 1.3, width: "auto" }}
      className="object-contain"
    />
  );
}
