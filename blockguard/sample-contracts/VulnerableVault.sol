// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VulnerableVault
 * @dev Intentionally flawed contract demonstrating 5 classic security vulnerabilities:
 * 1. Reentrancy in withdraw()
 * 2. Missing Access Control in setWithdrawalFee()
 * 3. tx.origin Phishing in transferOwnership()
 * 4. Unsafe External Call in distributeBonus()
 * 5. Arithmetic precision loss (division before multiplication) in calculateReward()
 */
contract VulnerableVault {
    address public owner;
    mapping(address => uint256) public balances;
    uint256 public withdrawalFee = 10; // 1%
    uint256 public totalPool = 100000 ether;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit must be > 0");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    // 1. VULNERABILITY: Reentrancy (State update happens AFTER external call)
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Flaw: Call external recipient before updating state
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        balances[msg.sender] -= amount;
        emit Withdrawn(msg.sender, amount);
    }

    // 2. VULNERABILITY: Missing Access Control (Anyone can change fees)
    function setWithdrawalFee(uint256 newFee) public {
        // Flaw: Missing onlyOwner modifier
        withdrawalFee = newFee;
    }

    // 3. VULNERABILITY: tx.origin Phishing authentication
    function transferOwnership(address newOwner) public {
        // Flaw: Using tx.origin allows malicious intermediate contracts to drain or seize ownership
        require(tx.origin == owner, "Caller is not the owner");
        owner = newOwner;
        emit OwnershipTransferred(msg.sender, newOwner);
    }

    // 4. VULNERABILITY: Unsafe External Call (Silent failure)
    function distributeBonus(address recipient, uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        // Flaw: Return value of low-level call is ignored
        recipient.call{value: amount}("");
    }

    // 5. VULNERABILITY: Arithmetic & Logic Issue (Division before multiplication)
    function calculateReward(uint256 amount, uint256 rate, uint256 pool) public pure returns (uint256) {
        // Flaw: Division before multiplication causes precision loss / truncation to 0
        return (amount / pool) * rate;
    }
}
