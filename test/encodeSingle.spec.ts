import { FormatTypes } from '@ethersproject/abi'
import { hexZeroPad } from '@ethersproject/bytes'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers, waffle } from 'hardhat'

import { encodeSingle, TransactionType } from '../src'
import { InputsLogger, TestAvatar, TestNft, TestToken } from '../typechain'

describe('encodeSingle', () => {
  const [sender, recipient] = waffle.provider.getWallets()
  let testAvatarContract: TestAvatar
  let testToken: TestToken
  let testNft: TestNft
  let inputsLogger: InputsLogger

  before(async () => {
    // deploy contracts
    const TestAvatarContract = await ethers.getContractFactory('TestAvatar')
    testAvatarContract = await TestAvatarContract.deploy()

    const TestTokenContract = await ethers.getContractFactory('TestToken')
    testToken = await TestTokenContract.deploy(18)

    const TestNftContract = await ethers.getContractFactory('TestNft')
    testNft = await TestNftContract.deploy()

    const InputsLoggerContract = await ethers.getContractFactory('InputsLogger')
    inputsLogger = await InputsLoggerContract.deploy()

    // fund avatar with 100 ETH, 100 TestTokens, and TestNft #123
    await sender.sendTransaction({
      value: BigNumber.from(10).pow(18).mul(100),
      to: testAvatarContract.address,
    })
    await testToken.mint(
      testAvatarContract.address,
      BigNumber.from(10).pow(18).mul(100)
    )
    await testNft.mint(testAvatarContract.address, 123)
  })

  it('should encode ETH transfers', async () => {
    const tx = encodeSingle({
      type: TransactionType.transferFunds,
      token: null,
      to: recipient.address,
      amount: '1',
      id: '',
      decimals: 18,
    })
    const exec = () =>
      testAvatarContract.execTransactionFromModule(
        tx.to,
        tx.value,
        tx.data,
        tx.operation || 0
      )

    await expect(exec).to.changeEtherBalance(
      recipient,
      BigNumber.from(10).pow(18)
    )
  })

  it('should encode ERC20 transfers', async () => {
    const tx = encodeSingle({
      type: TransactionType.transferFunds,
      token: testToken.address,
      to: recipient.address,
      amount: '1',
      id: '',
      decimals: 18,
    })

    const exec = () =>
      testAvatarContract.execTransactionFromModule(
        tx.to,
        tx.value,
        tx.data,
        tx.operation || 0
      )

    await expect(exec).to.changeTokenBalance(
      testToken,
      recipient,
      BigNumber.from(10).pow(18)
    )
  })

  it('should encode ERC721 transfers', async () => {
    const tx = encodeSingle({
      type: TransactionType.transferCollectible,
      address: testNft.address,
      from: testAvatarContract.address,
      to: recipient.address,
      tokenId: '123',
      id: '',
    })

    await testAvatarContract.execTransactionFromModule(
      tx.to,
      tx.value,
      tx.data,
      tx.operation || 0
    )

    expect(await testNft.ownerOf('123')).to.equal(recipient.address)
  })

  it('should encode contract function calls', async () => {
    const tx = encodeSingle({
      type: TransactionType.callContract,
      to: inputsLogger.address,
      abi: inputsLogger.interface.format(FormatTypes.json) as string,
      value: '',
      functionSignature:
        'logInputs(string,address[2],int256[][],(bytes8,bool))',
      inputValues: [
        'test',
        [testToken.address, testNft.address],
        [
          ['1', '2'],
          ['3', '4'],
        ],
        { bytesMember: hexZeroPad('0x00', 8), boolMember: true },
      ],
      id: '',
    })

    const result = testAvatarContract.execTransactionFromModule(
      tx.to,
      tx.value,
      tx.data,
      tx.operation || 0
    )

    await expect(result).to.emit(inputsLogger, 'InputsLogged')
  })

  it('should use default values if no input value is provided as well as for unnamed function parameters', async () => {
    const tx = encodeSingle({
      type: TransactionType.callContract,
      to: inputsLogger.address,
      abi: inputsLogger.interface.format(FormatTypes.json) as string,
      value: '',
      functionSignature: 'logInputs(string,address[2])',
      inputValues: [],
      id: '',
    })

    const result = testAvatarContract.execTransactionFromModule(
      tx.to,
      tx.value,
      tx.data,
      tx.operation || 0
    )

    await expect(result).to.emit(inputsLogger, 'InputsLogged')
  })

  it('should encode raw transactions', async () => {
    const tx = encodeSingle({
      type: TransactionType.raw,
      to: testToken.address,
      value: '',
      data: testToken.interface.encodeFunctionData('transfer', [
        recipient.address,
        BigNumber.from(10).pow(18),
      ]),
      id: '',
    })

    const exec = () =>
      testAvatarContract.execTransactionFromModule(
        tx.to,
        tx.value,
        tx.data,
        tx.operation || 0
      )

    await expect(exec).to.changeTokenBalance(
      testToken,
      recipient,
      BigNumber.from(10).pow(18)
    )
  })

  it('should encode value in hex', () => {
    expect(
      encodeSingle({
        type: TransactionType.raw,
        to: testToken.address,
        value: '',
        data: '0x00',
        id: '',
      }).value
    ).to.equal('0x00')
  })
})
