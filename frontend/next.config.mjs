/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  output: 'export',
  devIndicators: {
    position: 'bottom-right',
  },
  serverExternalPackages: ['sharp']
};

export default nextConfig;
