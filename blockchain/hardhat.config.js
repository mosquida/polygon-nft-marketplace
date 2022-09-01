require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    mumbai: {
      url: `https://rpc-mumbai.maticvigil.com/v1/${process.env.MATICVIGIL_PROJECT_ID}`,
      account: [process.env.MATIC_ACCOUNT_DEPLOYER_PRIV_KEY],
    },
    mainnet: {
      url: `https://rpc-mainnet.maticvigil.com/v1/${process.env.MATICVIGIL_PROJECT_ID}`,
      account: [process.env.MATIC_ACCOUNT_DEPLOYER_PRIV_KEY],
    },
  },
};
