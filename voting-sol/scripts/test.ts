import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("开始测试选举系统...");
  console.log("=".repeat(50));

  // 获取账户
  const [admin, voter1, voter2, voter3, auditor] = await ethers.getSigners();
  console.log("测试账户:");
  console.log(`- 选举委员会: ${await admin.getAddress()}`);
  console.log(`- 选民1: ${await voter1.getAddress()}`);
  console.log(`- 选民2: ${await voter2.getAddress()}`);
  console.log(`- 选民3: ${await voter3.getAddress()}`);
  console.log(`- 审计员: ${await auditor.getAddress()}`);
  console.log("-".repeat(50));

  // 1. 部署合约
  console.log("\n1. 部署选举系统合约...");

  // 部署候选人注册合约
  console.log("- 部署 CandidateRegistration 合约...");
  const CandidateRegistration = await ethers.getContractFactory("CandidateRegistration");
  const candidateRegistration = await CandidateRegistration.deploy();
  await candidateRegistration.deploymentTransaction()?.wait();
  const candidateRegistrationAddress = await candidateRegistration.getAddress();
  console.log(`  CandidateRegistration 地址: ${candidateRegistrationAddress}`);

  // 部署选民注册合约
  console.log("- 部署 VoterRegistration 合约...");
  const VoterRegistration = await ethers.getContractFactory("VoterRegistration");
  const voterRegistration = await VoterRegistration.deploy();
  await voterRegistration.deploymentTransaction()?.wait();
  const voterRegistrationAddress = await voterRegistration.getAddress();
  console.log(`  VoterRegistration 地址: ${voterRegistrationAddress}`);

  // 部署投票代币合约
  console.log("- 部署 VotingToken 合约...");
  const electionName = "测试选举2023";
  const VotingToken = await ethers.getContractFactory("VotingToken");
  const votingToken = await VotingToken.deploy(`${electionName} Token`, "VOTE");
  await votingToken.deploymentTransaction()?.wait();
  const votingTokenAddress = await votingToken.getAddress();
  console.log(`  VotingToken 地址: ${votingTokenAddress}`);

  // 部署投票合约
  console.log("- 部署 Voting 合约...");
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(
    voterRegistrationAddress,
    candidateRegistrationAddress,
    electionName
  );
  await voting.deploymentTransaction()?.wait();
  const votingAddress = await voting.getAddress();
  console.log(`  Voting 地址: ${votingAddress}`);

  // 部署选举结果合约
  console.log("- 部署 ElectionResults 合约...");
  const ElectionResults = await ethers.getContractFactory("ElectionResults");
  const electionResults = await ElectionResults.deploy(
    votingAddress,
    candidateRegistrationAddress,
    voterRegistrationAddress
  );
  await electionResults.deploymentTransaction()?.wait();
  const electionResultsAddress = await electionResults.getAddress();
  console.log(`  ElectionResults 地址: ${electionResultsAddress}`);

  // 部署选举验证合约
  console.log("- 部署 ElectionVerification 合约...");
  const ElectionVerification = await ethers.getContractFactory("ElectionVerification");
  const electionVerification = await ElectionVerification.deploy(
    votingAddress,
    electionResultsAddress,
    voterRegistrationAddress,
    candidateRegistrationAddress
  );
  await electionVerification.deploymentTransaction()?.wait();
  const electionVerificationAddress = await electionVerification.getAddress();
  console.log(`  ElectionVerification 地址: ${electionVerificationAddress}`);

  // 部署选举工厂合约
  console.log("- 部署 ElectionFactory 合约...");
  const ElectionFactory = await ethers.getContractFactory("ElectionFactory");
  const electionFactory = await ElectionFactory.deploy();
  await electionFactory.deploymentTransaction()?.wait();
  const electionFactoryAddress = await electionFactory.getAddress();
  console.log(`  ElectionFactory 地址: ${electionFactoryAddress}`);

  console.log("所有合约部署完成!\n");
  console.log("-".repeat(50));

  // 2. 设置合约之间的关系
  console.log("\n2. 设置合约之间的关系...");

  // 设置投票合约中的验证合约和代币合约
  console.log("- 设置 Voting 合约的关联...");
  await (await voting.setVotingToken(votingTokenAddress)).wait();
  console.log("  Voting 合约已设置 VotingToken");
  await (await voting.setVerificationContract(electionVerificationAddress)).wait();
  console.log("  Voting 合约已设置 ElectionVerification");

  // 设置选民注册合约中的代币合约
  console.log("- 设置 VoterRegistration 合约的关联...");
  await (await voterRegistration.setVotingToken(votingTokenAddress)).wait();
  console.log("  VoterRegistration 合约已设置 VotingToken");

  // 设置投票代币合约中的投票合约和选民注册合约
  console.log("- 设置 VotingToken 合约的关联...");
  await (await votingToken.setVotingContract(votingAddress)).wait();
  console.log("  VotingToken 合约已设置 Voting");
  await (await votingToken.setVoterRegistrationContract(voterRegistrationAddress)).wait();
  console.log("  VotingToken 合约已设置 VoterRegistration");

  console.log("所有合约关系设置完成!\n");
  console.log("-".repeat(50));

  // 3. 注册候选人
  console.log("\n3. 注册候选人...");
  
  // 注册第一个候选人
  await (await candidateRegistration.registerCandidate(
    "ID12345", "张三", "人民党", "促进经济发展，改善民生"
  )).wait();
  console.log(`- 候选人 1 已注册: 张三 (人民党)`);

  // 注册第二个候选人
  await (await candidateRegistration.registerCandidate(
    "ID67890", "李四", "进步党", "推进教育改革，提高医疗水平"
  )).wait();
  console.log(`- 候选人 2 已注册: 李四 (进步党)`);

  // 注册第三个候选人
  await (await candidateRegistration.registerCandidate(
    "ID24680", "王五", "联盟党", "保护环境，实现可持续发展"
  )).wait();
  console.log(`- 候选人 3 已注册: 王五 (联盟党)`);

  // 获取并显示所有候选人
  const totalCandidates = await candidateRegistration.getTotalCandidates();
  console.log(`共注册了 ${totalCandidates} 名候选人`);

  for (let i = 1; i <= Number(totalCandidates); i++) {
    const candidate = await candidateRegistration.getCandidate(i);
    console.log(`候选人 ${i}: ${candidate.name} (${candidate.party})`);
  }

  console.log("候选人注册完成!\n");
  console.log("-".repeat(50));

  // 4. 启动注册和投票阶段
  console.log("\n4. 启动选举阶段...");
  
  // 启动注册阶段
  await (await voting.startRegistration()).wait();
  console.log("- 选民注册阶段已启动");

  // 注册选民
  console.log("\n5. 注册选民...");
  
  // 注册第一个选民
  const voter1Address = await voter1.getAddress();
  await (await voterRegistration.registerVoter(
    voter1Address, "V123456", "赵六"
  )).wait();
  console.log(`- 选民 1 已注册: 赵六 (ID: V123456)`);

  // 注册第二个选民
  const voter2Address = await voter2.getAddress();
  await (await voterRegistration.registerVoter(
    voter2Address, "V789012", "钱七"
  )).wait();
  console.log(`- 选民 2 已注册: 钱七 (ID: V789012)`);

  // 注册第三个选民
  const voter3Address = await voter3.getAddress();
  await (await voterRegistration.registerVoter(
    voter3Address, "V345678", "孙八"
  )).wait();
  console.log(`- 选民 3 已注册: 孙八 (ID: V345678)`);

  // 获取并显示选民信息
  const totalVoters = await voterRegistration.getTotalVoters();
  console.log(`共注册了 ${totalVoters} 名选民`);

  // 检查选民注册状态
  console.log(`- 选民1注册状态: ${await voterRegistration.isRegisteredVoter(voter1Address) ? '已注册' : '未注册'}`);
  console.log(`- 选民2注册状态: ${await voterRegistration.isRegisteredVoter(voter2Address) ? '已注册' : '未注册'}`);
  console.log(`- 选民3注册状态: ${await voterRegistration.isRegisteredVoter(voter3Address) ? '已注册' : '未注册'}`);

  console.log("选民注册完成!\n");
  console.log("-".repeat(50));

  // 6. 开始投票阶段
  console.log("\n6. 启动投票阶段...");
  
  // 启动投票，设置较短的投票时间以便于测试（2分钟）
  await (await voting.startVoting(2)).wait();
  console.log("- 投票阶段已启动 (持续2分钟)");
  
  // 检查投票代币余额
  const voter1Balance = await votingToken.balanceOf(voter1Address);
  const voter2Balance = await votingToken.balanceOf(voter2Address);
  const voter3Balance = await votingToken.balanceOf(voter3Address);
  
  console.log(`- 选民1投票代币余额: ${ethers.formatUnits(voter1Balance, 18)}`);
  console.log(`- 选民2投票代币余额: ${ethers.formatUnits(voter2Balance, 18)}`);
  console.log(`- 选民3投票代币余额: ${ethers.formatUnits(voter3Balance, 18)}`);
  
  console.log("投票阶段准备就绪!\n");
  console.log("-".repeat(50));

  // 7. 投票过程
  console.log("\n7. 进行投票...");
  
  // 选民1投票给候选人1
  const votingAsVoter1 = voting.connect(voter1);
  await (await votingAsVoter1.castVote(1)).wait();
  console.log("- 选民1 (赵六) 投票给候选人1 (张三)");
  
  // 选民2投票给候选人2
  const votingAsVoter2 = voting.connect(voter2);
  await (await votingAsVoter2.castVote(2)).wait();
  console.log("- 选民2 (钱七) 投票给候选人2 (李四)");
  
  // 选民3投票给候选人1
  const votingAsVoter3 = voting.connect(voter3);
  await (await votingAsVoter3.castVote(1)).wait();
  console.log("- 选民3 (孙八) 投票给候选人1 (张三)");
  
  // 检查投票状态
  console.log(`- 选民1投票状态: ${await voterRegistration.hasVoted(voter1Address) ? '已投票' : '未投票'}`);
  console.log(`- 选民2投票状态: ${await voterRegistration.hasVoted(voter2Address) ? '已投票' : '未投票'}`);
  console.log(`- 选民3投票状态: ${await voterRegistration.hasVoted(voter3Address) ? '已投票' : '未投票'}`);

  // 使用 Hardhat 网络功能来增加时间
  console.log("- 等待投票期结束 (推进区块链时间)...");
  
  // 推进时间3分钟（超过设定的2分钟投票期）
  await network.provider.send("evm_increaseTime", [3 * 60]);
  // 挖掘新区块以使时间变化生效
  await network.provider.send("evm_mine");
  
  // 提前结束选举
  await (await voting.endElection()).wait();
  console.log("- 投票阶段已结束");
  
  console.log("所有选民已完成投票!\n");
  console.log("-".repeat(50));

  // 8. 统计结果
  console.log("\n8. 统计选举结果...");
  
  // 统计每个候选人的得票数
  console.log("各候选人得票统计:");
  for (let i = 1; i <= Number(totalCandidates); i++) {
    const candidate = await candidateRegistration.getCandidate(i);
    const votes = await voting.getVoteCount(i);
    console.log(`- 候选人 ${i} (${candidate.name}): ${votes} 票`);
  }
  
  // 最终确认结果
  await (await electionResults.finalizeResults()).wait();
  console.log("- 选举结果已确认");
  
  // 获取胜出者
  const winner = await electionResults.getWinner();
  console.log(`选举胜出者: 候选人 ${winner.candidateID} - ${winner.candidateName} (${winner.party}), 得票数: ${winner.voteCount}`);
  
  // 计算投票率
  const turnout = await electionResults.getVoterTurnout();
  console.log(`选民投票率: ${turnout}%`);
  
  console.log("选举结果统计完成!\n");
  console.log("-".repeat(50));

  // 9. 选举验证
  console.log("\n9. 选举审计验证...");
  
  // 批准审计员
  await (await electionVerification.approveAuditor(
    await auditor.getAddress(), "国家选举监督委员会"
  )).wait();
  console.log("- 已批准审计员");
  
  // 审计员提交验证报告
  const verificationAsAuditor = electionVerification.connect(auditor);
  await (await verificationAsAuditor.submitVerification(
    "选举过程公正透明，未发现违规情况", true
  )).wait();
  console.log("- 审计员已提交验证报告");
  
  // 验证投票数与投票记录是否匹配
  const votesMatch = await electionVerification.verifyVoteCounts();
  console.log(`- 投票数与记录匹配验证: ${votesMatch ? '通过' : '不通过'}`);
  
  // 获取验证记录
  const verificationCount = await electionVerification.getVerificationCount();
  console.log(`- 共有 ${verificationCount} 条验证记录`);
  
  for (let i = 0; i < Number(verificationCount); i++) {
    const record = await electionVerification.getVerificationRecord(i);
    console.log(`  记录 ${i+1}: ${record.verificationPassed ? '通过' : '不通过'} - ${record.comments}`);
  }
  
  console.log("选举审计验证完成!\n");
  console.log("-".repeat(50));

 
  console.log("=".repeat(50));
  console.log("\n选举系统测试全部完成!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("测试过程中出错:", error);
    process.exit(1);
  });