// solium-disable linebreak-style
pragma solidity ^0.4.24;

interface ITokenExchange{
    function buyToken() external payable returns (bool success);
    function GiveTokens(address send, uint256 weis) external payable returns (bool success);
    function getEstimationOfTokens(uint256 amount) external view returns(uint256);
    function timeToFinish() external view returns(uint256);
}
