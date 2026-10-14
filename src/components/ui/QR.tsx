import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Cod QR (module negre pe alb, ca să se scaneze sigur cu orice cititor) */
export function QR({ value, size = 220 }: { value: string; size?: number }) {
  const [svg, setSvg] = useState<string>("");
  useEffect(() => {
    let alive = true;
    QRCode.toString(value, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0E0F12", light: "#FFFFFF" } }).then((s) => alive && setSvg(s));
    return () => {
      alive = false;
    };
  }, [value]);
  return (
    <div
      role="img"
      aria-label={`Cod QR: ${value}`}
      className="rounded-2xl bg-white p-2 [&>svg]:w-full [&>svg]:h-full"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
