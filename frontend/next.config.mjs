/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  devIndicators: {
    position: 'bottom-right',
  },
  serverExternalPackages: ['sharp']
};

export default nextConfig;
