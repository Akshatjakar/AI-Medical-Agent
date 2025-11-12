/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
