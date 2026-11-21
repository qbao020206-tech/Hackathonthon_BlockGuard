import { ethers } from "ethers";

/**
 * Calculates deterministic Keccak256 hash formatted as bytes32 for on-chain compatibility
 */
export function calculateSourceHash(source: string): string {
  // Normalize line endings to avoid OS discrepancies
  const normalized = source.replace(/\r\n/g, "\n").trim();
  const bytes = ethers.toUtf8Bytes(normalized);
  return ethers.keccak256(bytes);
}

/**
 * Calculates deterministic report hash from canonical JSON
 */
export function calculateReportHash(reportSummary: {
  id: string;
  contractName: string;
  sourceHash: string;
  securityScore: number;
  findingsCount: number;
}): string {
  const canonicalString = JSON.stringify(reportSummary, Object.keys(reportSummary).sort());
  const bytes = ethers.toUtf8Bytes(canonicalString);
  return ethers.keccak256(bytes);
}
