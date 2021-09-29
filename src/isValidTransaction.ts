import { isAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { isHexString } from '@ethersproject/bytes'

import { ModuleTransaction } from './types'

const canParseAsBigNumber = (value: string) => {
  try {
    BigNumber.from(value)
    return true
  } catch (e) {
    return false
  }
}

// export function isValidTransaction(transaction: ModuleTransaction) {
//   const addressValidOrEmpty = transaction.to === '' || isAddress(transaction.to)
//   return (
//     canParseAsBigNumber(transaction.value) &&
//     addressValidOrEmpty &&
//     (!transaction.data || isHexString(transaction.data)) &&
//     transaction.operation in ['0', '1'] &&
//     canParseAsBigNumber(transaction.nonce)
//   )
// }
