/** @type {import('next').NextConfig} */
const nextConfig = {
  // The detector is consumed as TypeScript source in this monorepo, so Next
  // must compile it with the app instead of treating it as a prebuilt package.
  transpilePackages: ['@scamshield/detector'],
  images: {
    remotePatterns: [],
  },
  webpack: (config) => {
    // NodeNext imports inside the detector use explicit `.js` extensions that
    // point at TypeScript sources. Teach webpack to resolve them to `.ts`.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    };
    return config;
  },
};

export default nextConfig;
