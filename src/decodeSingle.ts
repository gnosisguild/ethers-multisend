import { BigNumber, formatFixed } from '@ethersproject/bignumber'
import { formatEther } from '@ethersproject/units'

import {
  erc20Interface,
  erc20TransferFragment,
  erc721Interface,
  erc721TransferFragment,
} from './interfaces'
import { MetaTransaction, TransactionInput, TransactionType } from './types'

export const decodeSingle = (
  transaction: MetaTransaction,
  id = ''
  // abi?: string
  // decimals?: number
): TransactionInput => {
  const { to, data, value } = transaction

  if (!data || data === '0x') {
    // ETH transfer
    return {
      type: TransactionType.transferFunds,
      id,
      to,
      amount: formatEther(value).toString(),
      decimals: 18,
      token: null,
    }
  }

  let erc20TransferData = null
  try {
    erc20TransferData = erc20Interface.decodeFunctionData(
      erc20TransferFragment,
      data
    )
  } catch (e) {
    // it's not an ERC20 transfer
  }

  if (erc20TransferData && BigNumber.from(value).eq(0)) {
    console.log(erc20TransferData)
    const decimals = 18 // TODO
    return {
      type: TransactionType.transferFunds,
      id,
      to: erc20TransferData.recipient,
      amount: formatFixed(erc20TransferData.amount, decimals),
      decimals,
      token: to,
    }
  }

  let erc721TransferData = null
  try {
    erc721TransferData = erc721Interface.decodeFunctionData(
      erc721TransferFragment,
      data
    )
  } catch (e) {
    // it's not an ERC721 transfer
  }

  if (erc721TransferData && BigNumber.from(value).eq(0)) {
    return {
      type: TransactionType.transferCollectible,
      id,
      from: erc721TransferData._from,
      to: erc721TransferData._to,
      tokenId: erc721TransferData._tokenId.toString(),
      address: to,
    }
  }

  // if(abi) {

  // }

  return {
    type: TransactionType.raw,
    id,
    to,
    value,
    data,
  }
}
