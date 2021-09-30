import { BigNumberish } from '@ethersproject/bignumber'

export enum Operation {
  CALL = 0,
  DELEGATE_CALL = 1,
}

// Useful for specifying a single transaction to be batched with a multi-send
export type TransactionInput = {
  readonly operation?: Operation
  readonly to: string
  readonly value?: BigNumberish
  readonly data?: string
}

// Provides the parameters for a Zodiac Avatar's execTransactionFromModule function
export type ModuleTransaction = {
  readonly operation: Operation
  readonly to: string
  readonly value: BigNumberish
  readonly data: string
}
