
// solium-disable linebreak-style
pragma solidity ^0.4.24;

contract IExchangeInvestorsController
{
    function Investors() external view returns(address[] memory);
    function InvestmentByAddress(address _account) public view returns (uint256);
    function SetInvestment(address _account, uint256 _amount) internal;
}