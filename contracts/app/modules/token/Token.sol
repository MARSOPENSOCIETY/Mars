pragma solidity ^0.4.24;   

import "../../../common/SafeMath.sol";
import "../../../common/ContractValidator.sol";
import "./BaseToken.sol";

/** 
* author: Rafael Piernagorda (https://github.com/AtreyuGreen)
* notice: Mars Token used on our applications.
*/

contract Token is BaseToken {
    using SafeMath for uint;     

    mapping (address => uint256) internal balances; ///Balance of investors
    mapping (address => mapping (address => uint256)) internal allowed;

    constructor(string name, string symbol, uint8 decimals, uint256 totalSupply) 
    BaseToken(name, symbol, decimals, totalSupply)
     public {
        balances[msg.sender] = totalSupply;
    }

    /**
    * notice Transfer token from sender to the _to address.
    * param _to Address where the token are going to be transfer
    * param _value Amount of tokens to transfer
    * return If the transfer were done or not.
    */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "You can't transfer to empty address");
        require(balances[msg.sender] >= _value && balances[_to] + _value >= balances[_to], "You can't transfer more tokens that sender have");
        require(!isContract(_to), "You can't transfer to contract");

        balances[msg.sender] = SafeMath.sub(balances[msg.sender], _value);
        balances[_to] = SafeMath.add(balances[_to], _value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
   
    /**
    * notice Transfer token from sender to the _to address.
    * param _to Address where the token are going to be transfer
    * param _value Amount of tokens to transfer
    * return If the transfer were done or not.
    */
    function transfer(address _to, uint _value, bytes _data) public {
        require(_value > 0, "Value should be greater than 0.");
        
        if(isContract(_to)) {
            ERC223ReceivingContract receiver = ERC223ReceivingContract(_to);
            receiver.tokenFallback(msg.sender, _value, _data);
        }
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value, _data);
    }

    /**
    * notice Transfer token from address _from to the _to address.
    * param _from Address where the tokens are stored.
    * param _to Address where the token are going to be transfer
    * param _value Amount of tokens to transfer
    * return If the transfer were done or not.
    */ 
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "You can't transfer to contract");
        require(balances[msg.sender] >= _value && balances[_to] + _value >= balances[_to], "You can't transfer more tokens that sender have");
        require(!isContract(_to), "You can't transfer to contract");
        require(_value <= allowed[_from][msg.sender], "Value is lower than allowed");

        balances[_from] = SafeMath.sub(balances[_from], _value);
        balances[_to] = SafeMath.add(balances[_to], _value);
        allowed[_from][msg.sender] = SafeMath.sub(allowed[_from][msg.sender], _value);
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    /**
    * notice Check if the address is a contract
    * param _addr Address to check
    * return If the address has got code length or not.
    */
    function isContract(address _addr) private returns (bool is_contract) {
        ContractValidator validator = new ContractValidator();
        return validator.isContract(_addr);
    }

    /**
    * notice Return the balance of tokens of the address
    * param _owner Address to check
    * return Amount of tokens that address has.
    */
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }    

    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }

    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        allowed[msg.sender][_spender] = SafeMath.add(allowed[msg.sender][_spender], _addedValue);
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue)
          allowed[msg.sender][_spender] = 0;
        else
          allowed[msg.sender][_spender] = SafeMath.sub(oldValue, _subtractedValue);
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }
}