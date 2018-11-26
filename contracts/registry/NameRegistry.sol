// solium-disable linebreak-style
pragma solidity ^0.4.4;

/** 
* author: https://github.com/AtreyuGreen
* notice: Define a NameRegistry pattern include here https://medium.com/(at)i6mi6/solidty-smart-contracts-design-patterns-ecfa3b1e9784 
*/

import "../common/ContractValidator.sol";
import "../common/OwnedContract.sol";

contract NameRegistry is OwnedContract {
    
    struct ContractDetails {
        address owner;
        address contractAddress;
    }

    mapping(string => ContractDetails) internal registry;

    event Register(string name, address indexed contractAddress);

    /**
    * notice Contructor del owned contract
    * param _owner Owner del contrato.
    */
    constructor() OwnedContract(msg.sender)  public {
    }

    /**
    * notice Register the address of the contract with a name for quick indexing.
    * param name Name to register the contract
    * param addr Contract's address
    * param ver Version of source code of the contract
    * return If register was succesfull
    */
    function registerName(string memory name, address addr) internal owned returns (bool) {   
        require(bytes(name).length > 0, "Namespace shouldn't be empty");

        ContractValidator validator = new ContractValidator();
        if(!validator.isContract(addr))
            revert("Address is not a contract");

        ContractDetails memory info = registry[name];

        if(address(info.owner) != address(0x0))
            require(info.owner == msg.sender, "Sender can't registry address");

        // create info if it doesn't exist in the registry
        if (info.contractAddress == address(0)) {
            info = ContractDetails({
                owner: msg.sender,
                contractAddress: addr
            });
        } else {
            info.contractAddress = addr;
        }
        // update record in the registry
        registry[name] = info;

        emit Register(name, addr);
        return true;
    }
    
    /**
    * notice Retrieve the contract details
    * param name Name to register the contract
    * return Struct with contract's address.
    */    
    function getContractDetails(string memory name) public view returns(address) {
        return registry[name].contractAddress;
    }
}