const config = {
  globalSetup: require.resolve('./tests/global-setup'),
  use: {
    baseURL: 'https://web3.storage',
    // storageState: './tests/state.json',
    headless: false,
  },
};
export default config;