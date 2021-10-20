import { TransactionInput, TransactionType } from './types'

export const createTransaction = <T extends TransactionType>(
  type: T,
  id = ''
): Extract<TransactionInput, { type: T }> => {
  switch (type) {
    case TransactionType.callContract:
      return {
        type,
        id,
        to: '',
        value: '',
        abi: '',
        functionSignature: '',
        inputValues: {},
      } as Extract<TransactionInput, { type: T }>
    case TransactionType.transferFunds:
      return { type, id, token: '', to: '', amount: '' } as Extract<
        TransactionInput,
        { type: T }
      >
    case TransactionType.transferCollectible:
      return {
        type,
        id,
        address: '',
        tokenId: '',
        to: '',
        from: '',
      } as Extract<TransactionInput, { type: T }>
    case TransactionType.raw:
      return { type, id, to: '', value: '', data: '' } as Extract<
        TransactionInput,
        { type: T }
      >
  }

  throw new Error(`Invalid transaction type: ${type}`)
}
