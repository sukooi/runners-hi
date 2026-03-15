/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // 타입 에러가 있어도 무시
  },
  eslint: {
    ignoreDuringBuilds: true, // 문법 에ER가 있어도 무시
  },
};

export default nextConfig;