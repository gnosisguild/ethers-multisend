import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import dotenv from 'dotenv'

// Load environment variables.
dotenv.config()

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  paths: {
    sources: './test/contracts',
  },
  solidity: '0.8.4',
  // networks: {
  //   hardhat: {
  //     forking: {
  //       url: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
  //     },
  //   },
  // },
}
