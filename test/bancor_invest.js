const { accounts, contract } = require('@openzeppelin/test-environment');

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const should = require('chai').should();

const BancorInvest = contract.fromArtifact('BancorInvest');

describe('BancorInvest', function () {
  const [ owner ] = accounts;

  beforeEach(async function () {
    // The bundled BN library is the same one web3 uses under the hood
    const bancor_invest = await BancorInvest.new();
    bancor_invest.initialise({ from: owner });
  });

  it("should have proper owner", async () => {
    (await bancor_invest.owner()).should.equal(owner);
  });
});
