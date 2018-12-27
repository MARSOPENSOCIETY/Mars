// solium-disable linebreak-style
pragma solidity ^0.4.24;

import "./ContractValidator.sol";

/** 
* author: Rafael Piernagorda (https://github.com/AtreyuGreen)
* notice: Define methods for owner of contract.
*/
contract OwnedContract
{
    address internal owner;
    ContractValidator internal validator;
    
    modifier owned()
    {
        require(msg.sender == owner,"Sender not authorized.");
        _;
    }

    /**
    * notice Contructor del owned contract
    * param _owner Address of the new owner. Can't be a contract.
    */
    constructor(address _owner) public {
        validator = new ContractValidator();
        if(validator.isContract(_owner))
            revert("Owner can't be a contract.");
        owner = _owner;
    }

    /**
    * notice Change the address of the owner
    * param _newOwner Address of the new owner. Can't be a contract.
    */
    function changeOwner(address _newOwner) public owned()
    {
        if(validator.isContract(_newOwner))
            revert("Owner can't be a contract.");
        owner = _newOwner;
    }

    /**
    * notice Returns the address of the owner
    * return The address of the owner.
    */
    function getOwner() public view returns(address)
    {
        return owner;
    }

}