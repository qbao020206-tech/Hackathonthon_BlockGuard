export const VULNERABLE_VAULT_CODE = `// SPDX-License-Identifier: MIT
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
}`;

export const SECURE_VAULT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SecureVault
 * @dev Hardened smart contract remediating all 5 vulnerabilities:
 * 1. ReentrancyGuard + Checks-Effects-Interactions in withdraw()
 * 2. Proper Access Control (onlyOwner) in setWithdrawalFee()
 * 3. msg.sender authentication instead of tx.origin in transferOwnership()
 * 4. Checked return value in distributeBonus()
 * 5. Safe multiplication before division in calculateReward()
 */
contract SecureVault {
    address public owner;
    mapping(address => uint256) public balances;
    uint256 public withdrawalFee = 10;
    uint256 public totalPool = 100000 ether;

    // Mutex lock for reentrancy protection
    bool private _locked;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event WithdrawalFeeUpdated(uint256 oldFee, uint256 newFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "AccessControl: caller is not the owner");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit must be > 0");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    // 1. REMEDIATED: Checks-Effects-Interactions + nonReentrant modifier
    function withdraw(uint256 amount) external nonReentrant {
        // 1. Checks
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // 2. Effects (Update state BEFORE external interaction)
        balances[msg.sender] -= amount;

        // 3. Interactions
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    // 2. REMEDIATED: Protected with onlyOwner modifier
    function setWithdrawalFee(uint256 newFee) external onlyOwner {
        require(newFee <= 50, "Fee cannot exceed 5%");
        uint256 oldFee = withdrawalFee;
        withdrawalFee = newFee;
        emit WithdrawalFeeUpdated(oldFee, newFee);
    }

    // 3. REMEDIATED: Secure msg.sender authentication
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    // 4. REMEDIATED: Return value checked and handled
    function distributeBonus(address recipient, uint256 amount) external onlyOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(address(this).balance >= amount, "Insufficient contract balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Bonus distribution failed");
    }

    // 5. REMEDIATED: Multiplication before division prevents zero-truncation
    function calculateReward(uint256 amount, uint256 rate, uint256 pool) public pure returns (uint256) {
        require(pool > 0, "Pool cannot be zero");
        return (amount * rate) / pool;
    }
}`;
