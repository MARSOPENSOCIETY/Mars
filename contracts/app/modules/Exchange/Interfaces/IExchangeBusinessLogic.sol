pragma solidity ^0.4.24;

interface IExchangeBusinessLogic{
    function makeCapitalIncrease(uint _closingTime, uint256 _weisPerToken) external;
    function SetClosingTime(uint256 _closingTime) external;
    function SetWeisPerToken(uint256 _weisPerToken) external;
    function CanBuyTokens() external view returns(bool);
    function IsValueGreater(uint256 value) external view returns(bool);
    function IsLimitationReached(uint256 weiGivens, uint256 value) external view returns(bool);
    function IsLimitationOfPercentage(uint256 tokens, uint256 totalSupply) external view returns(bool);
    function getEstimationOfTokens(uint256 amount) external view returns(uint256);
    function TimeToFinish() external view returns (uint256);
}