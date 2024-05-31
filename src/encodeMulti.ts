import { Interface } from '@ethersproject/abi'
import { hexDataLength } from '@ethersproject/bytes'
import { pack } from '@ethersproject/solidity'

import { MetaTransaction, OperationType } from './types'

export const MULTI_SEND_ABI = ['function multiSend(bytes memory transactions)']

const MULTISEND_141 = '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526'
const MULTISEND_CALLONLY_141 = '0x9641d764fc13c8B624c04430C7356C1C7C8102e2'

/// Encodes the transaction as packed bytes of:
/// - `operation` as a `uint8` with `0` for a `call` or `1` for a `delegatecall` (=> 1 byte),
/// - `to` as an `address` (=> 20 bytes),
/// - `value` as a `uint256` (=> 32 bytes),
/// -  length of `data` as a `uint256` (=> 32 bytes),
/// - `data` as `bytes`.
const encodePacked = (tx: MetaTransaction) =>
  pack(
    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
    [
      tx.operation || OperationType.Call,
      tx.to,
      tx.value,
      hexDataLength(tx.data),
      tx.data,
    ]
  )

const remove0x = (hexString: string) => hexString.substr(2)

// Encodes a batch of module transactions into a single multiSend module transaction.
// A module transaction is an object with fields corresponding to a Gnosis Safe's (i.e., Zodiac IAvatar's) `execTransactionFromModule` method parameters.
export const encodeMulti = (
  transactions: readonly MetaTransaction[],
  multiSendContractAddress: string = transactions.some(
    (t) => t.operation === OperationType.DelegateCall
  )
    ? MULTISEND_141
    : MULTISEND_CALLONLY_141
): MetaTransaction => {
  const transactionsEncoded =
    '0x' + transactions.map(encodePacked).map(remove0x).join('')

  const multiSendContract = new Interface(MULTI_SEND_ABI)
  const data = multiSendContract.encodeFunctionData('multiSend', [
    transactionsEncoded,
  ])

  return {
    operation: OperationType.DelegateCall,
    to: multiSendContractAddress,
    value: '0x00',
    data,
  }
}
