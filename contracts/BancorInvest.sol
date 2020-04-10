pragma solidity ^0.5.3;

import "@openzeppelin/contracts-ethereum-package/contracts/GSN/GSNRecipient.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./converter/interfaces/IBancorConverter.sol";

contract BancorInvest is Initializable, GSNRecipient {
  address private _owner;
  address public eth_token;
  address public bnt_token;
  address public converter;

  IERC20 public constant EthToken = IERC20(0x62bd9D98d4E188e281D7B78e29334969bbE1053c);
  IERC20 public constant BntToken = IERC20(0xD368b98d03855835E2923Dc000b3f9c2EBF1b27b);
  IBancorConverter public constant BancorConverter =
  IBancorConverter(0xF5fe6280db283ba6975d72A3bD39bF57840433F7);
  event ETHApproval(address indexed _owner, address indexed _spender, uint256 _value);
  event BNTApproval(address indexed _owner, address indexed _spender, uint256 _value);
  event Fund(address indexed _owner, uint256 _value);

  function initialise() public initializer {
    GSNRecipient.initialize();
    _owner = _msgSender();
    converter = address(0xF5fe6280db283ba6975d72A3bD39bF57840433F7);
  }

  function owner() public view returns (address) {
    return _owner;
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

  function approve(address _spender, uint256 _value) public
  {
    // eth_token.call(abi.encodePacked("approve(address, uint256)", _spender, _value));
    EthToken.approve(_spender, _value);
    emit ETHApproval(_msgSender(), _spender, _value);
    // bnt_token.call(abi.encodePacked("approve(address, uint256)", _spender, _value));
    BntToken.approve(_spender, _value);
    emit BNTApproval(_msgSender(), _spender, _value);
  }

  function fund(uint256 _amount) public
  {
    BancorConverter.fund(_amount);
    emit Fund(_msgSender(), _amount);
  }
}
