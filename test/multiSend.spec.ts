import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers, waffle } from 'hardhat'
import { Operation } from '../src'

import { encodeMultiSend, MultiSender } from '../src/multiSend'
import { MultiSend, TestAvatar, TestToken } from '../typechain'

describe('multiSend', () => {
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

  describe('encodeMultiSend', () => {
    it('should return the parameters for a successful execTransactionFromModule calls', async () => {
      const moduleTx = encodeMultiSend(
        [
          {
            to: firstRecipient.address,
            value: BigNumber.from(10).pow(18),
          },
          {
            to: secondRecipient.address,
            value: BigNumber.from(10).pow(18).mul(2),
          },
        ],
        multiSendContract.address
      )

      const exec = () =>
        testAvatarContract.execTransactionFromModule(
          moduleTx.to,
          moduleTx.value,
          moduleTx.data,
          moduleTx.operation
        )

      await expect(exec).to.changeEtherBalances(
        [firstRecipient, secondRecipient],
        [BigNumber.from(10).pow(18), BigNumber.from(10).pow(18).mul(2)]
      )
    })
  })

  describe('MultiSender', () => {
    it('should transfer ETH to multiple accounts', async () => {
      const multiSender = new MultiSender(
        testAvatarContract.address,
        multiSendContract.address,
        sender
      )
      const exec = () =>
        multiSender.multiSend([
          {
            to: firstRecipient.address,
            value: BigNumber.from(10).pow(18),
          },
          {
            to: secondRecipient.address,
            value: BigNumber.from(10).pow(18).mul(2),
          },
        ])

      await expect(exec).to.changeEtherBalances(
        [firstRecipient, secondRecipient],
        [BigNumber.from(10).pow(18), BigNumber.from(10).pow(18).mul(2)]
      )
    })

    it('should transfer ERC20 tokens to multiple accounts', async () => {
      const multiSender = new MultiSender(
        testAvatarContract.address,
        multiSendContract.address,
        sender
      )

      const firstTransferData = testToken.interface.encodeFunctionData(
        'transfer',
        [firstRecipient.address, BigNumber.from(10).pow(18)]
      )
      const secondTransferData = testToken.interface.encodeFunctionData(
        'transfer',
        [secondRecipient.address, BigNumber.from(10).pow(18).mul(2)]
      )
      const exec = () =>
        multiSender.multiSend([
          {
            to: testToken.address,
            data: firstTransferData,
          },
          {
            to: testToken.address,
            data: secondTransferData,
          },
        ])

      await expect(exec).to.changeTokenBalances(
        testToken,
        [firstRecipient, secondRecipient],
        [BigNumber.from(10).pow(18), BigNumber.from(10).pow(18).mul(2)]
      )
    })

    it('should allow to do delegate calls', async () => {
      const multiSender = new MultiSender(
        testAvatarContract.address,
        multiSendContract.address,
        sender
      )

      // Do an extra multi-call wrapping to get an example delegatecall transaction
      const wrappedTx = encodeMultiSend(
        [
          {
            to: firstRecipient.address,
            value: BigNumber.from(10).pow(18),
          },
        ],
        multiSendContract.address
      )
      expect(wrappedTx).to.haveOwnProperty('operation', Operation.DELEGATE_CALL)

      const exec = () =>
        multiSender.multiSend([
          wrappedTx,
          {
            to: secondRecipient.address,
            value: BigNumber.from(10).pow(18).mul(2),
          },
        ])

      await expect(exec).to.changeEtherBalances(
        [firstRecipient, secondRecipient],
        [BigNumber.from(10).pow(18), BigNumber.from(10).pow(18).mul(2)]
      )
    })

    it('should not do a multiSend transaction when passing a single transaction but execute it directly', async () => {
      // We test this in a bit of a tricky way:
      // We pass a wrong contract address so the transaction will fail when it actually tries delegate to the MultiSend contract.
      const defunctMultiSender = new MultiSender(
        testAvatarContract.address,
        '0x0000000000000000000000000000000000000000',
        sender
      )

      // multiple transactions: delegation will fail -> no balance change
      const execMulti = () =>
        defunctMultiSender.multiSend([
          {
            to: firstRecipient.address,
            value: BigNumber.from(10).pow(18),
          },
          {
            to: secondRecipient.address,
            value: BigNumber.from(10).pow(18).mul(2),
          },
        ])
      await expect(execMulti).to.not.changeEtherBalance(
        firstRecipient,
        BigNumber.from(10).pow(18)
      )

      // single transactions: direct execution without delegation -> balance changes correctly
      const execSingle = () =>
        defunctMultiSender.multiSend([
          {
            to: firstRecipient.address,
            value: BigNumber.from(10).pow(18),
          },
        ])
      await expect(execSingle).to.changeEtherBalance(
        firstRecipient,
        BigNumber.from(10).pow(18)
      )
    })
  })
})
