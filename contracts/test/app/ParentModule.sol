// solium-disable linebreak-style
pragma solidity ^0.4.4;

import "../../kernel/Module.sol";
import "./Moduleo.sol";
import "./Module1.sol";


contract ParentModule is Module
{
    function GetA() public view returns(uint)
    {
        Module1 m2 = Module1(address(load("Mars.app.Module")));
        return m2.GetA();
    }
}