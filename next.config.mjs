/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: true,
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
