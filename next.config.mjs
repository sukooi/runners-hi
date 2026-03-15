import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // 개발 모드에서는 PWA를 끕니다.
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // 아래 설정을 추가하여 터보팩(Turbopack) 대신 웹팩을 쓰도록 유도합니다.
  webpack: (config) => {
    return config;
  },
};

export default withPWA(nextConfig);