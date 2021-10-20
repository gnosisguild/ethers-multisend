import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers, waffle } from 'hardhat'

import { encodeSingle, TransactionType } from '../src'
import { TestAvatar, TestNft, TestToken } from '../typechain'

describe('encodeSingle', () => {
  const [sender, recipient] = waffle.provider.getWallets()
  let testAvatarContract: TestAvatar
  let testToken: TestToken
  let testNft: TestNft

  before(async () => {
    // deploy contracts
    const TestAvatarContract = await ethers.getContractFactory('TestAvatar')
    testAvatarContract = await TestAvatarContract.deploy()

    const TestToken = await ethers.getContractFactory('TestToken')
    testToken = await TestToken.deploy(18)

    const TestNft = await ethers.getContractFactory('TestNft')
    testNft = await TestNft.deploy()

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
      amount: BigNumber.from(10).pow(18).toString(),
      id: '',
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
      amount: BigNumber.from(10).pow(18).toString(),
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

  //   it('should encode contract function calls', () => {})
  //   it('should use default values for unnamed function parameters', () => {})
  //   it('should encode raw transactions', () => {})
})
