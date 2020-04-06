# bancor-invest
Hackathon entry for https://gitcoin.co/issue/bancorprotocol/contracts/345/4120

![Image of APP](https://github.com/leckylao/bancor-invest/blob/master/client/public/WX20200407-055523%402x.png)

The idea is enable meta-tx and integrate ramp.network for fiat on-ramp. But realised it required both the BancorConverter and ERC20 contract upgrade in order to have meta-tx enabled. Discussion on https://forum.openzeppelin.com/t/having-gas-required-exceeds-allowance-error-on-my-contract-call/2597. And the contracts on https://github.com/bancorprotocol/contracts was using Solidity 0.4.26 and the meta-tx require the latest version and I found it hard to do the upgrade. So at the end the on-ramp flow have to rollback to the original flow: 1, deposit ETH. 2, buy BNT through ramp.network. 3, approve ETH. 4, approve BNT. 5, Fund.

1. Please switch to Ropsten network as it will be talking to the Bancor contract there. And get some test ETH from faucet (https://faucet.metamask.io/)

2. Run both approve ETH and approve BNT, the default approve value have preset to 2000000000000000000
![Image of APP](https://github.com/leckylao/bancor-invest/blob/master/client/public/WX20200407-060147%402x.png)

3. Run Deposit ETH to put test ETH into ERC20 ETH. And run Buy BNT which will pops up the widget window to buy BNT from ramp.network. Please select the test bank account and put in user first name "john", last name "doe" as shown. 
![Image of APP](https://github.com/leckylao/bancor-invest/blob/master/client/public/WX20200407-060351%402x.png)

4. Once the escrow has been created on ramp.network. Click the payment summary and copy the URL and the this curl command to process manual release the escrow
`curl -X POST "https://api-instant-staging-ropsten.supozu.com/api/widget/testing/purchase/[ID]/release?secret=[secret password]"`
E.g.
`curl -X POST "https://api-instant-staging-ropsten.supozu.com/api/widget/testing/purchase/100/release?secret=yjhkbfr88ywgee5h"`

5. Now you have both ETH and BNT ready for the last fund to add liquidity into the pool. It has preset value of "1000000000000000000" for demo propose. 
![Image of APP](https://github.com/leckylao/bancor-invest/blob/master/client/public/WX20200407-060415%402x.png)
