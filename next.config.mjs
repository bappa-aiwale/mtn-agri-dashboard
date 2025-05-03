/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: true,
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/objective",
        permanent: false, // or false for temporary redirect
      },
    ];
  },
};

export default nextConfig;
