/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/tv/:slug*',
        destination: '/movie/:slug*'
      }
    ];
  }
};

module.exports = nextConfig;
