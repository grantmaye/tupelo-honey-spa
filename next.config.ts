import type { NextConfig } from "next";

const squarePaymentsCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://web.squarecdn.com",
  "style-src 'self' 'unsafe-inline' https://web.squarecdn.com",
  "font-src 'self' data: https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
  "img-src 'self' data: blob: https:",
  "frame-src https://web.squarecdn.com https://*.squarecdn.com",
  "connect-src 'self' https://web.squarecdn.com https://pci-connect.squareup.com https://o160250.ingest.sentry.io",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tupelohoneyspa.com", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "cms.tupelohoneyspa.com", pathname: "/wp-content/uploads/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/book/:path*",
        headers: [{ key: "Content-Security-Policy", value: squarePaymentsCsp }],
      },
      {
        source: "/gift-cards/:path*",
        headers: [{ key: "Content-Security-Policy", value: squarePaymentsCsp }],
      },
    ];
  },
};

export default nextConfig;
