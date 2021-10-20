# ethers-multisend

An npm package for crafting multi-send transaction from a Gnosis Safe, based on ethers.js.

## Features

- Easily encode the most common transaction types from JSON inputs:
  - ETH & ERC20 token transfers
  - NFT (collectibles) transfers
  - Contract function calls
  - Raw transactions
- Encode a batch of transactions into a single `multiSend` call to the [MultiSend contract](https://github.com/gnosis/safe-contracts/blob/main/contracts/libraries/MultiSend.sol).

## Installation

This module is distributed via npm. For adding it to your project, run:

```
npm install --save ethers-multisend
```

To install it using yarn, run:

```
yarn add react-multisend
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

## createTransaction

```ts
createTransaction(type: TransactionType, id?: string): TransactionInput
```

Creates an empty transaction input of the specified type.

## isValid

```ts
isValid(transactionInput: TransactionInput): boolean
```

Returns whether the provided transaction input can be encoded into a meta transaction without errors.

### Types

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

Find the full information about all TypeScript types here: [src/types.ts]
