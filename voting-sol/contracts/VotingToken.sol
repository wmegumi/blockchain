// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VotingToken
 * @dev ERC20 Token representing voting rights in an election
 * @notice This token represents the right to vote in the specified election
 * @custom:legal This token does not represent any financial value and is solely for voting rights
 */
contract VotingToken is ERC20, Ownable, ReentrancyGuard {
    address public votingContract;
    address public voterRegistrationContract;
    bool public transfersAllowed;
    
    // Legal declarations for token usage
    string public constant LEGAL_DISCLAIMER = "This token represents voting rights only and holds no financial value";
    string public constant TERMS_OF_USE = "By using this token, you agree to abide by the election rules defined in the Voting contract";
    string public constant REGULATORY_COMPLIANCE = "This token is designed to comply with digital voting regulations";
    
    // Events for audit trail
    event TokenIssued(address indexed voter, uint256 amount, string nationalId);
    event TokenBurned(address indexed voter, uint256 amount, uint256 candidateId);
    
    /**
     * @dev Constructor creates a new voting token with 0 initial supply
     * @param name Name of the token
     * @param symbol Symbol of the token
     */
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol) 
        Ownable(msg.sender) 
    {
        transfersAllowed = false;
    }
    
    /**
     * @dev Set the voting contract address - can only be called by owner
     * @param _votingContract Address of the Voting contract
     */
    function setVotingContract(address _votingContract) external onlyOwner {
        votingContract = _votingContract;
    }
    
    /**
     * @dev Set the voter registration contract address - can only be called by owner
     * @param _voterRegistrationContract Address of the VoterRegistration contract
     */
    function setVoterRegistrationContract(address _voterRegistrationContract) external onlyOwner {
        voterRegistrationContract = _voterRegistrationContract;
    }
    
    /**
     * @dev Toggle whether token transfers are allowed - for increased security
     * @param _allowed Whether transfers should be allowed
     */
    function setTransfersAllowed(bool _allowed) external onlyOwner {
        transfersAllowed = _allowed;
    }
    
    /**
     * @dev Issue voting tokens to a registered voter
     * @param _voter Address of the voter
     * @param _nationalId National ID of the voter (for audit purposes)
     */
    function issueVotingToken(address _voter, string memory _nationalId) external nonReentrant {
        require(msg.sender == voterRegistrationContract, "Only voter registration contract can issue tokens");
        
        // Each voter gets exactly 1 token (1 vote)
        _mint(_voter, 1 * 10**decimals());
        
        emit TokenIssued(_voter, 1 * 10**decimals(), _nationalId);
    }
    
    /**
     * @dev Burn tokens when vote is cast
     * @param _voter Address of the voter
     * @param _candidateId ID of the candidate voted for
     */
    function burnVotingToken(address _voter, uint256 _candidateId) external nonReentrant {
        require(msg.sender == votingContract, "Only voting contract can burn tokens");
        
        // Burn exactly 1 token (1 vote)
        _burn(_voter, 1 * 10**decimals());
        
        emit TokenBurned(_voter, 1 * 10**decimals(), _candidateId);
    }
    
    /**
     * @dev Override the transfer function to enforce restrictions
     */
    function _update(address from, address to, uint256 amount) internal override {
        if (from != address(0) && to != address(0)) { // Not minting or burning
            require(transfersAllowed, "Token transfers are currently disabled");
            require(from == msg.sender, "Only token holder can transfer");
        }
        super._update(from, to, amount);
    }
    
    /**
     * @dev Get the legal terms of the token
     * @return Legal terms and conditions as a string
     */
    function getLegalTerms() public pure returns (string memory) {
        return string(abi.encodePacked(
            LEGAL_DISCLAIMER, "; ", 
            TERMS_OF_USE, "; ", 
            REGULATORY_COMPLIANCE
        ));
    }
    function balanceOf(address account) public view override returns (uint256) {
    return super.balanceOf(account);

    // return _balances[account];
}
}