import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'

import { decodeMulti, encodeMulti } from '../src'

describe('decodeMulti', () => {
  it('should decode transactions with and without data', async () => {
    const TestToken = await ethers.getContractFactory('TestToken')
    const ercTransferData = TestToken.interface.encodeFunctionData('transfer', [
      '0xfF6D102f7A5b52B6A2b654a048b0bA650bE90c59',
      BigNumber.from(10).pow(18),
    ])
    const input = [
      {
        operation: 0,
        to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        value: BigNumber.from(10).pow(18).toString(),
        data: '0x',
      },
      {
        operation: 0,
        to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
        value: '0',
        data: ercTransferData,
      },
    ]
    const multiSendTx = encodeMulti(input)
    const result = decodeMulti(multiSendTx.data)
    expect(result).to.deep.equal(input)
  })
})
