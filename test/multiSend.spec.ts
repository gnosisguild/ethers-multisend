// import { expect } from 'chai'
// import { BigNumber } from 'ethers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers, waffle } from 'hardhat'

import { encodeMultiSend, MultiSender } from '../src/multiSend'
import { MultiSend, TestAvatar } from '../typechain'

// const setUpTestToken = deployments.createFixture(async () => {
//   const Token = await ethers.getContractFactory('TestToken')

//   const testToken = await Token.deploy(18)
//   const tokenOne = await Token.deploy(6)
//   const tokenTwo = await Token.deploy(12)

//   const tokensOrdered = [tokenOne.address, tokenTwo.address].sort(
//     (a, b) => Number(a) - Number(b)
//   )
//   await testToken.mint(user.address, DesignatedTokenBalance)
//   return {
//     tokenOne,
//     tokenTwo,
//     Token,
//     designatedToken,
//     tokensOrdered,
//   }
// })

describe('multiSend', () => {
  const [sender, firstRecipient, secondRecipient] = waffle.provider.getWallets()
  let testAvatarContract: TestAvatar
  let multiSendContract: MultiSend

  before(async () => {
    // deploy contracts
    const TestAvatarContract = await ethers.getContractFactory('TestAvatar')
    testAvatarContract = await TestAvatarContract.deploy()

    const MultiSendContract = await ethers.getContractFactory('MultiSend')
    multiSendContract = await MultiSendContract.deploy()

    // fund avatar with 1000 ETH
    await sender.sendTransaction({
      value: BigNumber.from(10).pow(18).mul(100),
      to: testAvatarContract.address,
    })
  })

  // it('should transfer ETH to multiple accounts', async () => {
  //   const moduleTx = encodeMultiSend(
  //     [
  //       {
  //         to: firstRecipient.address,
  //         value: BigNumber.from(10).pow(18),
  //       },
  //       {
  //         to: secondRecipient.address,
  //         value: BigNumber.from(10).pow(18).mul(2),
  //       },
  //     ],
  //     multiSendContract.address
  //   )

  //   const exec = async () =>
  //     await testAvatarContract.execTransactionFromModule(
  //       moduleTx.to,
  //       moduleTx.value,
  //       moduleTx.data,
  //       moduleTx.operation,
  //       { from: sender.address }
  //     )

  //   await expect(exec).to.changeEtherBalances(
  //     [firstRecipient, secondRecipient],
  //     [BigNumber.from(10).pow(18), BigNumber.from(10).pow(18).mul(2)]
  //   )
  // })

  it.only('should transfer ETH to multiple accounts (MultiSender)', async () => {
    const multiSender = new MultiSender(
      testAvatarContract.address,
      multiSendContract.address,
      sender
    )
    const exec = async () => {
      const res = await multiSender.multiSend([
        {
          to: firstRecipient.address,
          value: BigNumber.from(10).pow(18),
        },
        {
          to: secondRecipient.address,
          value: BigNumber.from(10).pow(18).mul(2),
        },
      ])
      console.log(res)
      return res
    }

    await expect(exec).to.changeEtherBalances(
      [firstRecipient, secondRecipient],
      [BigNumber.from(10).pow(18), BigNumber.from(10).pow(18).mul(2)]
    )
  })

  it('should transfer ERC20 tokens to multiple accounts')
  it('should do multiple arbitrary calls')
  it('should allow to do delegate calls')
})
