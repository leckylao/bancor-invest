pragma solidity ^0.5.3;

interface IBancorConverter {
  function fund(uint256 _amount) external;
  function liquidate(uint256 _amount) external;
}
