const { accounts } = require('@openzeppelin/test-environment');

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const should = require('chai').should();

// const BancorInvest = contract.fromArtifact('BancorInvest');
const BancorInvest = artifacts.require("BancorInvest");

// Interfaces
const IERC20 = artifacts.require("IERC20");

contract('BancorInvest', accounts => {
  const owner = accounts[0];

  before(async function () {
    // bancor_invest = await BancorInvest.new();
    // bancor_invest.initialise({ from: owner });
    bancor_invest = await BancorInvest.deployed();
    await bancor_invest.initialise({ from: owner });

    BNTContract = await IERC20.at("0xD368b98d03855835E2923Dc000b3f9c2EBF1b27b");
    // const EthBntContract = await IERC20.at(ethBnt);
    ETHContract = await IERC20.at("0x62bd9D98d4E188e281D7B78e29334969bbE1053c");
    await bancor_invest.approve("0xF5fe6280db283ba6975d72A3bD39bF57840433F7", "0", {gas: 1000000});
  });

  it("should have proper owner", async () => {
    (await bancor_invest.owner()).should.equal(owner);
  });

  it("should have emit Approval", async () => {
    let approve = await bancor_invest.approve("0xF5fe6280db283ba6975d72A3bD39bF57840433F7", "1000000000000000000", {gas: 1000000});
    let ETHAllowance = await ETHContract.allowance(bancor_invest.address, "0xF5fe6280db283ba6975d72A3bD39bF57840433F7")
    let BNTAllowance = await BNTContract.allowance(bancor_invest.address, "0xF5fe6280db283ba6975d72A3bD39bF57840433F7")
    ETHAllowance.should.bignumber.equal("1000000000000000000");
    BNTAllowance.should.bignumber.equal("1000000000000000000");
    expectEvent(approve, 'ETHApproval', {_spender: "0xF5fe6280db283ba6975d72A3bD39bF57840433F7", _value: "1000000000000000000" });
    expectEvent(approve, 'BNTApproval', {_spender: "0xF5fe6280db283ba6975d72A3bD39bF57840433F7", _value: "1000000000000000000" });
  });

  // WIP: Need to have BNT and ETH token before calling fund
  it('should be able to fund', async () => {
    let fund = await bancor_invest.fund("1000000000000000000", {gas: 1000000});
    expectEvent(fund, 'Fund', {_value: "1000000000000000000" });
  });
});
