
const Token = artifacts.require("./test/app/modules/token/TokenMock.sol");

contract('Token', function(accounts) {
    let token, name, symbol, decimals, totalSupply;
    let gasLimit = web3.eth.getBlock("pending").gasLimit-1;
    let deploy = {from:accounts[0], gas:gasLimit};
    let sender = {from:accounts[0]};

    // Initial setup
    before(async () => {
        /// Create constants
        tokenName = "TokenTest";
        symbol = "TKT";
        decimals = 3;
        totalSupply = 1000;
        token = await Token.new(tokenName, symbol, decimals, totalSupply, deploy);
    });

    const transfer = async(address, amount, txsender) => {
        return await token.transfer(address, amount, txsender);
    }

    const transferError = async (address, amount, txsender, message) => {
        let errorFound = false;
        try
        {
            await transfer(address, amount, txsender);
        }
        catch(error)
        {
            if(error == message);
                errorFound = true;
        }
        return errorFound;
    }

    const transferFrom = async(from, to, amount, txsender) => {
        return await token.transferFrom(from, to, amount, txsender);
    }

    const transferFromError = async (from, to, amount, txsender, message) => {
        let errorFound = false;
        try
        {
            await transferFrom(from, to, amount, txsender);
        }
        catch(error)
        {
            if(error == message);
                errorFound = true;
        }
        return errorFound;
    }
    
    it("Check name set in token", async function() {
        assert.equal(await token.name(), tokenName);
    });

    it("Check symbol set in token", async function() {
        assert.equal(await token.symbol(), symbol);
    });

    it("Check decimal set in token", async function() {
        assert.equal(await token.decimals(), decimals);
    });

    it("Check totalSupply set in token", async function() {
        assert.equal(await token.totalSupply(), totalSupply);
    });

    it("Check balance of totalSupply", async function() {
        assert.equal(await token.balanceOf(accounts[0]), totalSupply);
    });

    it("Transfer tokens and balance", async function(){
        let amount_tokens = 1;
        let initial_token = await token.balanceOf(accounts[1]);
        await transfer(accounts[1], amount_tokens, sender);
        let final_token = await token.balanceOf(accounts[1]);
        assert.equal(final_token-initial_token, amount_tokens);
    });

    it("Transfer tokens to empty address", async function(){
        assert.isTrue(await transferError(0x0, 1, sender, "You can't transfer to empty address"));
    });

    it("Transfer tokens to contract", async function(){
        assert.isTrue(await transferError(token.address, 1, sender, "You can't transfer to contract"));
    });

    it("Transfer more tokens than balance", async function(){
        let balance = await token.balanceOf(accounts[0]);
        assert.isTrue(await transferError(accounts[1], balance*2, sender, "You can't transfer more tokens that sender have"));
    });

    it("Transfer from tokens and balance", async function(){
        let amount_tokens = 1;
        let initial_token_account0 = await token.balanceOf(accounts[0]);
        let initial_token = await token.balanceOf(accounts[1]);
        await token.approve(accounts[0], amount_tokens, sender);
        await transferFrom(accounts[0], accounts[1], amount_tokens, sender);
        let final_token_account0 = await token.balanceOf(accounts[0]);
        let final_token = await token.balanceOf(accounts[1]);
        assert.equal(final_token-initial_token, amount_tokens);
        assert.equal(initial_token_account0-final_token_account0, amount_tokens);
    });
    
    it("Transfer from tokens to empty address", async function(){
        assert.isTrue(await transferFromError(accounts[0], 0x0, 1, sender, "You can't transfer to empty address"));
    });

    it("Transfer from tokens to contract", async function(){
        assert.isTrue(await transferFromError(accounts[0], token.address, 1, sender, "You can't transfer to contract"));
    });

    it("Transfer from more tokens than balance", async function(){
        let balance = await token.balanceOf(accounts[0]);
        assert.isTrue(await transferFromError(accounts[0], accounts[1], balance*2, sender, "You can't transfer more tokens that sender have"));
    });


});
