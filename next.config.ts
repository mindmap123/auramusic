import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Optimize for Vercel
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
