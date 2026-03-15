/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // 타입 에러가 있어도 배포 진행
  },
  eslint: {
    ignoreDuringBuilds: true, // 문법 에러가 있어도 배포 진행
  },
};

export default nextConfig;