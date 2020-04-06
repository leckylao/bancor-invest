import React, { useState } from 'react';

// eslint-disable-next-line no-unused-vars
import { useWeb3Network, useEphemeralKey, useWeb3Injected } from '@openzeppelin/network/react';

import Web3Info from './components/Web3Info/index.js';
import BancorInvest from './components/BancorInvest/index.js';

import styles from './App.module.scss';

// eslint-disable-next-line no-unused-vars
const infuraToken = process.env.REACT_APP_INFURA_TOKEN || '95202223388e49f48b423ea50a70e336';

function App() {
  // get ephemeralKey
  // eslint-disable-next-line no-unused-vars
  const signKey = useEphemeralKey();

  // get GSN web3
  const context = useWeb3Network(`wss://ropsten.infura.io/ws/v3/${infuraToken}`, {
    pollInterval: 15 * 1000,
    gsn: {
      signKey,
    },
  });

  // const context = useWeb3Network('http://127.0.0.1:8545', {
  //   gsn: {
  //     dev: true,
  //     signKey,
  //   },
  // });

  // load BancorInvest json artifact
  let bancorInvestJSON = undefined;
  try {
    // see https://github.com/OpenZeppelin/solidity-loader
    bancorInvestJSON = require('../../contracts/BancorInvest.sol');
  } catch (e) {
    console.log(e);
  }

  // load BancorInvest instance
  const [bancorInvestInstance, setBancorInvestInstance] = useState(undefined);
  let deployedNetwork = undefined;
  if (!bancorInvestInstance && context && bancorInvestJSON && bancorInvestJSON.networks && context.networkId) {
    deployedNetwork = bancorInvestJSON.networks[context.networkId.toString()];
    if (deployedNetwork) {
      setBancorInvestInstance(new context.lib.eth.Contract(bancorInvestJSON.abi, deployedNetwork.address));
    }
  }

  function renderNoWeb3() {
    return (
      <div className={styles.loader}>
        <h3>Web3 Provider Not Found</h3>
        <p>Please, install and run Ganache.</p>
      </div>
    );
  }

  return (
    <div className={styles.App}>
      <div className={styles.wrapper}>
        {!context.lib && renderNoWeb3()}
        <div className={styles.contracts}>
          <h1>Bancor Invest</h1>
          <div className={styles.widgets}>
            {/* <Web3Info title="Web3 Provider" context={context} />*/ }
            {/* <Counter {...context} JSON={counterJSON} instance={counterInstance} deployedNetwork={deployedNetwork} /> */}
            <BancorInvest {...context} instance={bancorInvestInstance} context={context} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
