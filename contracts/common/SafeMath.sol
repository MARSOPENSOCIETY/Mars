///Es la versión del solidity que se va a utilizar en el compilador
pragma solidity ^0.4.24;

library SafeMath {
    uint constant RAY = 10 ** 10;
    uint constant DOUBLE_RAY = 10 ** 20;

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }

    function rmul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function rdiv(uint x, uint y) internal pure returns (uint z) {
        z = add(rmul(x, RAY), y / 2) / y;
    }
    function rfloor(uint x) internal pure returns(uint z)
    {
        z=x/DOUBLE_RAY;
    }
    function floor(uint x) internal pure returns(uint z)
    {
        z=x/RAY;
    }
}