# ethers-multisend

An npm package for crafting multi-send transaction from a Gnosis Safe, based on ethers.js.

## Features

- Encode a batch of transactions into a single `multiSend` call to the [MultiSend contract](https://github.com/gnosis/safe-contracts/blob/main/contracts/libraries/MultiSend.sol).

## Notes and questions

- Shall we support contract deployment transactions (empty `to`, contract code in `data`)?
