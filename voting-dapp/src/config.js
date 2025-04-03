// src/config.js
import voterRegistrationAbi from "./abis/VoterRegistration.json";
import candidateRegistrationAbi from "./abis/CandidateRegistration.json";
import votingAbi from "./abis/Voting.json";
import electionResultsAbi from "./abis/ElectionResults.json";
import electionVerificationAbi from "./abis/ElectionVerification.json";

export const voterContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const candidateContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const votingContractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
export const resultsContractAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
export const verificationContractAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

export const VoterABI = voterRegistrationAbi.abi;
export const CandidateABI = candidateRegistrationAbi.abi;
export const VotingABI = votingAbi.abi;
export const ResultsABI = electionResultsAbi.abi;
export const VerificationABI = electionVerificationAbi.abi;

export const ADMIN_ADDRESS = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
