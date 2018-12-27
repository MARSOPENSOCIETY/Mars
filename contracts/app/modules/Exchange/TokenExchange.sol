// solium-disable linebreak-style
pragma solidity ^0.4.24;

import "../token/Token.sol";
import "../../../kernel/Module.sol";
import "../../../common/OwnedContract.sol";
import "./ExchangeInvestorsControllers.sol";
import "./ExchangeBusinessLogic.sol";
import "../../../common/BlackListValidator.sol";

/** 
* author: Rafael Piernagorda (https://github.com/AtreyuGreen)
* notice: Define methods for checking contract parameters. Based on https://github.com/aragon/aragonOS/blob/dev/contracts/common/IsContract.sol
*/

contract TokenExchange is OwnedContract,Module, Token, ExchangeInvestorsController, BlackListValidator{

    event CreatedToken(address indexed to, uint amount);

    constructor(
        string _name, 
        string _symbol, 
        uint8 _decimals, 
        uint256 _totalSupply
    ) public 
      Token(_name, _symbol, _decimals, _totalSupply)
      OwnedContract(msg.sender) 
    {
    }

    /**
    * notice Exchange ethers for tokens
    * returns sucess
    */
    function buyToken() public isNotInBlackList(msg.sender) payable returns (bool success) 
    {
        ExchangeBusinessLogic businessLogic = getBusinessLogic();
        uint finalTokens = getEstimationOfTokens(msg.value) + balances[msg.sender];

        require(businessLogic.CanBuyTokens(), "Time is over for creating tokens");
        require(businessLogic.IsValueGreater(msg.value), "Value is lower than min weis per token");
        require(!businessLogic.IsLimitationReached(GiveInvestmentByAddress(msg.sender), msg.value), "Limitation of weis is reached.");
        require(!businessLogic.IsLimitationOfPercentage(finalTokens, _totalSupply), "Address can get more than 49%");

        if(sendTokens(msg.sender, msg.value))
        {
            transferFunds(owner, msg.value);
            SetInvestment(msg.sender, msg.value);        
            emit CreatedToken(msg.sender, getEstimationOfTokens(msg.value));
        }
    }

    /**
    * notice Will give tokens to specific sender, with an import in weis. 
    *        That is used for rewards someone with tokens for him/her works
    * params send Address to send the token
    * params weis number of weis for calculate the amount of tokens to give.
     */
    function GiveTokens(address send, uint256 weis) public owned isNotInBlackList(send) payable returns (bool success)
    {
        return sendTokens(send, weis);
    }

    /**
    * notice Transfer token from sender to the _to address. Checking is in into the blacklist o can get more
    * param _to Address where the token are going to be transfer
    * param _value Amount of tokens to transfer
    * return If the transfer were done or not.
    */
    function transfer(address _to, uint256 _value) public isNotInBlackList(_to) returns (bool) {
        uint finalTokens = _value + balances[_to];
        ExchangeBusinessLogic businessLogic = getBusinessLogic();
        require(!businessLogic.IsLimitationOfPercentage(finalTokens, _totalSupply), "Address can get more than 49%");
        SetInvestor(_to);
        return super.transfer(_to, _value);        
    }

    /**
    * notice Transfer token from sender to the _to address. Checking is in into the blacklist o can get more
    * param _to Address where the token are going to be transfer
    * param _value Amount of tokens to transfer
    * return If the transfer were done or not.
    */
    function transfer(address _to, uint _value, bytes _data) public isNotInBlackList(_to) {
        uint finalTokens = _value + balances[_to];
        ExchangeBusinessLogic businessLogic = getBusinessLogic();
        require(!businessLogic.IsLimitationOfPercentage(finalTokens, _totalSupply), "Address can get more than 49%");
        SetInvestor(_to);
        super.transfer(_to,_value,_data);
    }

    /**
    * notice Transfer token from address _from to the _to address. Checking is in into the blacklist o can get more
    * param _from Address where the tokens are stored.
    * param _to Address where the token are going to be transfer
    * param _value Amount of tokens to transfer
    * return If the transfer were done or not.
    */ 
    function transferFrom(address _from, address _to, uint256 _value) public owned isNotInBlackList(_to) returns (bool) {
        uint finalTokens = _value + balances[_to];
        ExchangeBusinessLogic businessLogic = getBusinessLogic();
        require(!businessLogic.IsLimitationOfPercentage(finalTokens, _totalSupply), "Address can get more than 49%");
        SetInvestor(_to);
        return super.transferFrom(_from,_to,_value);
    }

    /**
    * notice It send the tokens to the tokenholder. 
    * params _tokenHolder Address to send the tokens
    * params _weis amount of weis used for calculate the tokens to send
     */
    function sendTokens(address _tokenHolder, uint256 _weis) private returns (bool sucesss)
    {
        ExchangeBusinessLogic businessLogic = getBusinessLogic();
        require(businessLogic.IsValueGreater(_weis), "Value is lower than min weis per token");

        //Hago una estimación de los tokens y los paso a su balance.
        uint256 token = getEstimationOfTokens(_weis);
        require(token > 0, "Estimation tokens should be greater than zero");
        if(businessLogic.IsLimitationOfPercentage(balances[_tokenHolder]+token, _totalSupply+token))
            revert("Sender reach the 49% of tokens");

        SetInvestor(_tokenHolder);
        balances[_tokenHolder] += token;
        createdTokens += token;
        _totalSupply += token;
        return true;
    }

    /**
    * notice Get the estimation of tokens depending the amount
    * params amount Number of weis for give the estimation.
    * returns Number of tokens 
     */
    function getEstimationOfTokens(uint256 amount) public view returns(uint256)
    {
        ExchangeBusinessLogic businessLogic = getBusinessLogic();
        return businessLogic.getEstimationOfTokens(amount);
    }

    /**
    * notice Get the estimation of amount depending the tokens
    * params amount Number of weis for give the estimation.
    * returns Number of tokens 
     */
    function getEstimationOfWeis(uint256 tokens) public view returns(uint256)
    {
        ExchangeBusinessLogic businessLogic = getBusinessLogic();
        return businessLogic.getEstimationOfWeis(tokens);
    }


    /**
    * notice Get the time to finish
    * returns Time to finish in milliseconds
     */
    function timeToFinish() public view returns(uint256)
    {
        ExchangeBusinessLogic businessLogic = getBusinessLogic();
        return businessLogic.TimeToFinish();
    }

    /**
    * notice Transfer fund to send. Remember include the transfer to fund into the msg.value
    * params toSend Address to transfer the amount
    * params amount Number of weis to transfer.
     */
    function transferFunds(address toSend, uint256 amount) private
    {
        toSend.transfer(amount);
    }
    
    /**
    * notice Give the business Logic used in the contract.
     */
    function getBusinessLogic() internal view returns(ExchangeBusinessLogic)
    {
        return ExchangeBusinessLogic(address(load("Mars.App.TokenExchange.BusinessLogic")));
    }    
}
