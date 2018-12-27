// solium-disable linebreak-style
pragma solidity ^0.4.24;

import "./OwnedContract.sol";

/** 
* author: Rafael Piernagorda (https://github.com/AtreyuGreen)
* notice: Define method for the state machine
*/
contract StateMachine is OwnedContract
{
    bool private isStopped = true;

    modifier isNotStopped()
    {
        require(!isStopped,"Kernel is freezed");
        _;
    } 

    /**
    * notice Contructor del owned contract
    * param _owner Owner del contrato.
    */
    constructor() OwnedContract(msg.sender)  public {
    }


    /**
    * notice Init the kernel for start using
    */
    function init() public owned
    {
        isStopped = false;
    }  

    /**
    * notice Check if state is inited.
     */
    function isinit() public view returns(bool)
    {
        return !isStopped;
    }

    /**
    * notice Stop the kernel for not using.
    */
    function stop() public owned
    {
        isStopped = true;
    }
}