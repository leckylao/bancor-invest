# bancor-invest
Hackathon entry for Gitcoin Funding The Future Bancor challenge https://gitcoin.co/issue/bancorprotocol/contracts/345/4120

Website: https://leckylao.github.io/bancor-invest/

![Image of APP](https://github.com/leckylao/bancor-invest/blob/master/client/public/WX20200407-055523%402x.png)

Onramp:

[Use GSN with Credit Card](https://docs.openzeppelin.com/gsn-provider/0.1/gsn-faq#can_i_use_this_with_credit_cards). As shown by using meta-transaction everyone can easily add liquidity by using credit card, their info. can be stored in the contract as an ENS address e.g. Alice.Bancor.eth

Offramp:

In the demo I can add the withdraw function which withdraw crypto to specific address. And I would suggest the following ways from crypto to fiat:
* [Crypto ATM](https://coinatmradar.com/countries/) I have tried this personally and I have good experience with it. It's good and fast for small amount, KYC is done with text message. 
* [Debit Card](https://tenx.tech/) There's multiple debit card options and I have one from TenX, this way you can just withdraw crypto to the debit card crypto address then you can use the debit card anywhere. 

The idea is enabling meta-tx and integrate ramp.network for fiat on-ramp. But realised it required both the BancorConverter and ERC20 contract upgrade from using msg.sender to _msgSender() in order to have meta-tx enabled, otherwise all the approve and fund function will store it using msg.sender which is the relayer instead of the actual contract that hold the tokens. Please see discussion on https://forum.openzeppelin.com/t/having-gas-required-exceeds-allowance-error-on-my-contract-call/2597. As the contracts on https://github.com/bancorprotocol/contracts was using Solidity 0.4.26 and the meta-tx require the latest version which would be hard to do the upgrade. So at the end the on-ramp flow have to rollback to the troditional flow: 

1. Please switch to Ropsten network as it will be talking to the Bancor contract there. And get some test ETH from faucet (https://faucet.metamask.io/)

2. Press request access to have your wallet connected
![Image of APP](https://github.com/leckylao/bancor-invest/blob/master/client/public/WX20200407-062058%402x.png)

3. Run both approve ETH and approve BNT, the default approve value have preset to 2000000000000000000
![Image of APP](https://github.com/leckylao/bancor-invest/blob/master/client/public/WX20200407-060147%402x.png)

4. Run Deposit ETH to put test ETH into ERC20 ETH. And run Buy BNT which will pops up the widget window to buy BNT from ramp.network. Please select the test bank account and put in user first name "john", last name "doe" as shown. 
![Image of APP](https://github.com/leckylao/bancor-invest/blob/master/client/public/WX20200407-060351%402x.png)

5. Once the escrow has been created on ramp.network. Click the payment summary and copy the URL and the this curl command to process manual release the escrow
`curl -X POST "https://api-instant-staging-ropsten.supozu.com/api/widget/testing/purchase/[ID]/release?secret=[secret password]"`
E.g.
`curl -X POST "https://api-instant-staging-ropsten.supozu.com/api/widget/testing/purchase/100/release?secret=yjhkbfr88ywgee5h"`

6. Now you have both ETH and BNT ready for the last fund to add liquidity into the pool. It has preset value of "1000000000000000000" for demo propose. 
![Image of APP](https://github.com/leckylao/bancor-invest/blob/master/client/public/WX20200407-060415%402x.png)

7. At the end you would see both your ETH and BNT has been reduced and received 0.01 relay token

Off ramp:
1. First click the liquidate button to swap layer token back to ERC20 tokens
![Image of APP](https://github.com/leckylao/bancor-invest/blob/master/client/public/WX20200407-075100%402x.png)

2. put in your crypto ATM or TenX/MyCrypto Debit Card ethereum address and hit withdraw, value has been set to 1ETH for demo propose. 
![Image of APP](https://github.com/leckylao/bancor-invest/blob/master/client/public/WX20200407-112758%402x.png)
