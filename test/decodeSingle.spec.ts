import { FormatTypes } from '@ethersproject/abi'
import { hexZeroPad } from '@ethersproject/bytes'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'

import { decodeSingle, TransactionType } from '../src'

describe('decodeSingle', () => {
  it('should decode ETH transfers', async () => {
    const txInput = decodeSingle({
      operation: 0,
      to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      value: BigNumber.from(10).pow(18).toString(),
      data: '0x',
    })
    expect(txInput).to.deep.equal({
      type: TransactionType.transferFunds,
      id: '',
      to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      amount: '1.0',
      decimals: 18,
      token: null,
    })
  })

  it('should decode ERC20 token transfers', async () => {
    const TestToken = await ethers.getContractFactory('TestToken')
    const ercTransferData = TestToken.interface.encodeFunctionData('transfer', [
      '0xfF6D102f7A5b52B6A2b654a048b0bA650bE90c59',
      BigNumber.from(10).pow(18),
    ])

    const txInput = decodeSingle({
      operation: 0,
      to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
      value: '0',
      data: ercTransferData,
    })
    expect(txInput).to.deep.equal({
      type: TransactionType.transferFunds,
      id: '',
      to: '0xfF6D102f7A5b52B6A2b654a048b0bA650bE90c59',
      amount: '1.0',
      decimals: 18,
      token: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
    })
  })

  it('should use the provided ERC20 decimals', async () => {
    const TestToken = await ethers.getContractFactory('TestToken')
    const ercTransferData = TestToken.interface.encodeFunctionData('transfer', [
      '0xfF6D102f7A5b52B6A2b654a048b0bA650bE90c59',
      BigNumber.from(10).pow(12),
    ])

    const txInput = decodeSingle(
      {
        operation: 0,
        to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
        value: '0',
        data: ercTransferData,
      },
      '',
      { decimals: 12 }
    )
    expect(txInput).to.include({ amount: '1.0', decimals: 12 })
  })

  it('should decode ERC721 collectible transfers', async () => {
    const TestNft = await ethers.getContractFactory('TestNft')

    const ercTransferData = TestNft.interface.encodeFunctionData(
      'safeTransferFrom(address,address,uint256)',
      [
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        '0xfF6D102f7A5b52B6A2b654a048b0bA650bE90c59',
        '123',
      ]
    )

    const txInput = decodeSingle({
      operation: 0,
      to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
      value: '0',
      data: ercTransferData,
    })

    expect(txInput).to.deep.equal({
      type: TransactionType.transferCollectible,
      id: '',
      from: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      to: '0xfF6D102f7A5b52B6A2b654a048b0bA650bE90c59',
      tokenId: '123',
      address: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
    })
  })

  it('should decode contract calls', async () => {
    const InputsLoggerContract = await ethers.getContractFactory('InputsLogger')
    const data = InputsLoggerContract.interface.encodeFunctionData(
      'logInputs(string,address[2],int256[][],(bytes8,bool))',
      [
        'test',
        [
          '0xfF6D102f7A5b52B6A2b654a048b0bA650bE90c59',
          '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        ],
        [
          ['1', '2'],
          ['3', '4'],
        ],
        [hexZeroPad('0x0', 8), true],
      ]
    )
    const abi = InputsLoggerContract.interface.format(
      FormatTypes.json
    ) as string

    const result = decodeSingle(
      {
        to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
        value: '0',
        data,
      },
      '',
      { abi }
    )

    expect(result).to.deep.equal({
      type: 'callContract',
      id: '',
      to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
      abi,
      functionSignature:
        'logInputs(string,address[2],int256[][],(bytes8,bool))',
      inputValues: {
        stringParam: 'test',
        fixedSizeAddressArrayParam: [
          '0xfF6D102f7A5b52B6A2b654a048b0bA650bE90c59',
          '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        ],
        int2DArrayParam: [
          ['1', '2'],
          ['3', '4'],
        ],
        tupleParam: ['0x0000000000000000', true],
      },
      value: '0',
    })
  })

  it('should return a raw transaction if no ABI is passed', async () => {
    const InputsLoggerContract = await ethers.getContractFactory('InputsLogger')
    const data = InputsLoggerContract.interface.encodeFunctionData(
      'logInputs(string,address[2],int256[][],(bytes8,bool))',
      [
        'test',
        [
          '0xfF6D102f7A5b52B6A2b654a048b0bA650bE90c59',
          '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        ],
        [
          ['1', '2'],
          ['3', '4'],
        ],
        [hexZeroPad('0x0', 8), true],
      ]
    )
    const result = decodeSingle({
      to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
      value: '0',
      data,
    })
    expect(result).to.deep.equal({
      type: TransactionType.raw,
      id: '',
      to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
      data,
      value: '0',
    })
  })

  it('should use the provided id', () => {
    const txInput = decodeSingle(
      {
        operation: 0,
        to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        value: BigNumber.from(10).pow(18).toString(),
        data: '0x',
      },
      'myId'
    )
    expect(txInput.id).to.equal('myId')
  })
})
