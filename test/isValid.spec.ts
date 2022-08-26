import { expect } from 'chai'

import { createTransaction, isValid, TransactionType } from '../src'

describe('isValid', () => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  it('should return true only if the encoding works', () => {
    const tx = {
      ...createTransaction(TransactionType.transferFunds),
      to: ZERO_ADDRESS,
    }
    expect(isValid(tx)).to.equal(false)
    expect(isValid({ ...tx, amount: '1' })).to.equal(true)
  })

  it('should return true only if the `to` field is a valid address', () => {
    const txWithEmptyTo = {
      ...createTransaction(TransactionType.raw),
      data: '0x00',
    }
    expect(isValid(txWithEmptyTo)).to.equal(false)
    expect(
      isValid({
        ...txWithEmptyTo,
        to: '0x123',
      })
    ).to.equal(false)
    expect(
      isValid({
        ...txWithEmptyTo,
        to: ZERO_ADDRESS,
      })
    ).to.equal(true)
  })
})
