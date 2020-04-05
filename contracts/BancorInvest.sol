pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";

contract BancorInvest is Initializable, GSNRecipient {
  address private _owner;

  function initialise() public initializer {
    GSNRecipient.initialize();
    _owner = _msgSender();
  }

  // accept all requests
  function acceptRelayedCall(
    address,
    address,
    bytes calldata,
    uint256,
    uint256,
    uint256,
    uint256,
    bytes calldata,
    uint256
    ) external view returns (uint256, bytes memory) {
    return _approveRelayedCall();
  }

  function owner() public view returns (address) {
    return _owner;
  }

  function _preRelayedCall(bytes memory context) internal returns (bytes32) {
  }

  function _postRelayedCall(bytes memory context, bool, uint256 actualCharge, bytes32) internal {
  }

  function setRelayHubAddress() public {
    if(getHubAddr() == address(0)) {
      _upgradeRelayHub(0xD216153c06E857cD7f72665E0aF1d7D82172F494);
    }
  }

  function getRecipientBalance() public view returns (uint) {
    return IRelayHub(getHubAddr()).balanceOf(address(this));
  }
}
