import { AbiCoder, Interface, ParamType } from '@ethersproject/abi'
import { parseEther, parseUnits } from '@ethersproject/units'

import {
  erc20Interface,
  erc20TransferFragment,
  erc721Interface,
  erc721TransferFragment,
} from './interfaces'
import {
  CallContractTransactionInput,
  MetaTransaction,
  TransactionInput,
  TransactionType,
  TransferCollectibleTransactionInput,
  TransferFundsTransactionInput,
} from './types'

const encodeErc20Transfer = (tx: TransferFundsTransactionInput) =>
  erc20Interface.encodeFunctionData(erc20TransferFragment, [
    tx.to,
    parseUnits(tx.amount, tx.decimals),
  ])

const encodeErc721Transfer = (tx: TransferCollectibleTransactionInput) =>
  erc721Interface.encodeFunctionData(erc721TransferFragment, [
    tx.from,
    tx.to,
    tx.tokenId,
  ])

const abiCoder = new AbiCoder()
const defaultValue = (paramType: ParamType) =>
  abiCoder._getCoder(paramType).defaultValue()

const encodeFunctionCall = (tx: CallContractTransactionInput) => {
  const iface = new Interface(tx.abi)
  const values = iface.functions[tx.functionSignature].inputs.map(
    (input) => tx.inputValues[input.name] || defaultValue(input)
  )
  return iface.encodeFunctionData(tx.functionSignature, values)
}

export const encodeSingle = (tx: TransactionInput): MetaTransaction => {
  switch (tx.type) {
    case TransactionType.transferFunds:
      if (!tx.token) {
        // transfer ETH
        return {
          to: tx.to,
          value: parseEther(tx.amount).toString(),
          data: '0x',
        }
      } else {
        // transfer ERC20 token
        return {
          to: tx.token,
          value: '0x0',
          data: encodeErc20Transfer(tx),
        }
      }
    case TransactionType.transferCollectible:
      return {
        to: tx.address,
        value: '0x0',
        data: encodeErc721Transfer(tx),
      }
    case TransactionType.callContract:
      return {
        to: tx.to,
        value: tx.value || '0x0',
        data: encodeFunctionCall(tx),
      }
    case TransactionType.raw:
      return {
        to: tx.to,
        value: tx.value || '0x0',
        data: tx.data || '0x',
      }
  }
}
