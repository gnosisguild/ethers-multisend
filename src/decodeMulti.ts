import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'

import { MULTI_SEND_ABI } from './encodeMulti'
import { MetaTransaction } from './types'

const unpack = (packed: string, startIndex: number) => {
  // read operation from first 8 bits (= 2 hex digits)
  const operation = parseInt(packed.substring(startIndex, startIndex + 2), 16)
  // the next 40 characters are the to address
  const to = getAddress(
    `0x${packed.substring(startIndex + 2, startIndex + 42)}`
  )
  // then comes the uint256 value (= 64 hex digits)
  const value = BigNumber.from(
    `0x${packed.substring(startIndex + 42, startIndex + 106)}`
  ).toString()

  // and the uint256 data length (= 64 hex digits)
  const hexDataLength = parseInt(
    packed.substring(startIndex + 106, startIndex + 170),
    16
  )
  const endIndex = startIndex + 170 + hexDataLength * 2 // * 2 because each hex item is represented with 2 digits
  const data = `0x${packed.substring(startIndex + 170, endIndex)}`
  return {
    operation,
    to,
    value,
    data,
    endIndex,
  }
}

export const decodeMulti = (data: string): MetaTransaction[] => {
  const multiSendContract = new Interface(MULTI_SEND_ABI)
  const tx = multiSendContract.parseTransaction({ data })
  const [transactionsEncoded] = tx.args
  const result = []

  let startIndex = 2 // skip over 0x
  while (startIndex < transactionsEncoded.length) {
    const { endIndex, ...tx } = unpack(transactionsEncoded, startIndex)
    result.push(tx)
    startIndex = endIndex
  }
  return result
}
