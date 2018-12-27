// solium-disable linebreak-style
pragma solidity ^0.4.24;

import "./OwnedContract.sol";

/** 
* author: Rafael Piernagorda (https://github.com/AtreyuGreen)
* notice: Define contract for White and Black list.
*/
contract BlackListValidator is OwnedContract
{
    mapping (address => bool) internal blackList; // get the blacklist.

    modifier isNotInBlackList(address sender)
    {
        require(blackList[sender] == false,"Sender is in the blacklist");
        _;
    } 

    /**
    * notice Contructor del owned contract
    * param _owner Owner del contrato.
    */
    constructor() OwnedContract(msg.sender)  public {
    }

    /**
    * notice Add the address to a blacklist
    * param sender address to add into the blacklist
    */
    function Add(address sender) public owned{
        blackList[sender] = true;
    }

    /**
    * notice Remove the address from the blacklist
    * param sender address to remove from the blacklist
    */    
    function Remove(address sender) public owned{
        blackList[sender] = false;
    }

}