// solium-disable linebreak-style
pragma solidity ^0.4.24;

import "./Kernel.sol";
import "../common/OwnedContract.sol";

/** 
* author: Rafael Piernagorda (https://github.com/AtreyuGreen)
* notice: Define behaviour for a module that can be called into by Kernel.
*/
contract Module is OwnedContract
{
    Kernel internal kernel;
    bool internal initialized = false;

    modifier KernelIsSet()
    {
        require(initialized,"Kernel is not set");
        _;
    }

    event setkernel(bool result);

    constructor() OwnedContract(msg.sender)  public {
    }

    /**
    * notice Set the kernel into the module for use it.
    * param _kernel. Kernel to be used on the contract.
    */
    function setKernel(address _kernel) public payable owned{
        require(_kernel != address(0x0), "Kernel should be not empty");
        ContractValidator validator = new ContractValidator();
        if(!validator.isContract(_kernel))
            revert("Address is not a contract");

        kernel = Kernel(_kernel);
        initialized = true;
        emit setkernel(true);
    }

    /**
    * notice Load a module from the kernel.
    * param _namespace Name space of the module to load.
    */
    function load(string memory namespace) public view KernelIsSet returns(Module){
        return kernel.loadModule(namespace);
    }

    /**
    * notice Destroy the module for removing the data from blockchain.
    */
    function destroy() public payable owned{
        selfdestruct(address(this));
    }
}