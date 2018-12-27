pragma solidity ^0.4.24;   

import "../../../../app/modules/Exchange/ExchangeBusinessLogic.sol";

contract BusinessLogicTokenExchangeMock is ExchangeBusinessLogic {
    constructor(uint256 _weisPerToken) public
    ExchangeBusinessLogic(_weisPerToken)
    {

    }

    function Test_SetClosingTime() public owned
    {
        closingTime = now + 20;
    }

}
