module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    await deploy("SkillSetContract", {
      from: deployer,
      log: true,
    });
  };
  
  module.exports.tags = ["SkillSetContract"];
  