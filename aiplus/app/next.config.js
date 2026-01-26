/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://192.168.0.0/16',
    ],
  },
};

module.exports = nextConfig;