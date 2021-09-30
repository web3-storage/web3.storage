const config = {
  globalSetup: require.resolve('./tests/global-setup'),
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://web3.storage',
    headless: process.env.NODE_ENV !== 'development',
  },
};
export default config;