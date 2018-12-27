// solium-disable linebreak-style
pragma solidity ^0.4.24;

import "./Moduleo.sol";

contract Module2 is Moduleo
{
    function GetA() public view returns(uint)
    {
        return 2;
    }
}