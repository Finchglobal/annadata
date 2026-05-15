import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export default function Logo({ size = 24, className = "", ...props }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 1288 1288" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path 
        d="M893.797 886.219C733.932 1029.81 497.27 1001.35 408.326 953.55C380.234 1008.71 357.268 1067.01 338.614 1124.69C331.305 1147.32 306.249 1158.85 284.349 1149.64C284.086 1149.53 283.823 1149.41 283.573 1149.32C263.46 1140.86 253.653 1117.99 261.396 1097.59C357.36 844.336 569.65 579.988 773.934 410.185C583.058 520.28 399.347 688.23 284.493 862.74C224.443 773.349 228.085 642.995 286.097 549.753C444.148 295.647 730.632 272.707 894.967 141.447C908.849 130.352 929.343 133.98 938.466 149.229C1053.06 340.751 1130.04 674.021 893.797 886.219Z" 
        fill="currentColor"
      />
    </svg>
  );
}
