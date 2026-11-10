/** @type {import('next').NextConfig} */
const buildRemotePatterns = () => {
  const patterns = [
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
  ];

  const envUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (envUrl) {
    try {
      const parsed = new URL(envUrl);
      const protocol = parsed.protocol.replace(":", "");
      if (protocol === "http" || protocol === "https") {
        const exists = patterns.some(
          (p) =>
            p.protocol === protocol &&
            p.hostname === parsed.hostname &&
            p.port === parsed.port
        );
        if (!exists) {
          patterns.push({
            protocol,
            hostname: parsed.hostname,
            port: parsed.port || "",
            pathname: "/**",
          });
        }
      }
    } catch {
      // Ignore invalid NEXT_PUBLIC_SERVER_URL during config evaluation
    }
  }

  return patterns;
};

const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: buildRemotePatterns(),
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
