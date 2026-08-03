"use client";

import { cn } from "@/lib/utils";

/**
 * Demi-jauge avec aiguille (inspiré MUI Gauge + GaugePointer).
 * Angles en degrés, 0° = haut, sens horaire positif comme d3/MUI.
 */
export function SemiGauge({
   value = 0,
   width = 100,
   height = 64,
   startAngle = -110,
   endAngle = 110,
   color,
   trackColor = "hsl(220 10% 28%)",
   className,
}) {
   const clamped = Math.max(0, Math.min(100, Number(value) || 0));
   const cx = width / 2;
   const cy = height * 0.92;
   const outerRadius = Math.min(width * 0.42, height * 0.85);
   const innerRadius = outerRadius * 0.62;

   const startRad = (startAngle * Math.PI) / 180;
   const endRad = (endAngle * Math.PI) / 180;
   const valueRad = startRad + (endRad - startRad) * (clamped / 100);

   const fill =
      color ||
      (clamped >= 90
         ? "#ef4444"
         : clamped >= 75
           ? "#f59e0b"
           : "#22c55e");

   function polar(angle, r) {
      return {
         x: cx + r * Math.sin(angle),
         y: cy - r * Math.cos(angle),
      };
   }

   function arcPath(a0, a1, rOuter, rInner) {
      const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
      const sweep = a1 > a0 ? 1 : 0;
      const p0 = polar(a0, rOuter);
      const p1 = polar(a1, rOuter);
      const p2 = polar(a1, rInner);
      const p3 = polar(a0, rInner);
      return [
         `M ${p0.x} ${p0.y}`,
         `A ${rOuter} ${rOuter} 0 ${large} ${sweep} ${p1.x} ${p1.y}`,
         `L ${p2.x} ${p2.y}`,
         `A ${rInner} ${rInner} 0 ${large} ${1 - sweep} ${p3.x} ${p3.y}`,
         "Z",
      ].join(" ");
   }

   const needleTip = polar(valueRad, outerRadius * 0.92);
   const needleBaseL = polar(valueRad - 0.12, outerRadius * 0.12);
   const needleBaseR = polar(valueRad + 0.12, outerRadius * 0.12);

   return (
      <svg
         width={width}
         height={height}
         viewBox={`0 0 ${width} ${height}`}
         className={cn("overflow-visible", className)}
         aria-hidden
      >
         <path
            d={arcPath(startRad, endRad, outerRadius, innerRadius)}
            fill={trackColor}
         />
         {clamped > 0.5 ? (
            <path
               d={arcPath(startRad, valueRad, outerRadius, innerRadius)}
               fill={fill}
            />
         ) : null}
         <path
            d={`M ${needleBaseL.x} ${needleBaseL.y} L ${needleTip.x} ${needleTip.y} L ${needleBaseR.x} ${needleBaseR.y} Z`}
            fill="hsl(0deg 0% 92%)"
         />
         <circle cx={cx} cy={cy} r={4} fill="hsl(0deg 0% 92%)" />
         <circle cx={cx} cy={cy} r={2} fill={fill} />
      </svg>
   );
}
