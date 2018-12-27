
// solium-disable linebreak-style
pragma solidity ^0.4.24;

import "../../../common/OwnedContract.sol";
import "../../../kernel/Module.sol";
import "../../../common/SafeMath.sol";

/** 
* author: Rafael Piernagorda (https://github.com/AtreyuGreen)
* notice: Define methods for checking contract parameters. Based on https://github.com/aragon/aragonOS/blob/dev/contracts/common/IsContract.sol
*/

contract ExchangeBusinessLogic is OwnedContract, Module{
    using SafeMath for uint256;

    uint internal closingTime; // End of token creation, in Unix time
    ///0.15 ether = 150000000000000000 weis
    uint256 internal weisPerToken = 150000000000000000; /// It's the number of token per ether.
    /// It's the number of weis that is allowed for the laws authorities in Spain. 5 ethers = 5000000000000000000
    uint256 internal limitationOfWeisInAccount = 5000000000000000000;

    constructor(uint256 _weisPerToken) public
    {
        weisPerToken = _weisPerToken;
    }

    /**
    * notice Increase the time for buy tokens
    * params end of the token creation, in Unix time
    */
    function makeCapitalIncrease(uint _closingTime, uint256 _weisPerToken) public owned
    {
        SetClosingTime(_closingTime);
        SetWeisPerToken(_weisPerToken);
    }

    /**
    * notice Set the closing time, for increasing the capital.
    * params _closingTime, it's the time in unix.
    */
    function SetClosingTime(uint256 _closingTime) public owned
    {
        closingTime = _closingTime;
    }

    /**
    * notice Set the weis per token, needed when the capital is increasing.
    * params _closingTime, it's the time in unix.
    */
    function SetWeisPerToken(uint256 _weisPerToken) public owned
    {
        weisPerToken = _weisPerToken;
    }

    /**
    * notice Check if the sender can buy tokens
    */
    function CanBuyTokens() public view returns(bool)
    {
        return now < closingTime;
    }

    /**
    * notice Check if value is greater than minimum weis per token
    * params value is the value to check
    */
    function IsValueGreater(uint256 value) public view returns(bool)
    {
        return value >= weisPerToken;
    }

    /**
    * notice Check if the limitaton of weis is reached for the investor.
    * params weiGivens is the weis given for the investors
    * params value is the value for the sender.
    */
    function IsLimitationReached(uint256 weiGivens, uint256 value) public view returns(bool)
    {
        return ((weiGivens + value) > limitationOfWeisInAccount);
    }

    /**
    * notice Check if the limitation of 51% percentaje is reached
    * params tokens that have the sender currently
    * params totalSupply amount of tokens in the exchange.
    */ 
    function IsLimitationOfPercentage(uint256 tokens, uint256 totalSupply) public view returns(bool)
    {
        return SafeMath.div(SafeMath.mul(totalSupply,49), 100) < tokens;
    }

    /**
    * notice Get the estimation of token depending the end of time.
    * params amount is the amount to get the estimation of tokens.
    * returns the number of tokens for this amount.
    */
    function getEstimationOfTokens(uint256 amount) public view returns(uint256)
    {
        uint256 divisorValue = divisor();
        uint256 tokens = SafeMath.rdiv(amount, weisPerToken);
        uint256 percentage = SafeMath.rdiv(20, divisorValue);
        return SafeMath.rfloor(SafeMath.mul(tokens,percentage));
    }

    /**
    * notice Get the estimation of weis depending the end of time.
    * params amount is the amount to get the estimation of tokens.
    * returns the number of tokens for this amount.
    */
    function getEstimationOfWeis(uint256 tokens) public view returns(uint256)
    {
        uint256 divisorValue = divisor();
        uint256 amount = SafeMath.rmul(tokens, weisPerToken);        
        uint256 percentage = SafeMath.rdiv(divisorValue, 20);
        return SafeMath.floor(SafeMath.mul(amount, percentage));
    }

    function TimeToFinish() public view returns (uint256)
    {
        uint256 lessTime = closingTime - now;
        if(lessTime < 0)
            lessTime = 0;
        return lessTime;
    }

    function divisor() internal view returns(uint) {
        // The number of (base unit) tokens per wei is calculated
        // as `msg.value` * 20 / `divisor`
        // The fueling period starts with a 1:1 ratio
        if (closingTime - 2 weeks > now) {
            return 20;
        // Followed by 10 days with a daily creation rate increase of 5%
        } else if (closingTime - 4 days > now) {
            return (20 + (now - (closingTime - 2 weeks)) / (1 days));
        // The last 4 days there is a constant creation rate ratio of 1:1.5
        } else {
            return 30;
        }
    }
}