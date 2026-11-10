/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard/settings/:path*",
        destination: "/dashboard/profile",
        permanent: false,
      },
      {
        source: "/dashboard/settings",
        destination: "/dashboard/profile",
        permanent: false,
      },
      {
        source: "/dashboard/update-profile",
        destination: "/dashboard/profile",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
