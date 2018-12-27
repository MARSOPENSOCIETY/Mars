// solium-disable linebreak-style
pragma solidity ^0.4.24;

import "../../../common/OwnedContract.sol";
import "./Interfaces/IExchangeInvestorsControllers.sol";

/** 
* author: Rafael Piernagorda (https://github.com/AtreyuGreen)
* notice: Define methods for checking contract parameters. Based on https://github.com/aragon/aragonOS/blob/dev/contracts/common/IsContract.sol
*/

contract ExchangeInvestorsController is OwnedContract
{
    uint internal createdTokens = 0;
    uint internal numberOfInvestors = 0; ///This is used for get the number of weiGiven.
    mapping (uint => address) internal investors; ///Investors
    mapping (address => bool) internal tokenHolders; ///Token holders.
    mapping (address => uint256) internal weiGiven; // tracks the amount of wei given from each contributor (used for refund)

    constructor() 
    OwnedContract(msg.sender) public
    {
    }

    /**
    * notice Get the array of the investors that make an investment.
    * return Array of address of investors.
    */
    function Investors() public view owned returns(address[] memory)
    {
        if(numberOfInvestors == 0)
            return new address[](0);
		
        address[] memory investorsAddress = new address[](numberOfInvestors);
        for (uint i = 1; i <= numberOfInvestors; i++)
            investorsAddress[i-1] = investors[i];
		
        return investorsAddress;
    }

    /**
    * notice Get the array of the investors that make an investment.
    * params _account Address of the account to get the investment.
    * return amount of weis given by investor.
    */
    function InvestmentByAddress(address _account) public view owned returns (uint256)
    {
        return GiveInvestmentByAddress(_account);
    }

    /**
    * notice Get the number of investors.
    * return number of current investors.
    */
    function InvestorsCounts() public view returns (uint256)
    {
        return numberOfInvestors;
    }

    /**
    * notice Get the array of the investors that make an investment. This funciton is internal.
    * params _account Address of the account to get the investment.
    * return amount of weis given by investor.
    */
    function GiveInvestmentByAddress(address _account) internal view returns (uint256)
    {
        return weiGiven[_account];
    }

    /**
    * notice Set the amount of the investment 
    * params _account Address of the accoutn to get the investment.
    * params _amount of weis to set in the investment.
     */
    function SetInvestment(address _account, uint256 _amount) internal
    {
        SetInvestor(_account);
        weiGiven[_account] += _amount;
    }

    /**
    * notice 
    * params _account Address of the accoutn to get the investment.
    * params _amount of weis to set in the investment.
     */
    function SetInvestor(address _account) internal
    {
        if(!tokenHolders[_account])
        {
            tokenHolders[_account] = true;
            
            numberOfInvestors += 1;
            investors[numberOfInvestors] = _account;
        }   
    }
}