// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AuditRegistry
 * @dev Avalanche Fuji On-Chain Integrity Registry for BlockGuard AI Security Audits.
 * Principle: NEVER store source code or raw reports on chain.
 * Only immutable cryptographic hashes (sourceHash & reportHash) and verification metadata are recorded.
 */
contract AuditRegistry {
    // Reentrancy guard state
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    struct AuditRecord {
        bytes32 sourceHash;
        bytes32 reportHash;
        address auditor;
        uint64 timestamp;
        bool exists;
    }

    // Mapping from unique audit ID to Audit Record
    mapping(bytes32 => AuditRecord) private _audits;

    // Total registered audits counter
    uint256 public totalAudits;

    // Events
    event AuditRegistered(
        bytes32 indexed auditId,
        bytes32 indexed sourceHash,
        bytes32 indexed reportHash,
        address auditor,
        uint256 timestamp
    );

    error AlreadyRegistered(bytes32 auditId);
    error InvalidAuditId();
    error InvalidHash();
    error ReentrancyGuardReentrantCall();

    modifier nonReentrant() {
        if (_status == _ENTERED) revert ReentrancyGuardReentrantCall();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @notice Register an audit proof on Avalanche Fuji
     * @param auditId Unique identifier for the audit (UUID or Keccak256 ID)
     * @param sourceHash SHA256/Keccak256 hash of the normalized Solidity source code
     * @param reportHash SHA256/Keccak256 hash of the canonical JSON audit report
     */
    function registerAudit(
        bytes32 auditId,
        bytes32 sourceHash,
        bytes32 reportHash
    ) external nonReentrant {
        if (auditId == bytes32(0)) revert InvalidAuditId();
        if (sourceHash == bytes32(0) || reportHash == bytes32(0)) revert InvalidHash();
        if (_audits[auditId].exists) revert AlreadyRegistered(auditId);

        _audits[auditId] = AuditRecord({
            sourceHash: sourceHash,
            reportHash: reportHash,
            auditor: msg.sender,
            timestamp: uint64(block.timestamp),
            exists: true
        });

        totalAudits++;

        emit AuditRegistered(
            auditId,
            sourceHash,
            reportHash,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Verify whether a report hash matches the on-chain registered record
     * @param auditId The unique audit identifier
     * @param reportHash The hash of the report to verify
     * @return isValid True if registered and matches reportHash exactly
     * @return timestamp The on-chain registration timestamp (0 if not found)
     */
    function verifyAudit(
        bytes32 auditId,
        bytes32 reportHash
    ) external view returns (bool isValid, uint256 timestamp) {
        AuditRecord memory record = _audits[auditId];
        if (!record.exists) {
            return (false, 0);
        }
        return (record.reportHash == reportHash, uint256(record.timestamp));
    }

    /**
     * @notice Retrieve full audit metadata
     * @param auditId The unique audit identifier
     */
    function getAudit(
        bytes32 auditId
    )
        external
        view
        returns (
            bytes32 sourceHash,
            bytes32 reportHash,
            address auditor,
            uint256 timestamp,
            bool exists
        )
    {
        AuditRecord memory record = _audits[auditId];
        return (
            record.sourceHash,
            record.reportHash,
            record.auditor,
            uint256(record.timestamp),
            record.exists
        );
    }
}
