// solium-disable linebreak-style
pragma solidity ^0.4.24;

import "../../kernel/Kernel.sol";

///Created for include the mock functions
contract KernelMock is Kernel {
    function loadModuleMock(string memory _namespace) public view returns(Module) 
    {
        return loadModule(_namespace);
    }

    function registerModuleMock(string memory _namespace, address _module) public payable
    {
        registerModule(_namespace, _module);
    }

    function createMock(address addressModule) public pure returns(Module)
    {
        return create(addressModule);
    }
}