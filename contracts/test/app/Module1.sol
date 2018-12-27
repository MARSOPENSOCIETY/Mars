// solium-disable linebreak-style
pragma solidity ^0.4.24;

import "./Moduleo.sol";

contract Module1 is Moduleo
{
    function GetA() public view returns(uint)
    {
        return 1;
    }
}