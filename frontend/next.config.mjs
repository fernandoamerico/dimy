/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  output: process.env.BUILD_FOR_GO === 'true' ? 'export' : undefined,
  trailingSlash: true, // Fix routing for Go http.FileServer
  devIndicators: {
    position: 'bottom-right',
  },
  serverExternalPackages: ['sharp'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
