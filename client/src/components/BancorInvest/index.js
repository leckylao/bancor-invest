import React, { setState, useState, useEffect, useCallback } from 'react';
import { Flex, PublicAddress, Box, Button, Loader, Input, Field } from 'rimble-ui';
import Ramp from '../Ramp/index.js';

// import bancor contracts;
import { ContractRegistry } from '../../contracts/ContractRegistry';
import { BancorConverterRegistry } from '../../contracts/BancorConverterRegistry';
import { BancorConverter } from '../../contracts/BancorConverter';
import { SmartToken } from '../../contracts/SmartToken';
import { BancorFormula } from '../../contracts/BancorFormula';
import { ERC20 } from '../../contracts/ERC20';

// import styles from './Counter.module.scss';

import getTransactionReceipt from '../../utils/getTransactionReceipt';
import { utils } from '@openzeppelin/gsn-provider';
const { isRelayHubDeployedForRecipient, getRecipientFunds } = utils;

export default function BancorInvest(props) {
  const { lib, instance, accounts, networkName, networkId, providerName } = props;
  const { _address } = instance || {};

  // GSN provider has only one key pair
  const isGSN = providerName === 'GSN';

  const [balance, setBalance] = useState(0);

  const getBalance = useCallback(async () => {
    let balance =
      accounts && accounts.length > 0 ? lib.utils.fromWei(await lib.eth.getBalance(accounts[0]), 'ether') : 'Unknown';
    setBalance(Number(balance));
  }, [accounts, lib.eth, lib.utils]);

  useEffect(() => {
    if (!isGSN) getBalance();
  }, [accounts, getBalance, isGSN, lib.eth, lib.utils, networkId]);

  const [, setIsDeployed] = useState(false);
  const [funds, setFunds] = useState(0);

  const getDeploymentAndFunds = useCallback(async () => {
    if (instance) {
      if (isGSN) {
        // if GSN check how much funds recipient has
        const isDeployed = await isRelayHubDeployedForRecipient(lib, _address);

        setIsDeployed(isDeployed);
        if (isDeployed) {
          const funds = await getRecipientFunds(lib, _address);
          setFunds(Number(funds));
        }
      }
    }
  }, [_address, instance, isGSN, lib]);

  useEffect(() => {
    getDeploymentAndFunds();
  }, [getDeploymentAndFunds, instance]);

  /*
  const [count, setCount] = useState(0);

  const getCount = useCallback(async () => {
    if (instance) {
      // Get the value from the contract to prove it worked.
      const response = await instance.methods.getCounter().call();
      // Update state with the result.
      setCount(response);
    }
  }, [instance]);

  useEffect(() => {
    getCount();
  }, [getCount, instance]);
  */

  const [sending, setSending] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  // state vars for Bancor
  const [name, setName] = useState('');
  const [liquidity, setLiquidity] = useState('10000000000000000');
  const [token0, setToken0] = useState('');
  const [token0Name, setToken0Name] = useState('');
  const [token0Balance, setToken0Balance] = useState('');
  const [token0Allowance, setToken0Allowance] = useState('');

  const [token1, setToken1] = useState('');
  const [token1Name, setToken1Name] = useState('');
  const [token1Balance, setToken1Balance] = useState('');
  const [token1Allowance, setToken1Allowance] = useState('');
  const [converter, setConverter] = useState('');
  const [smartTokenBalance, setSmartTokenBalance] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  // Bancor Init
  const init = useCallback(async () => {
    let contractRegistryContract = new lib.eth.Contract(ContractRegistry, '0xFD95E724962fCfC269010A0c6700Aa09D5de3074');
    let registryBlockchainId = await contractRegistryContract.methods
      .addressOf(lib.utils.asciiToHex('BancorConverterRegistry'))
      .call();
    let networkBlockchainId = await contractRegistryContract.methods
      .addressOf(lib.utils.asciiToHex('BancorNetwork'))
      .call();
    console.log('BancorNetwork: ', networkBlockchainId);
    let registry = new lib.eth.Contract(BancorConverterRegistry, registryBlockchainId);
    let smartTokens = await registry.methods.getSmartTokens().call();

    // let smartTokenBlockchainId = await registry.methods.getSmartToken(0).call();
    // console.log(smartTokens);
    // for(let i = 0; i < smartTokens.length; i++){
    //   let tokenContract = new lib.eth.Contract(SmartToken, smartTokens[i]);
    //   let name = await tokenContract.methods.name().call();
    //   let symbol = await tokenContract.methods.symbol().call();
    //   console.log(i, name, symbol);
    // }

    let tokenContract = new lib.eth.Contract(SmartToken, smartTokens[0]);
    let owner = await tokenContract.methods.owner().call();
    let name = await tokenContract.methods.name().call();
    setName(name);

    let converter = new lib.eth.Contract(BancorConverter, owner);
    console.log('Converter: ', converter._address);
    setConverter(converter);
    let connectorTokens0 = await converter.methods.connectorTokens(0).call();
    let connectorTokens1 = await converter.methods.connectorTokens(1).call();
    console.log('Path: ', connectorTokens1, smartTokens[0], connectorTokens0);

    let token0 = new lib.eth.Contract(ERC20, connectorTokens0);
    setToken0(token0);
    let token1 = new lib.eth.Contract(ERC20, connectorTokens1);
    setToken1(token1);
    if (accounts && accounts.length > 0) {
      let token0Name = await token0.methods.name().call();
      let token0Balance = await token0.methods.balanceOf(accounts[0]).call();
      let token0Allowance = await token0.methods.allowance(accounts[0], owner).call();
      setToken0Name(token0Name);
      setToken0Balance(token0Balance);
      setToken0Allowance(token0Allowance);
      let token1Name = await token1.methods.name().call();
      let token1Balance = await token1.methods.balanceOf(accounts[0]).call();
      let token1Allowance = await token1.methods.allowance(accounts[0], owner).call();
      setToken1Name(token1Name);
      setToken1Balance(token1Balance);
      setToken1Allowance(token1Allowance);
      let smartTokenBalance = await tokenContract.methods.balanceOf(accounts[0]).call();
      setSmartTokenBalance(smartTokenBalance);
    }

    // Convertion
    // let convert = await converter.methods.convert(connectorTokens1, connectorTokens0, lib.utils.toWei("1"), lib.utils.toWei("1")).call();
    // console.log(convert);

    // Get Ratio and Balance
    // let getReserveRatioETH = await converter.methods.getReserveRatio(connectorTokens0).call();
    // let getReserveBalanceETH = await converter.methods.getReserveBalance(connectorTokens0).call();
    // console.log(getReserveRatioETH, getReserveBalanceETH);
  }, [accounts, lib.eth.Contract, lib.utils]);

  useEffect(() => {
    init();
  }, [accounts, init, isGSN, lib.eth, lib.utils, networkId]);

  const approve = async (token, amount) => {
    try {
      if (!sending) {
        setSending(true);

        // const converter_address = await instance.methods.converter().call();
        // console.log(converter_address);
        const tx = await token.methods.approve(converter._address, amount).send({ from: accounts[0] });
        const receipt = await getTransactionReceipt(lib, tx.transactionHash);
        setTransactionHash(receipt.transactionHash);

        setSending(false);
      }
    } catch (e) {
      setSending(false);
      console.log(e);
    }
  };

  const fund = async amount => {
    try {
      if (!sending) {
        setSending(true);

        console.log('Converter: ', converter._address);
        console.log('Liquidity: ', amount);
        let tx = await converter.methods.fund(amount).send({ from: accounts[0], gas: 400000 });
        const receipt = await getTransactionReceipt(lib, tx.transactionHash);
        setTransactionHash(receipt.transactionHash);

        setSending(false);
      }
    } catch (e) {
      setSending(false);
      console.log(e);
    }
  };

  const liquidate = async amount => {
    try {
      if (!sending) {
        setSending(true);

        console.log('Converter: ', converter._address);
        console.log('Liquidity: ', amount);
        let tx = await converter.methods.liquidate(amount).send({ from: accounts[0], gas: 400000 });
        const receipt = await getTransactionReceipt(lib, tx.transactionHash);
        setTransactionHash(receipt.transactionHash);

        setSending(false);
      }
    } catch (e) {
      setSending(false);
      console.log(e);
    }
  };

  const withdraw = async (to, amount ) => {
    try {
      if (!sending) {
        setSending(true);

        // let tx = await token0.methods.transfer(to, amount).call();
        let tx = lib.eth.sendTransaction({from:accounts[0], to:withdrawAddress, value: 1000000000000000000, gas: 40000});
        const receipt = await getTransactionReceipt(lib, tx.transactionHash);
        setTransactionHash(receipt.transactionHash);

        setSending(false);
      }
    } catch (e) {
      setSending(false);
      console.log(e);
    }
  };

  function renderNoDeploy() {
    return (
      <div>
        <p>
          <strong>Can't Load Deployed Counter Instance</strong>
        </p>
        <p>Please, run `oz create` to deploy an counter instance.</p>
      </div>
    );
  }

  function renderNoFunds() {
    return (
      <div>
        <p>
          <strong>The recipient has no funds</strong>
        </p>
        <p>Please, run:</p>
        <div>
          <code>
            <small>npx oz-gsn fund-recipient --recipient {_address}</small>
          </code>
        </div>
        <p>to fund the recipient on local network.</p>
      </div>
    );
  }

  function renderNoBalance() {
    return (
      <div>
        <p>
          <strong>Fund your account</strong>
        </p>
        <p>You need some ETH to be able to send transactions. Please, run:</p>
        <div>
          <code>
            <small>openzeppelin transfer --to {accounts[0]}</small>
          </code>
        </div>
        <p>to fund your Metamask.</p>
      </div>
    );
  }

  function renderTransactionHash() {
    return (
      <div>
        <p>
          Transaction{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://${networkName}.etherscan.io/tx/${transactionHash}`}
          >
            <small>{transactionHash.substr(0, 6)}</small>
          </a>{' '}
          has been mined on {networkName} network.
        </p>
      </div>
    );
  }

  function handleChange(e) {
    setWithdrawAddress(e.target.value);
  }

  function handleClick() {
    withdraw(withdrawAddress, 1000000000000000000);
  }

  return (
    <div>
      <h3>{name} Pool </h3>
      {/*
      {lib && !instance && renderNoDeploy()}
      */}
      {lib && (
        <React.Fragment>
          {/*
          <div>
            <div>Instance address:</div>
            <div>
              <PublicAddress label="" address={_address} />
            </div>
          </div>
          */}
          <div>
            <div>{token0Name} Balance:</div>
            <div>{lib.utils.fromWei(token0Balance.toString())}</div>
            <div>{token1Name} Balance:</div>
            <div>{lib.utils.fromWei(token1Balance.toString())}</div>
            <div>{name} Balance:</div>
            <div>{lib.utils.fromWei(smartTokenBalance.toString())}</div>
          </div>
          <hr />
          <React.Fragment>
            <div>
              <strong>Actions</strong>
            </div>
            {token0Name && token0Allowance === 0 && (
              <div>
                <Button onClick={() => approve(token0, '2000000000000000000')}>
                  {sending ? <Loader color="white" /> : <span> Approve {token0Name}</span>}
                </Button>
                <hr />
              </div>
            )}
            {token1Name && token1Allowance === 0 && (
              <div>
                <Button onClick={() => approve(token1, '2000000000000000000')}>
                  {sending ? <Loader color="white" /> : <span> Approve {token1Name}</span>}
                </Button>
                <hr />
              </div>
            )}
            {token1 && (
              <div>
                <Button
                  onClick={async () =>
                    await token1.methods.deposit().send({ from: accounts[0], value: '1000000000000000000' })
                  }
                >
                  {sending ? <Loader color="white" /> : <span> Deposit {token1Name}</span>}
                </Button>
                <hr />
              </div>
            )}
            <div>
              {<Ramp swapAmount="4000000000000000000" swapAsset="BNT" userAddress={_address} />}
              <hr />
            </div>
            {token0Allowance && token1Allowance && token0Balance > 0 && token1Balance > 0 && (
              <div>
                <Button onClick={() => fund(liquidity)}>
                  {sending ? <Loader color="white" /> : <span> Add Liquidity </span>}
                </Button>
                <hr />
              </div>
            )}
            {smartTokenBalance && smartTokenBalance > 0 && (
              <div>
                <Button onClick={() => liquidate(liquidity)}>
                  {sending ? <Loader color="white" /> : <span> Remove Liquidity </span>}
                </Button>
                <hr />
              </div>
            )}
            {( balance || balance > 0 ) && (
              <div>
                <Flex>
                  <Box width={1} >
                    <Field label="Withdraw Address">
                      <Input type="text" required={true} placeholder="0x9505C8Fc1aD98b0aC651b91245d02D055fEc8E49" onChange={(e) => handleChange(e)} />
                    </Field>
                  </Box>
                </Flex>
                <Flex>
                  <Box width={1} >
                    <Button onClick={() => handleClick()}>
                      {sending ? <Loader color="white" /> : <span> Withdraw </span>}
                    </Button>
                  </Box>
                </Flex>
              </div>
            )}

            {/* <Button onClick={() => decrease(1)} disabled={!(methods && methods.decreaseCounter)} size="small">
                  {sending ? <Loader className={styles.loader} color="white" /> : <span> Decrease Counter by 1</span>}
                </Button> */}
          </React.Fragment>
          {transactionHash && networkName !== 'Private' && renderTransactionHash()}
        </React.Fragment>
      )}
    </div>
  );
}
