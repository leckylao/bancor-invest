import React, { useState } from 'react';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { Box, Button, Heading, Text } from 'rimble-ui';

function Ramp(props) {
  const config = {
    hostAppName: 'Bancor Invest',
    hostLogoUrl:
      'https://storage.googleapis.com/bancor-prod-file-store/images/communities/f80f2a40-eaf5-11e7-9b5e-179c6e04aa7c.png',
    swapAmount: props.swapAmount,
    swapAsset: props.swapAsset,
    userAddress: props.userAddress,
    url: 'https://ri-widget-staging-ropsten.firebaseapp.com/', // only specify the url if you want to use testnet widget versions,
    // use variant: 'auto' for automatic mobile / desktop handling,
    // 'hosted-auto' for automatic mobile / desktop handling in new window,
    // 'mobile' to force mobile version
    // 'desktop' to force desktop version (default)
    variant: 'hosted-auto',
  };

  const ramp = () => {
    let widget = new RampInstantSDK(config);
    widget.show();
  };

  return (
    <div>
      <Box>
        <Button onClick={() => ramp()}> Add Liquidity </Button>
      </Box>
    </div>
  );
}

export default Ramp;
