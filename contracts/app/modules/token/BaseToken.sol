pragma solidity ^0.4.24;

import "./Interfaces/ERC20.sol";
import "./Interfaces/ERC223.sol";
import "./Interfaces/ERC223ReceivingContract.sol";

/** 
* author: Rafael Piernagorda (https://github.com/AtreyuGreen)
* notice: IToken should be a interfaz, but solidity don't allow to inherit to a interface, so 
*          this will be a class.
*/

contract BaseToken is ERC20, ERC223{//, ERC223ReceivingContract{
    string internal _name;  ///Name of the token                                                                                      
    string internal _symbol; ///Symbol used for the token
    uint8 internal _decimals; ///Number of decimals.
    uint256 internal _totalSupply; ///Total of tokens that can be sended.

    constructor(string name, string symbol, uint8 decimals, uint256 totalSupply) public {
        _symbol = symbol;
        _name = name;
        _decimals = decimals;
        _totalSupply = totalSupply;
    }

    /**
    * notice Returns the name of the token.
    * return The name of the token.
    */
    function name() public view returns (string) {
        return _name;
    }

    /**
    * notice Returns the symbol of the token.
    * return The symbol of the token.
    */
    function symbol() public view returns (string) {
        return _symbol;
    }

    /**
    * notice Returns the amount of decimals of the token.
    * return The amount of decimals of the token.
    */
    function decimals() public view returns (uint8) {
        return _decimals;
    }

    /**
    * notice Returns the total supply of the token.
    * return The total supply of the token.
    */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
}