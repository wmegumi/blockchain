import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ElectionSystem", (m) => {
  // 定义参数
  const electionName = m.getParameter("electionName", "General Election 2025");
  const tokenName = m.getParameter("tokenName", `${electionName} Token`);
  const tokenSymbol = m.getParameter("tokenSymbol", "VOTE");

  // 部署基础合约
  const voterRegistration = m.contract("VoterRegistration");
  const candidateRegistration = m.contract("CandidateRegistration");
  
  // 部署投票代币合约
  const votingToken = m.contract("VotingToken", [
    tokenName,
    tokenSymbol
  ]);

  // 部署投票合约
  const voting = m.contract("Voting", [
    voterRegistration,
    candidateRegistration,
    electionName
  ]);

  // 部署选举结果合约
  const electionResults = m.contract("ElectionResults", [
    voting,
    candidateRegistration,
    voterRegistration
  ]);

  // 部署验证合约
  const electionVerification = m.contract("ElectionVerification", [
    voting,
    electionResults,
    voterRegistration,
    candidateRegistration
  ]);



  // 设置合约之间的关联关系
  
  // 1. 设置投票合约的关联
  const setVotingToken = m.call(voting, "setVotingToken", [votingToken], {
    id: "setVotingToken"
  });
  
  const setVerificationContract = m.call(voting, "setVerificationContract", [electionVerification], {
    id: "setVerificationContract"
  });

  // 2. 设置选民注册合约的关联
  const setVoterRegistrationToken = m.call(voterRegistration, "setVotingToken", [votingToken], {
    id: "setVoterRegistrationToken"
  });

  // 3. 设置代币合约的关联 - 使用after属性确保顺序
  const setVotingContractInToken = m.call(votingToken, "setVotingContract", [voting], {
    id: "setVotingContractInToken",
    after: [setVotingToken, setVerificationContract]
  });

  const setVoterRegistrationContractInToken = m.call(votingToken, "setVoterRegistrationContract", [voterRegistration], {
    id: "setVoterRegistrationContractInToken",
    after: [setVoterRegistrationToken]
  });


  return {
    candidateRegistration,
    voterRegistration,
    votingToken,
    voting,
    electionResults,
    electionVerification,
  };
});