var BancorInvest = artifacts.require("BancorInvest");

module.exports = function(deployer) {
  // Deploy the Migrations contract as our only task
  deployer.deploy(BancorInvest, {gas: 1000000});
};
