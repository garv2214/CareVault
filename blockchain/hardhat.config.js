require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AMOY_RPC_URL = process.env.AMOY_RPC_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;

// Build networks object conditionally
const networks = {
  hardhat: {},
  localhost: {
    url: "http://127.0.0.1:8545",
    chainId: 31337
  }
};

// Only add testnet networks if RPC URLs are provided
if (AMOY_RPC_URL && PRIVATE_KEY) {
  networks.amoy = {
    url: AMOY_RPC_URL,
    accounts: [PRIVATE_KEY]
  };
}

if (MUMBAI_RPC_URL && PRIVATE_KEY) {
  networks.mumbai = {
    url: MUMBAI_RPC_URL,
    accounts: [PRIVATE_KEY]
  };
}

// Add Sepolia if configured
if (process.env.SEPOLIA_RPC_URL && PRIVATE_KEY) {
  networks.sepolia = {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [PRIVATE_KEY]
  };
}

module.exports = {
  solidity: "0.8.24",
  networks: networks,
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY
    }
  }
};
