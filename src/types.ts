export type ValueType =
  | string
  | boolean
  | Array<ValueType>
  | { [key: string]: ValueType }

export enum TransactionType {
  transferFunds = 'transferFunds',
  transferCollectible = 'transferCollectible',
  callContract = 'callContract',
  raw = 'raw',
}

export interface CallContractTransactionInput {
  type: TransactionType.callContract
  id: string // not relevant for encoding the final transaction
  to: string // contract address
  value: string // amount of wei to send
  abi: string // ABI as JSON string
  functionSignature: string
  inputValues: { [key: string]: ValueType }
}

export interface TransferFundsTransactionInput {
  type: TransactionType.transferFunds
  id: string // not relevant for encoding the final transaction
  token: string | null // ERC20 token contract address, `null` for ETH
  to: string // address of recipient
  amount: string
}

export interface TransferCollectibleTransactionInput {
  type: TransactionType.transferCollectible
  id: string // not relevant for encoding the final transaction
  address: string // ERC721 contract address
  tokenId: string // ID of the NFT
  to: string // address of recipient
  from: string // address of sender
}

export interface RawTransactionInput {
  type: TransactionType.raw
  id: string // not relevant for encoding the final transaction
  to: string // target address
  value: string // amount of wei to send
  data: string // ABI encoded data
}

export type TransactionInput =
  | CallContractTransactionInput
  | TransferFundsTransactionInput
  | TransferCollectibleTransactionInput
  | RawTransactionInput

export enum OperationType {
  Call = 0,
  DelegateCall = 1,
}

export interface MetaTransaction {
  readonly to: string
  readonly value: string
  readonly data: string
  readonly operation?: OperationType
}
