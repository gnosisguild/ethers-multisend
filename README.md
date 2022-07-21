# ethers-multisend

[![Build Status](https://github.com/gnosis/ethers-multisend/actions/workflows/ci.yml/badge.svg)](https://github.com/gnosis/ethers-multisend/actions/workflows/ci.yml)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://github.com/gnosis/CODE_OF_CONDUCT)

An npm package for crafting multi-send transaction from a Gnosis Safe, based on ethers.js.

## Features

- Easily encode the most common types of transactions from JSON inputs:
  - ETH & ERC20 token transfers
  - NFT transfers
  - Contract function calls
  - Raw transactions
- Encode a batch of transactions into a single [multi-send call](https://github.com/gnosis/safe-contracts/blob/main/contracts/libraries/MultiSend.sol).

## What to do with the encoded transaction objects?

The encode functions produce JavaScript objects that can be used to actually execute the described transactions.
There are various ways to do that:

- from any enabled Safe/Zodiac module via `executeTransactionFromModule` (see: [Zodiac Module base contract](https://github.com/gnosis/zodiac/blob/master/contracts/core/Module.sol#L43))
- directly by calling the Safe's `execTransaction` function, providing the required owner signatures ([learn more](https://docs.gnosis.io/safe/docs/contracts_tx_execution/))
- collecting the required signatures on-chain, by calling `approveHash` upfront ([learn more](https://docs.gnosis.io/safe/docs/contracts_tx_execution/#on-chain-approvals))
- collecting the required signatures off-chain, by proposing the transaction using the [Safe Transaction Service](https://docs.gnosis.io/safe/docs/tutorial_tx_service_initiate_sign/)

Check out the [@gnosis.pm/safe-core-sdk](https://github.com/gnosis/safe-core-sdk/tree/main/packages/safe-core-sdk) package for interacting with the Gnosis Safe contracts and the [@gnosis.pm/safe-service-client](https://github.com/gnosis/safe-core-sdk/tree/main/packages/safe-service-client) package for using the Safe Transaction Service from JavaScript apps.

## Installation

This module is distributed via npm. For adding it to your project, run:

```
npm install --save ethers-multisend
```

To install it using yarn, run:

```
yarn add ethers-multisend
```

## API

## encodeSingle

```ts
encodeSingle(transactionInput: TransactionInput): MetaTransaction
```

Encodes a single transaction input and turns into an format that is ready for execution.

## encodeMulti

```ts
encodeMulti(metaTransaction: MetaTransaction[]): MetaTransaction
```

Batches a set of meta transactions into a single multi-send contract call.

## decodeSingle

```ts
decodeSingle(
  metaTransaction: MetaTransaction,
  provider: Provider,
  fetchAbi?: (address: string) => Promise<string | undefined>,
  id?: string
): Promise<TransactionInput>
```

Decodes a meta transaction and returns a transaction input object of one of the four supported types.
It needs an ethers provider instance to fetch decimals for ERC20 token transfers, and a function for fetching the ABI for a contract address.

## decodeMulti

```ts
decodeMulti(data: string): MetaTransaction[]
```

Given the data string of a multi-send transaction, returns an array of the included meta transactions.

## createTransaction

```ts
createTransaction(type: TransactionType, id?: string): TransactionInput
```

Creates an empty transaction input of the specified type.

## isValid

```ts
isValid(transactionInput: TransactionInput): boolean
```

Returns whether the provided transaction input can be encoded into a meta transaction without errors and has a valid `to` address.

## Types

The `TransactionInput` type captures the information for any of the four supported transaction types.

```ts
type TransactionInput =
  | CallContractTransactionInput
  | TransferFundsTransactionInput
  | TransferCollectibleTransactionInput
  | RawTransactionInput
```

The library's encoding functions return objects of the `MetaTransaction` type, which is a format with an ABI encoded `data` field so it is ready for execution.

```ts
interface MetaTransaction {
  readonly to: string
  readonly value: string
  readonly data: string
  readonly operation?: OperationType
}
```

Find the full information about all TypeScript types here: [src/types.ts](src/types.ts)
