# bancor-invest
Hackathon entry for https://gitcoin.co/issue/bancorprotocol/contracts/345/4120

The idea is enable meta-tx and integrate ramp.network for fiat on-ramp. But realised it required both the BancorConverter and ERC20 contract upgrade in order to have meta-tx enabled. Discussion on https://forum.openzeppelin.com/t/having-gas-required-exceeds-allowance-error-on-my-contract-call/2597. And the contracts on https://github.com/bancorprotocol/contracts was using Solidity 0.4.26 and the meta-tx require the latest version and I found it hard to do the upgrade. So at the end the on-ramp flow have to rollback to the original flow: 1, deposit ETH. 2, buy BNT through ramp.network. 3, approve ETH. 4, approve BNT. 5, Fund.

* Firstly please switch to Ropsten network as it will be talking to the Bancor contract there. 

