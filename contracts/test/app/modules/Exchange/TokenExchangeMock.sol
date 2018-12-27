pragma solidity ^0.4.24;   

import "../../../../app/modules/Exchange/TokenExchange.sol";

contract TokenExchangeMock is TokenExchange {
    constructor(string name, string symbol, uint8 decimals, uint256 totalSupply) public
    TokenExchange(name, symbol, decimals, totalSupply){

    }

    function Testing_GiveInvestmentByAddress(address _account) public view returns (uint256)
    {
        return GiveInvestmentByAddress(_account);
    }

    function Testing_fillWithPercentage(address _account, uint percentage) public
    {
        balances[_account] = (_totalSupply * percentage)/100;
        weiGiven[_account] = getEstimationOfTokens(balances[_account]);
    }

    function Testing_CleanAccount(address _account) public{
        balances[_account] = 0;
        weiGiven[_account] = 0;
        tokenHolders[_account] = false;
        numberOfInvestors = 0;
    }

    function Testing_IsInvestor(address _account) public view returns(bool)
    {
        return tokenHolders[_account];
    }
    
}
