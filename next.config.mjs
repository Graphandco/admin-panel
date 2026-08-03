/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@react-pdf/renderer"],
  turbopack: {},
};

export default nextConfig;
