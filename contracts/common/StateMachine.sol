// solium-disable linebreak-style
pragma solidity ^0.4.4;

import "./OwnedContract.sol";

/** 
* author: https://github.com/AtreyuGreen
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
    * notice Stop the kernel for not using.
    */
    function stop() public owned
    {
        isStopped = true;
    }
}