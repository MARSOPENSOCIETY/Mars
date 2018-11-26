// solium-disable linebreak-style
pragma solidity ^0.4.4;

import "./Module.sol";
import "../registry/NameRegistry.sol";
import "../common/StateMachine.sol";
import "../common/OwnedContract.sol";
import "../common/ContractValidator.sol";

/** 
* author: https://github.com/AtreyuGreen
* notice: Define the Kernel for loading and creating new modules.
*/

contract Kernel is NameRegistry, StateMachine
{

    /**
    * notice Load the module with a namespace linked
    * param _namespace. Namespace of the module to load.
    * return Module created.
    */
    function loadModule(string memory _namespace) public isNotStopped view returns(Module) 
    {
        require(bytes(_namespace).length > 0, "Namespace shouldn't be empty");
        address moduleAddress = getContractDetails(_namespace);
        Module module = create(moduleAddress);
        return module;
    } 

    /**
    * notice Registry the module into the namespace
    * param _namespace. Namespace of the module to load.
    * param _module. Address of the module
    */
    function registerModule(string memory _namespace, address _module) public payable isNotStopped owned
    {
        if(_module == address(0x0)) 
            revert("Module address shouldn't be empty");
        registerName(_namespace, _module);
    }    

    /**
    * notice Create a module from the address passed
    * param addressModule. Address of the module to create
    * return Module created.
    */
    function create(address addressModule) internal pure returns(Module)
    {
        require(addressModule != address(0x0), "Module is empty");
        return Module(addressModule);
    }
}