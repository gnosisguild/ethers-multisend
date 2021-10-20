import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers, waffle } from 'hardhat'

import { encodeMulti, OperationType } from '../src'
import { MultiSend, TestAvatar, TestToken } from '../typechain'

describe('encodeMulti', () => {
  const [sender, firstRecipient, secondRecipient] = waffle.provider.getWallets()
  let testAvatarContract: TestAvatar
  let multiSendContract: MultiSend
  let testToken: TestToken

  before(async () => {
    // deploy contracts
    const TestAvatarContract = await ethers.getContractFactory('TestAvatar')
    testAvatarContract = await TestAvatarContract.deploy()

    const MultiSendContract = await ethers.getContractFactory('MultiSend')
    multiSendContract = await MultiSendContract.deploy()

    const TestToken = await ethers.getContractFactory('TestToken')
    testToken = await TestToken.deploy(18)

    // fund avatar with 100 ETH and 100 TestTokens
    await sender.sendTransaction({
      value: BigNumber.from(10).pow(18).mul(100),
      to: testAvatarContract.address,
    })
    await testToken.mint(
      testAvatarContract.address,
      BigNumber.from(10).pow(18).mul(100)
    )
  })

  it('should encode multiple ETH transfer transactions', async () => {
    const multiSendTx = encodeMulti(
      [
        {
          to: firstRecipient.address,
          value: BigNumber.from(10).pow(18).toString(),
          data: '0x',
        },
        {
          to: secondRecipient.address,
          value: BigNumber.from(10).pow(18).mul(2).toString(),
          data: '0x',
        },
      ],
      multiSendContract.address
    )

    const exec = () =>
      testAvatarContract.execTransactionFromModule(
        multiSendTx.to,
        multiSendTx.value,
        multiSendTx.data,
        multiSendTx.operation || 0
      )

    await expect(exec).to.changeEtherBalances(
      [firstRecipient, secondRecipient],
      [BigNumber.from(10).pow(18), BigNumber.from(10).pow(18).mul(2)]
    )
  })

  it('should encode multiple ERC20 token transfers', async () => {
    const firstTransferData = testToken.interface.encodeFunctionData(
      'transfer',
      [firstRecipient.address, BigNumber.from(10).pow(18)]
    )
    const secondTransferData = testToken.interface.encodeFunctionData(
      'transfer',
      [secondRecipient.address, BigNumber.from(10).pow(18).mul(2)]
    )
    const multiSendTx = encodeMulti(
      [
        {
          to: testToken.address,
          data: firstTransferData,
          value: '0',
        },
        {
          to: testToken.address,
          data: secondTransferData,
          value: '0',
        },
      ],
      multiSendContract.address
    )

    const exec = () =>
      testAvatarContract.execTransactionFromModule(
        multiSendTx.to,
        multiSendTx.value,
        multiSendTx.data,
        multiSendTx.operation || 0
      )

    await expect(exec).to.changeTokenBalances(
      testToken,
      [firstRecipient, secondRecipient],
      [BigNumber.from(10).pow(18), BigNumber.from(10).pow(18).mul(2)]
    )
  })

  it('should encode delegate calls', async () => {
    // As an example for a delegatecall we just use the multiSend function
    const delegateCallTx = encodeMulti(
      [
        {
          to: firstRecipient.address,
          value: BigNumber.from(10).pow(18).toString(),
          data: '0x',
        },
      ],
      multiSendContract.address
    )
    expect(delegateCallTx).to.haveOwnProperty(
      'operation',
      OperationType.DelegateCall
    )

    // now we wrap the delegateCallTx multiSend transaction into another multiSend transaction
    const multiSendTx = encodeMulti(
      [
        delegateCallTx,
        {
          to: secondRecipient.address,
          value: BigNumber.from(10).pow(18).mul(2).toString(),
          data: '0x',
        },
      ],
      multiSendContract.address
    )

    const exec = () =>
      testAvatarContract.execTransactionFromModule(
        multiSendTx.to,
        multiSendTx.value,
        multiSendTx.data,
        multiSendTx.operation || 0
      )

    await expect(exec).to.changeEtherBalances(
      [firstRecipient, secondRecipient],
      [BigNumber.from(10).pow(18), BigNumber.from(10).pow(18).mul(2)]
    )
  })
})
