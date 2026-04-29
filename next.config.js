/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["flagcdn.com"],
  },
  allowedDevOrigins: ["192.168.3.51"],
};

module.exports = nextConfig;
