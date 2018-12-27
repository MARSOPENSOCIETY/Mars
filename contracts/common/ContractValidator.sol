// solium-disable linebreak-style
pragma solidity ^0.4.24;

/** 
* author: Rafael Piernagorda (https://github.com/AtreyuGreen)
* notice: Define methods for checking contract parameters. Based on https://github.com/aragon/aragonOS/blob/dev/contracts/common/IsContract.sol
*/
contract ContractValidator
{
    modifier isNotContract(address _target)
    {
        require(!isContract(_target),"Address is a contract and it's not valid");
        _;
    }

    /**
    * notice Checking if addess is a contract or not.
    * param _target Is the address to check.
    * return If address is a contract.
    */
    function isContract(address _target) public view returns(bool){
        if (_target == address(0)) {
            return false;
        }

        uint256 size;
        assembly { size := extcodesize(_target) }
        return size > 0;
    }
}