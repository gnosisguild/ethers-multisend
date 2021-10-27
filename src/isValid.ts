import { getAddress } from '@ethersproject/address'

import { encodeSingle } from './encodeSingle'
import { TransactionInput } from './types'

export const isValid = (transactionInput: TransactionInput): boolean => {
  try {
    getAddress(transactionInput.to)
    encodeSingle(transactionInput)
    return true
  } catch (e) {
    return false
  }
}
