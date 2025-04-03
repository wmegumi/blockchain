// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VotingToken.sol";

/**
 * @title ElectionFactory
 * @dev Contract for deploying all election-related contracts
 * @custom:legal This contract facilitates election creation in compliance with electoral laws
 */
contract ElectionFactory {
    address public electionCommission;
    
    // Structure to store election details
    struct ElectionSystem {
        string electionName;
        address voterRegistration;
        address candidateRegistration;
        address voting;
        address electionResults;
        address electionVerification;
        address votingToken;
        uint256 creationTime;
    }
    
    // Array to store all deployed elections
    ElectionSystem[] public deployedElections;
    
    // Events
    event ElectionSystemDeployed(
        string electionName,
        address voterRegistration,
        address candidateRegistration,
        address voting,
        address electionResults,
        address electionVerification,
        address votingToken
    );
    
    // Constructor...
    
    /**
     * @dev Register an election system that was deployed separately
     */
    function registerElectionSystem(
        string memory _electionName,
        address _voterRegistration,
        address _candidateRegistration,
        address _voting,
        address _electionResults,
        address _electionVerification,
        address _votingToken
    ) public {
        require(msg.sender == electionCommission, "Only election commission can register elections");
        
        // Store the election system details
        deployedElections.push(ElectionSystem({
            electionName: _electionName,
            voterRegistration: _voterRegistration,
            candidateRegistration: _candidateRegistration,
            voting: _voting,
            electionResults: _electionResults,
            electionVerification: _electionVerification,
            votingToken: _votingToken,
            creationTime: block.timestamp
        }));
        
        // Emit deployment event
        emit ElectionSystemDeployed(
            _electionName,
            _voterRegistration,
            _candidateRegistration,
            _voting,
            _electionResults,
            _electionVerification,
            _votingToken
        );
    }
    
        /**
     * @dev Get the number of registered elections
     * @return uint256 Number of registered elections
     */
    function getDeployedElectionsCount() public view returns (uint256) {
        return deployedElections.length;
    }
    
    /**
     * @dev Get a registered election system by index
     * @param _index Index of the election system
     * @return ElectionSystem The election system details
     */
    function getElectionSystem(uint256 _index) public view returns (ElectionSystem memory) {
        require(_index < deployedElections.length, "Index out of bounds");
        return deployedElections[_index];
    }
}