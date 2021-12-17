import { Interface } from '@ethersproject/abi'

export const erc20Interface = new Interface([
  'function transfer(address recipient, uint256 amount) public returns (bool)',
])
export const erc20TransferFragment = Object.keys(erc20Interface.functions)[0]

export const erc721Interface = new Interface([
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable',
])
export const erc721TransferFragment = Object.keys(erc721Interface.functions)[0]
