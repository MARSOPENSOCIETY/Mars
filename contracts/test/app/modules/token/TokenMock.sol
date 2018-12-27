pragma solidity ^0.4.24;   

import "../../../../app/modules/token/Token.sol";
import "../../../../app/modules/token/BaseToken.sol";

/** 
* author: Rafael Piernagorda (https://github.com/AtreyuGreen)
* notice: Mars Token used on our applications.
*/

contract TokenMock is Token {
    constructor(string name, string symbol, uint8 decimals, uint256 totalSupply) public
    Token(name, symbol, decimals, totalSupply){

    }
}
