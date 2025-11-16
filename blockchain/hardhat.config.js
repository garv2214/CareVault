require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AMOY_RPC_URL = process.env.AMOY_RPC_URL; // Example: https://polygon-amoy.infura.io/v3/YOUR_KEY

if (!PRIVATE_KEY) {
  console.warn("⚠️ WARNING: PRIVATE_KEY is missing in .env file!");
}

module.exports = {
  solidity: "0.8.24",

  networks: {
    hardhat: {},

    amoy: {
      url: AMOY_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },

    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },

  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY
    }
  }
};
