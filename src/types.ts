import { BigNumberish } from 'ethers'

export enum Operation {
  CALL = 0,
  DELEGATE_CALL = 1,
}

export type ModuleTransaction = {
  /// `0` for `call` or `1` for `delegatecall`
  readonly operation: Operation
  /** the to address */
  readonly to: string
  readonly value: BigNumberish
  readonly data: string
}

// A more loose variant of ModuleTransaction that allows omitting some fields for which there are sensible defaults
export type ModuleTransactionInput = {
  /// `0` for `call` or `1` for `delegatecall`
  readonly operation?: Operation
  /** the to address */
  readonly to: string
  readonly value?: BigNumberish
  readonly data?: string
}
