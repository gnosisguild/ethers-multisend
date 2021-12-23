import { Interface } from '@ethersproject/abi'
import { hexDataLength } from '@ethersproject/bytes'
import { pack } from '@ethersproject/solidity'

import { MetaTransaction, OperationType } from './types'

export const MULTI_SEND_ABI = ['function multiSend(bytes memory transactions)']
const MULTI_SEND_CONTRACT_ADDRESS = '0x8D29bE29923b68abfDD21e541b9374737B49cdAD'

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
// For more information refer to https://docs.gnosis.io/safe/docs/contracts_details/#gnosis-safe-transactions.
export const encodeMulti = (
  transactions: readonly MetaTransaction[],
  multiSendContractAddress: string = MULTI_SEND_CONTRACT_ADDRESS
): MetaTransaction => {
  const transactionsEncoded =
    '0x' + transactions.map(encodePacked).map(remove0x).join('')

  const multiSendContract = new Interface(MULTI_SEND_ABI)
  const data = multiSendContract.encodeFunctionData('multiSend', [
    transactionsEncoded,
  ])

  return {
    operation: OperationType.DelegateCall,
    to: multiSendContractAddress || MULTI_SEND_CONTRACT_ADDRESS,
    value: '0',
    data,
  }
}
