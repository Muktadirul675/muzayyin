/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint:{
    ignoreDuringBuilds: true
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cutcbvajgtehcysiqrlf.supabase.co',
        pathname: '**', // Matches all paths
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google-hosted images
        pathname: '**', // Matches all paths
      },
      {
        protocol: "https",
        hostname: "mastoorbd.com",
        pathname: "*"
      }
    ],
  },
};

export default nextConfig;
