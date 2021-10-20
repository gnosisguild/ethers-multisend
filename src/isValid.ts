import { encodeSingle } from './encodeSingle'
import { TransactionInput } from './types'

export const isValid = (transactionInput: TransactionInput): boolean => {
  try {
    encodeSingle(transactionInput)
    return true
  } catch (e) {
    return false
  }
}
