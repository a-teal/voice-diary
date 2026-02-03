import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export" 제거 - API 라우트 사용을 위해 서버 모드 필요
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
