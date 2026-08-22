import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [{ pathname: "/images/**" }],
    qualities: [68, 70, 72, 74],
  },
  outputFileTracingIncludes: {
    "/api/member/guide/pdf": [
      "./output/pdf/twigthetics-lean-athletic-physique-guide-v3-abe-seth.pdf",
    ],
  },
};

export default nextConfig;
