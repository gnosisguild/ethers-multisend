import { FormatTypes } from '@ethersproject/abi'
import { hexZeroPad } from '@ethersproject/bytes'
import { InfuraProvider } from '@ethersproject/providers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'

import { decodeSingle, TransactionType } from '../src'

describe('decodeSingle', () => {
  const provider = new InfuraProvider(1, process.env.INFURA_KEY)

  it('should decode ETH transfers', async () => {
    const txInput = await decodeSingle(
      {
        operation: 0,
        to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        value: BigNumber.from(10).pow(18).toHexString(),
        data: '0x00',
      },
      provider
    )

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

    const txInput = await decodeSingle(
      {
        operation: 0,
        to: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        value: '0x00',
        data: ercTransferData,
      },
      provider
    )

    expect(txInput).to.deep.equal({
      type: TransactionType.transferFunds,
      id: '',
      to: '0xfF6D102f7A5b52B6A2b654a048b0bA650bE90c59',
      amount: '1.0',
      decimals: 18,
      token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    })
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

    const txInput = await decodeSingle(
      {
        operation: 0,
        to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
        value: '0',
        data: ercTransferData,
      },
      provider
    )

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
        [hexZeroPad('0x00', 8), true],
      ]
    )
    const abi = InputsLoggerContract.interface.format(
      FormatTypes.json
    ) as string

    const fetchAbi = async () => await abi

    const result = await decodeSingle(
      {
        to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
        value: '0',
        data,
      },
      provider,
      fetchAbi
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

  it('should return a raw transaction if the function sighash is not found in the ABI', async () => {
    const InputsLoggerContract = await ethers.getContractFactory('InputsLogger')
    const abi = InputsLoggerContract.interface.format(
      FormatTypes.json
    ) as string

    const fetchAbi = async () => await abi

    const data = await decodeSingle(
      {
        to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
        value: '0',
        data: '0x095ea7b3',
      },
      provider,
      fetchAbi
    )

    expect(data.type).to.equal('raw')
  })

  it('should return a raw transaction if no fetchAbi function is passed', async () => {
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
        [hexZeroPad('0x00', 8), true],
      ]
    )
    const result = await decodeSingle(
      {
        to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
        value: '0x00',
        data,
      },
      provider
    )
    expect(result).to.deep.equal({
      type: TransactionType.raw,
      id: '',
      to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
      data,
      value: '0',
    })
  })

  it('should use the provided id', async () => {
    const txInput = await decodeSingle(
      {
        operation: 0,
        to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        value: BigNumber.from(10).pow(18).toHexString(),
        data: '0x00',
      },
      provider,
      undefined,
      'myId'
    )
    expect(txInput.id).to.equal('myId')
  })

  it('should decode the value to decimal', async () => {
    const result = await decodeSingle(
      {
        to: '0x36F4BFC9f49Dc5D4b2d10c4a48a6b30128BD79bC',
        value: '0xFF',
        data: '0x012345678',
      },
      provider
    )
    expect(result).to.have.property('value', '255')
  })
})
