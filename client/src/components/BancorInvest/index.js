import React, { useState, useEffect, useCallback } from 'react';
import { PublicAddress, Button, Loader } from 'rimble-ui';
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
  const { context, instance, accounts, lib, networkName, networkId, providerName } = props;
  const { _address, methods } = instance || {};

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
  const [symbol, setSymbol] = useState('');
  const [token0, setToken0] = useState('');
  const [token1, setToken1] = useState('');
  const [token0Name, setToken0Name] = useState('');
  const [token0Balance, setToken0Balance] = useState(0);
  const [token1Name, setToken1Name] = useState('');
  const [token1Balance, setToken1Balance] = useState(0);
  const [converter, setConverter] = useState('');

  const [token0Allowance, setToken0Allowance] = useState('');
  const [token1Allowance, setToken1Allowance] = useState('');

  const getToken0Allowance = useCallback(async () => {
    if (accounts && accounts.length && converter && token0 && instance) {
      let token0Allowance = await token0.methods.allowance(_address, converter._address).call();
      setToken0Allowance(token0Allowance);
    }
  }, [accounts, converter, token0, instance, _address]);

  useEffect(() => {
    getToken0Allowance();
  }, [token0Allowance, accounts, getBalance, isGSN, lib.eth, lib.utils, networkId, getToken0Allowance]);

  const getToken1Allowance = useCallback(async () => {
    if (accounts && accounts.length && converter && token1 && instance) {
      let token1Allowance = await token1.methods.allowance(_address, converter._address).call();
      setToken1Allowance(token1Allowance);
    }
  }, [accounts, converter, token1, instance, _address]);

  useEffect(() => {
    getToken1Allowance();
  }, [token1Allowance, accounts, getBalance, isGSN, lib.eth, lib.utils, networkId, getToken1Allowance]);

  // Bancor Init
  const init = useCallback(async () => {
    let contractRegistryContract = new context.lib.eth.Contract(
      ContractRegistry,
      '0xFD95E724962fCfC269010A0c6700Aa09D5de3074',
    );
    let registryBlockchainId = await contractRegistryContract.methods
      .addressOf(context.lib.utils.asciiToHex('BancorConverterRegistry'))
      .call();
    let networkBlockchainId = await contractRegistryContract.methods
      .addressOf(context.lib.utils.asciiToHex('BancorNetwork'))
      .call();
    console.log('BancorNetwork: ', networkBlockchainId);
    let registry = new context.lib.eth.Contract(BancorConverterRegistry, registryBlockchainId);
    let smartTokenCount = await registry.methods.getSmartTokenCount().call();
    let smartTokens = await registry.methods.getSmartTokens().call();

    // let smartTokenBlockchainId = await registry.methods.getSmartToken(0).call();
    // console.log(smartTokenCount);
    // console.log(smartTokens);
    // for(let i = 0; i < smartTokens.length; i++){
    //   let tokenContract = new context.lib.eth.Contract(SmartToken, smartTokens[i]);
    //   let name = await tokenContract.methods.name().call();
    //   let symbol = await tokenContract.methods.symbol().call();
    //   console.log(i, name, symbol);
    // }

    let tokenContract = new context.lib.eth.Contract(SmartToken, smartTokens[0]);
    let owner = await tokenContract.methods.owner().call();
    let name = await tokenContract.methods.name().call();
    setName(name);
    let symbol = await tokenContract.methods.symbol().call();
    setSymbol(symbol);

    let converter = new context.lib.eth.Contract(BancorConverter, owner);
    setConverter(converter);
    console.log('Converter: ', converter._address);
    let connectorTokens0 = await converter.methods.connectorTokens(0).call();
    let connectorTokens1 = await converter.methods.connectorTokens(1).call();
    console.log('Path: ', connectorTokens1, smartTokens[0], connectorTokens0);

    let token0 = new context.lib.eth.Contract(ERC20, connectorTokens0);
    setToken0(token0);
    if (instance) {
      let token0Name = await token0.methods.name().call();
      let token0Balance = await token0.methods.balanceOf(_address).call();
      setToken0Name(token0Name);
      setToken0Balance(token0Balance);
    }
    let token1 = new context.lib.eth.Contract(ERC20, connectorTokens1);
    setToken1(token1);
    let token1Name = await token1.methods.name().call();
    if (instance) {
      let token1Balance = await token1.methods.balanceOf(_address).call();
      setToken1Name(token1Name);
      setToken1Balance(token1Balance);
    }

    // Convertion
    // let convert = await converter.methods.convert(connectorTokens1, connectorTokens0, context.lib.utils.toWei("1"), context.lib.utils.toWei("1")).call();
    // console.log(convert);

    // Get Ratio and Balance
    // let getReserveRatioETH = await converter.methods.getReserveRatio(connectorTokens0).call();
    // let getReserveBalanceETH = await converter.methods.getReserveBalance(connectorTokens0).call();
    // console.log(getReserveRatioETH, getReserveBalanceETH);
  }, [_address, context.lib.eth.Contract, context.lib.utils, instance]);

  useEffect(() => {
    if (isGSN) init();
  }, [accounts, init, isGSN, lib.eth, lib.utils, networkId]);

  const approve = async amount => {
    try {
      if (!sending) {
        setSending(true);

        const converter_address = await instance.methods.converter().call();
        console.log('accounts[0]: ', accounts[0]);
        const tx = await instance.methods.approve(converter._address, amount).send({ from: accounts[0], gas: 80000 });
        const receipt = await getTransactionReceipt(lib, tx.transactionHash);
        getToken0Allowance();
        getToken1Allowance();
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

  return (
    <div>
      <h3> BancorInvest Instance </h3>
      {lib && !instance && renderNoDeploy()}
      {lib && instance && (
        <React.Fragment>
          <div>
            <div>Instance address:</div>
            <div>
              <PublicAddress label="" address={_address} />
            </div>
          </div>
          <div>
            <div>{token0Name} Balance:</div>
            <div>{token0Balance}</div>
            <div>{token1Name} Balance:</div>
            <div>{token1Balance}</div>
            <div>
              {token0Name} Allowance: {token0Allowance}
            </div>
            <div>
              {token1Name} Allowance: {token1Allowance}
            </div>
          </div>
          <div>
            <div>{name}</div>
            {instance && <Ramp swapAmount="4000000000000000000" swapAsset="BNT" userAddress={_address} />}
          </div>
          {isGSN && (
            <div>
              <div>Recipient Funds:</div>
              <div>{lib.utils.fromWei(funds.toString(), 'ether')} ETH</div>
            </div>
          )}
          {isGSN && !funds && renderNoFunds()}
          {!isGSN && !balance && renderNoBalance()}

          {(!!funds || !!balance) && (
            <React.Fragment>
              <div>
                <strong>Actions</strong>
              </div>
              <div>
                <Button onClick={() => approve('2000000000000000000')}>
                  {sending ? <Loader color="white" /> : <span> Approve</span>}
                </Button>
                {/*
                <Button onClick={() => decrease(1)} disabled={!(methods && methods.decreaseCounter)} size="small">
                  {sending ? <Loader className={styles.loader} color="white" /> : <span> Decrease Counter by 1</span>}
                </Button>
                */}
              </div>
            </React.Fragment>
          )}
          {transactionHash && networkName !== 'Private' && renderTransactionHash()}
        </React.Fragment>
      )}
    </div>
  );
}
