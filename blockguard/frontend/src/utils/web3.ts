import { ethers } from 'ethers';

export const FUJI_CHAIN_ID = 43113;
export const FUJI_CHAIN_ID_HEX = '0xa869';
export const FUJI_RPC_URL = (import.meta as any).env?.VITE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
export const SNOWTRACE_URL = 'https://testnet.snowtrace.io';
export const REGISTRY_CONTRACT_ADDRESS = (import.meta as any).env?.VITE_CONTRACT_ADDRESS || '0x5352613D4164b18E5094251785501C110d7C9246';

export const REGISTRY_ABI = [
  'function registerAudit(bytes32 auditId, bytes32 sourceHash, bytes32 reportHash) external',
  'function verifyAudit(bytes32 auditId, bytes32 reportHash) external view returns (bool isValid, uint256 timestamp)',
  'function getAudit(bytes32 auditId) external view returns (bytes32 sourceHash, bytes32 reportHash, address auditor, uint256 timestamp, bool exists)',
  'event AuditRegistered(bytes32 indexed auditId, bytes32 indexed sourceHash, bytes32 indexed reportHash, address auditor, uint256 timestamp)'
];

export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address || '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function truncateHash(hash: string): string {
  if (!hash || hash.length < 14) return hash || '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export async function connectMetaMask(): Promise<{ address: string; chainId: number }> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to interact with Avalanche Fuji.');
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  const network = await provider.getNetwork();

  return {
    address: accounts[0],
    chainId: Number(network.chainId)
  };
}

export async function switchToAvalancheFuji(): Promise<void> {
  if (!(window as any).ethereum) return;

  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: FUJI_CHAIN_ID_HEX }],
    });
  } catch (switchError: any) {
    // Error 4902: chain has not been added to MetaMask
    if (switchError.code === 4902) {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: FUJI_CHAIN_ID_HEX,
            chainName: 'Avalanche Fuji C-Chain',
            nativeCurrency: {
              name: 'Avalanche',
              symbol: 'AVAX',
              decimals: 18,
            },
            rpcUrls: [FUJI_RPC_URL],
            blockExplorerUrls: [SNOWTRACE_URL],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

export function formatBytes32(textOrHex: string): string {
  if (textOrHex.startsWith('0x') && textOrHex.length === 66) {
    return textOrHex;
  }
  return ethers.keccak256(ethers.toUtf8Bytes(textOrHex));
}
