// solium-disable linebreak-style
pragma solidity ^0.4.4;

import "../../registry/NameRegistry.sol";

contract NameRegistryMock is NameRegistry {
    
    function registerNameMock(string memory name, address addr) public returns (bool) {   
        return registerName(name, addr);
    }

    function getContractDetailsMock(string memory name) public view returns(address) {
        return getContractDetails(name);
    }
}