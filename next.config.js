/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/pages/custom-orders',
        destination: '/custom-orders',
      },
      {
        source: '/pages/custom-inquiry',
        destination: '/custom-orders',
      },
      {
        source: '/collections',
        destination: '/collections/shop-all',
      },
      {
        source: '/pages/shop-all',
        destination: '/collections/shop-all',
      },
      {
        source: '/pages/engagement-rings',
        destination: '/custom-orders',
      },
      {
        source: '/bespoke',
        destination: '/custom-orders',
      },
    ];
  },
};

module.exports = nextConfig;
