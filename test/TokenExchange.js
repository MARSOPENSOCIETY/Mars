
const TokenExchange = artifacts.require("./test/app/modules/Exchange/TokenExchangeMock.sol");
const BLTokenExchange = artifacts.require("./test/app/modules/Exchange/BusinessLogicTokenExchangeMock.sol");
const Kernel = artifacts.require("./test/kernel/KernelMock.sol");

contract('TokenExchange', function(accounts) {
    let tokenExchange, blTokenExchange, tokenName, symbol, decimals, totalSupply;
    let gasLimit = web3.eth.getBlock("pending").gasLimit-1;
    let deploy = {from:accounts[0], gas:gasLimit};
    let sender = {from:accounts[0]};
    let weisPerToken = 100000000000000000;

    // Initial setup
    before(async () => {
        /// Create constants
        tokenName = "TokenTest";
        symbol = "TKT";
        decimals = 3;
        totalSupply = 1000;
        
        blTokenExchange = await BLTokenExchange.new(weisPerToken, deploy);
        tokenExchange = await TokenExchange.new(tokenName, symbol, decimals, totalSupply, deploy);
        kernel = await Kernel.new(deploy);
        await kernel.init();
        await kernel.registerModule("Mars.App.TokenExchange.BusinessLogic", blTokenExchange.address,sender);
        await tokenExchange.setKernel(kernel.address, sender);
        await blTokenExchange.makeCapitalIncrease(1554076800, weisPerToken, sender);
    });

    const cleanAccounts = async() => {
        for(i=1; i<20; i++)
            await tokenExchange.Testing_CleanAccount(accounts[i]);
    };

    
    const buyToken = async(sender, amount_ether) => {
        amount_ether = web3.toWei(amount_ether, "ether");
        let tx = { from: sender, value: amount_ether };
        let expectedTokens = await tokenExchange.getEstimationOfTokens(amount_ether);
        let result = await tokenExchange.buyToken(tx);
        result =result.logs[0].args; 
        assert.equal(result.to, sender);
        assert.equal(result.amount.toNumber(), expectedTokens.toNumber());
    };

    const buyTokenError = async (sender, amount, message) => {
        let errorFound = false;
        try
        {
            await buyToken(sender,amount);
        }
        catch(error)
        {
            if(error == message);
                errorFound = true;
        }
        return errorFound;
    }

    const givenToken = async(to, amount_ether, sender) => {
        amount_ether = web3.toWei(amount_ether, "ether");
        let tx = sender;
        await tokenExchange.GiveTokens(to, amount_ether, tx);
    };

    const givenTokenError = async (to, amount, sender, message) => {
        let errorFound = false;
        try
        {
            await givenToken(to,amount, sender);
        }
        catch(error)
        {
            if(error == message);
                errorFound = true;
        }
        return errorFound;
    }

    const clean = async(account) => {
        tokenExchange.Testing_CleanAccount(account);
    }

    const transfer = async(address, amount, txsender) => {
        return await tokenExchange.transfer(address, amount, txsender);
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
        return await tokenExchange.transferFrom(from, to, amount, txsender);
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

    
    
    it("Buying tokens", async function() {
        await beforeAction();
        let senderAccounts = accounts[1];
        clean(senderAccounts);
        let initial_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        await buyToken(senderAccounts, 1);
        let final_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance, 10);
    });

    it("Buying tokens checking sender accounts.", async function() {
        await beforeAction();
        let senderAccounts = accounts[1];
        //clean(senderAccounts);
        let initial_balance = (await web3.eth.getBalance(accounts[0])).toNumber();
        await buyToken(senderAccounts, 1);
        let final_balance = (await web3.eth.getBalance(accounts[0])).toNumber();
        let balance = final_balance - initial_balance;  
        assert.equal(balance, web3.toWei(1, "ether"));
    });

    it("Buying tokens checking totalSupply.", async function() {
        await beforeAction();
        let senderAccounts = accounts[1];
        clean(senderAccounts);
        let initial_balance = (await tokenExchange.totalSupply()).toNumber();
        await buyToken(senderAccounts, 1);
        let final_balance = (await tokenExchange.totalSupply()).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance, 10);
    });

    it("Buying tokens check investor address and balance.", async function() {
        await beforeAction();
        let senderAccounts = accounts[2];
        clean(senderAccounts);
        let WeisInitialBalance = (await tokenExchange.Testing_GiveInvestmentByAddress(senderAccounts)).toNumber();
        let TokenInitialBalance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();

        await buyToken(senderAccounts, 1);
        await buyToken(senderAccounts, 1);

        let WeisFinalBalance = (await tokenExchange.Testing_GiveInvestmentByAddress(senderAccounts)).toNumber();
        let TokenFinalBalance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();

        let weis_final_balance = WeisFinalBalance - WeisInitialBalance;
        let token_final_balance = TokenFinalBalance - TokenInitialBalance;

        assert.equal(weis_final_balance, web3.toWei(2, "ether"));
        assert.equal(token_final_balance, 20);
    });

    it("Buying tokens checking that address is in investors", async function(){
        await beforeAction();
        let senderAccounts = accounts[13];
        let amount_tokens = 1;
        await buyToken(senderAccounts, 1);
        assert.equal(await tokenExchange.Testing_IsInvestor(senderAccounts), true);
    });

    it("Buying tokens with less weis than minimum", async function() {
        await beforeAction();
        let senderAccounts = accounts[8];
        clean(senderAccounts);
        assert.equal(await buyTokenError(senderAccounts, 0.001, "Value is lower than min weis per token"), true);
    });


    it("Buying tokens several times and more than 5 etheres", async function() {
        await beforeAction();
        let senderAccounts = accounts[4];
        clean(senderAccounts);
        await buyToken(senderAccounts, 4);
        assert.equal(await buyTokenError(senderAccounts, 4, "Limitation of weis is reached."), true);
    });

    it("Buying tokens with more than 49%", async function() {
        await beforeAction();
        let senderAccounts = accounts[15];
        clean(senderAccounts);
        await tokenExchange.Testing_fillWithPercentage(senderAccounts, 49);
        assert.equal(await buyTokenError(senderAccounts, 1, "Address can get more than 49%."), true);
    });

    it("Buying tokens with more than 47%", async function() {
        await beforeAction();
        let senderAccounts = accounts[16];
        clean(senderAccounts);
        await tokenExchange.Testing_fillWithPercentage(senderAccounts, 47);

        let initial_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        await buyToken(senderAccounts, 1);
        let final_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance, 10);
    });


    it("Buying tokens off of time", async function() {
        await beforeAction();
        let senderAccounts = accounts[4];
        clean(senderAccounts);
        await blTokenExchange.makeCapitalIncrease(1054076800, 100000000000000000, sender);
        assert.equal(await buyTokenError(senderAccounts, 1, "Time is over for creating tokens"), true);
        await blTokenExchange.makeCapitalIncrease(1554076800, 100000000000000000, sender);
    });  

    it("Buying tokens close to time", async function() {
        await beforeAction();
        let senderAccounts = accounts[9];
        clean(senderAccounts);
        let current = Math.round((new Date()).getTime() / 1000)+100;
        await blTokenExchange.makeCapitalIncrease(current, 100000000000000000, sender);
        let initial_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        await buyToken(senderAccounts, 1.5);
        let final_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance, 10);
        await blTokenExchange.makeCapitalIncrease(1554076800, 100000000000000000, sender);
    }); 
    
    it("Buying tokens account in blacklist", async function() {
        await beforeAction();
        let senderAccounts = accounts[5];
        clean(senderAccounts);
        await tokenExchange.Add(senderAccounts, sender);
        assert.equal(await buyTokenError(senderAccounts, 1, "Sender is in the blacklist"), true);
    });

    it("Buying tokens account in blacklist and remove from blacklist", async function() {
        await beforeAction();
        let senderAccounts = accounts[5];
        clean(senderAccounts);
        await tokenExchange.Add(senderAccounts, sender);
        assert.equal(await buyTokenError(senderAccounts, 1, "Sender is in the blacklist"), true);
        await tokenExchange.Remove(senderAccounts, sender);

        let initial_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        await buyToken(senderAccounts, 1);
        let final_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance, 10);
    });

    ///GIVEN TOKEN
    it("Given tokens", async function() {
        await beforeAction();
        let senderAccounts = accounts[1];
        clean(senderAccounts);
        let initial_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        await givenToken(senderAccounts, 1, sender);
        let final_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance, 10);
    });
    
    it("Given tokens checking sender accounts.", async function() {
        await beforeAction();
        let senderAccounts = accounts[1];
        clean(senderAccounts);
        let initial_balance = (await web3.eth.getBalance(accounts[0])).toNumber();
        await givenToken(senderAccounts, 1, sender);
        let final_balance = (await web3.eth.getBalance(accounts[0])).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance < 0, true);
    });

    it("Given tokens checking totalSupply.", async function() {
        await beforeAction();
        let senderAccounts = accounts[1];
        clean(senderAccounts);
        let initial_balance = (await tokenExchange.totalSupply()).toNumber();
        await givenToken(senderAccounts, 1, sender);
        let final_balance = (await tokenExchange.totalSupply()).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance, 10);
    });

    it("Given tokens check investor address and balance.", async function() {
        await beforeAction();
        let senderAccounts = accounts[2];
        clean(senderAccounts);
        let TokenInitialBalance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();

        await givenToken(senderAccounts, 1, sender);
        await givenToken(senderAccounts, 1, sender);

        let TokenFinalBalance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        let token_final_balance = TokenFinalBalance - TokenInitialBalance;

        assert.equal(token_final_balance, 20);
    });

    it("Given tokens checking that address is in investors", async function(){
        await beforeAction();
        let senderAccounts = accounts[13];
        let amount_tokens = 1;
        await givenToken(senderAccounts, 1, sender);
        assert.equal(await tokenExchange.Testing_IsInvestor(senderAccounts), true);
    });

    it("Given tokens with less weis than minimum", async function() {
        await beforeAction();
        let senderAccounts=accounts[8];
        clean(senderAccounts);
        assert.equal(await givenTokenError(senderAccounts, 0.001, sender, "Value is lower than min weis per token"), true);
    });

    it("Given tokens with other sender", async function() {
        await beforeAction();
        let senderAccounts=accounts[8];
        clean(senderAccounts);
        assert.equal(await givenTokenError(senderAccounts, 0.001, {from:accounts[8]}, "Sender not authorized."), true);
    });

    it("Given tokens several times and more than 5 etheres", async function() {
        await beforeAction();
        let senderAccounts = accounts[4];
        clean(senderAccounts);
        let TokenInitialBalance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        await givenToken(senderAccounts, 4, sender);
        await givenToken(senderAccounts, 4, sender);
        let TokenFinalBalance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();

        let balance = TokenFinalBalance - TokenInitialBalance;   
        assert.equal(balance, 80);
    });

    it("Given tokens with more than 49%", async function() {
        await beforeAction();
        let senderAccounts = accounts[11];
        clean(senderAccounts);
        await tokenExchange.Testing_fillWithPercentage(senderAccounts, 49);
        assert.equal(await givenTokenError(senderAccounts, 1, sender, "Sender reach the 49% of tokens"), true);
    });

    it("Given tokens with more than 47%", async function() {
        await beforeAction();
        let senderAccounts = accounts[10];
        clean(senderAccounts);
        await tokenExchange.Testing_fillWithPercentage(senderAccounts, 47);

        let initial_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        await givenToken(senderAccounts, 1, sender);
        let final_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance, 10);
    });

    it("Given tokens off of time", async function() {
        await beforeAction();
        let senderAccounts = accounts[4];
        clean(senderAccounts);
        await blTokenExchange.makeCapitalIncrease(1054076800, 100000000000000000, sender);
        let initial_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        await givenToken(senderAccounts, 1.5, sender);
        let final_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance, 10);
        await blTokenExchange.makeCapitalIncrease(1554076800, 100000000000000000, sender);
    }); 
    
    it("Given tokens close to time", async function() {
        await beforeAction();
        let senderAccounts = accounts[4];
        clean(senderAccounts);
        let current = Math.round((new Date()).getTime() / 1000)+100;
        await blTokenExchange.makeCapitalIncrease(current, 100000000000000000, sender);
        let initial_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        await givenToken(senderAccounts, 1.5, sender);
        let final_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance, 10);
        await blTokenExchange.makeCapitalIncrease(1554076800, 100000000000000000, sender);
    });

    it("Given tokens account in blacklist", async function() {
        await beforeAction();
        let senderAccounts = accounts[5];
        clean(senderAccounts);
        await tokenExchange.Add(senderAccounts, sender);
        assert.equal(await givenTokenError(senderAccounts, 1, sender, "Sender is in the blacklist"), true);
    });

    it("Given tokens account in blacklist and remove from blacklist", async function() {
        await beforeAction();
        let senderAccounts = accounts[5];
        clean(senderAccounts);
        await tokenExchange.Add(senderAccounts, sender);
        assert.equal(await givenTokenError(senderAccounts, 1, sender, "Sender is in the blacklist"), true);
        await tokenExchange.Remove(senderAccounts, sender);

        let initial_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        await givenTokenError(senderAccounts, 1, sender);
        let final_balance = (await tokenExchange.balanceOf(senderAccounts)).toNumber();
        let balance = final_balance - initial_balance;   
        assert.equal(balance, 10);
    });  

    /*
    it("Checking the 49% percentage", async function() {
        await buyToken(accounts[1], 1);
        await buyToken(accounts[2], 3);
        await buyToken(accounts[3], 2);
        await buyToken(accounts[4], 4);
        await buyToken(accounts[5], 1);

        console.log("Comienzo: TotalSupply:"+(await tokenExchange.totalSupply()).toNumber());
        let errorFound = false;
        while(!errorFound)
        {
            try
            {
                await givenToken(accounts[13], 2, sender);
                let index = Math.floor((Math.random()*100)%20);
                while(index == 13 || index == 0)
                    index = Math.floor((Math.random()*100)%20);
                await buyToken(accounts[index], 0.1);
                let totalSupply = (await tokenExchange.totalSupply()).toNumber();
                let tokens = (await tokenExchange.balanceOf(accounts[13])).toNumber();
                let percentage = (tokens / totalSupply)*100;

                console.log("TotalSupply:"+totalSupply+" con "+tokens+" tokens totales con un porcentaje de:"+percentage+"%" );
            }
            catch(error)
            {
                errorFound = true;
            }
        }        
    });
    */
    ///TRANSFER
    it("Transfer tokens and balance", async function(){
        await beforeAction();
        let amount_tokens = 1;
        let initial_token = await tokenExchange.balanceOf(accounts[1]);
        await transfer(accounts[1], amount_tokens, sender);
        let final_token = await tokenExchange.balanceOf(accounts[1]);
        assert.equal(final_token-initial_token, amount_tokens);
    });

    ///He de comprobar lo del 48%
    it("Transfer tokens to 48%", async function(){
        await beforeAction();
        let senderAccounts = accounts[11];
        clean(senderAccounts);
        await tokenExchange.Testing_fillWithPercentage(senderAccounts, 49);
        assert.equal(await transferError(senderAccounts, 1, sender, "Sender reach the 49% of tokens"), true);
    });

    ///He de comprobar lo de que esté metido como inversor.
    it("Transfer tokens checking that address is in investors", async function(){
        await beforeAction();
        let senderAccounts = accounts[19];
        let amount_tokens = 1;
        await transfer(senderAccounts, amount_tokens, sender);
        assert.equal(await tokenExchange.Testing_IsInvestor(senderAccounts), true);
    });

    ///He de comprobar lo del blacklist
    it("Transfer tokens account in blacklist", async function() {
        await beforeAction();
        let senderAccounts = accounts[5];
        clean(senderAccounts);
        await tokenExchange.Add(senderAccounts, sender);
        assert.equal(await transferError(senderAccounts, 1, sender, "Sender is in the blacklist"), true);
    });

    it("Transfer tokens to empty address", async function(){
        await beforeAction();
        assert.isTrue(await transferError(0x0, 1, sender, "You can't transfer to empty address"));
    });

    it("Transfer tokens to contract", async function(){
        await beforeAction();
        assert.isTrue(await transferError(tokenExchange.address, 1, sender, "You can't transfer to contract"));
    });

    it("Transfer more tokens than balance", async function(){
        await beforeAction();
        let balance = await tokenExchange.balanceOf(accounts[0]);
        assert.isTrue(await transferError(accounts[1], balance*2, sender, "You can't transfer more tokens that sender have"));
    });

    it("Transfer from tokens and balance", async function(){
        await beforeAction();
        let amount_tokens = 1;
        let initial_token_account0 = await tokenExchange.balanceOf(accounts[0]);
        let initial_token = await tokenExchange.balanceOf(accounts[1]);
        await tokenExchange.approve(accounts[0], amount_tokens, sender);
        await transferFrom(accounts[0], accounts[1], amount_tokens, sender);
        let final_token_account0 = await tokenExchange.balanceOf(accounts[0]);
        let final_token = await tokenExchange.balanceOf(accounts[1]);
        assert.equal(final_token-initial_token, amount_tokens);
        assert.equal(initial_token_account0-final_token_account0, amount_tokens);
    });

        ///He de comprobar lo del 48%
        it("Transfer from tokens to 48%", async function(){
            await beforeAction();
            let senderAccounts = accounts[11];
            clean(senderAccounts);
            await tokenExchange.Testing_fillWithPercentage(senderAccounts, 49);
            assert.equal(await transferFromError(accounts[0], senderAccounts, 1, sender, "Sender reach the 49% of tokens"), true);
        });
    
        ///He de comprobar lo de que esté metido como inversor.
        it("Transfer from tokens checking that address is in investors", async function(){
            await beforeAction();
            let senderAccounts = accounts[20];
            let amount_tokens = 1;
            await tokenExchange.approve(accounts[0], amount_tokens, sender);
            await transferFrom(accounts[0], senderAccounts, amount_tokens, sender);
            assert.equal(await tokenExchange.Testing_IsInvestor(senderAccounts), true);
        });
    
        ///He de comprobar lo del blacklist
        it("Transfer from tokens account in blacklist", async function() {
            await beforeAction();
            let senderAccounts = accounts[5];
            clean(senderAccounts);
            await tokenExchange.Add(senderAccounts, sender);
            assert.equal(await transferFromError(accounts[0],senderAccounts, 1, sender, "Sender is in the blacklist"), true);
        });   
    
    it("Transfer from tokens to empty address", async function(){
        await beforeAction();
        assert.isTrue(await transferFromError(accounts[0], 0x0, 1, sender, "You can't transfer to empty address"));
    });

    it("Transfer from tokens to contract", async function(){
        await beforeAction();
        assert.isTrue(await transferFromError(accounts[0], tokenExchange.address, 1, sender, "You can't transfer to contract"));
    });

    it("Transfer from more tokens than balance", async function(){
        await beforeAction();
        let balance = await tokenExchange.balanceOf(accounts[0]);
        assert.isTrue(await transferFromError(accounts[0], accounts[1], balance*2, sender, "You can't transfer more tokens that sender have"));
    });

    it("Check tokens", async function() {
        await beforeAction();
        let tokens = (await tokenExchange.getEstimationOfTokens(weisPerToken)).toNumber();
        assert.equal(tokens, 1);
        tokens = (await tokenExchange.getEstimationOfTokens(weisPerToken*10)).toNumber();
        assert.equal(tokens, 10);
    });

    it("Check weis", async function() {
        await beforeAction();
        let tokens = (await tokenExchange.getEstimationOfWeis(1)).toNumber();
        assert.equal(tokens, weisPerToken);
        tokens = (await tokenExchange.getEstimationOfWeis(10)).toNumber();
        assert.equal(tokens, weisPerToken*10);
    });

    it("Check tokens closing time", async function() {
        await beforeAction();
        blTokenExchange.Test_SetClosingTime();
        let tokens = (await tokenExchange.getEstimationOfTokens(weisPerToken*1.5)).toNumber();
        assert.equal(tokens, 1);
        blTokenExchange.Test_SetClosingTime();
        tokens = (await tokenExchange.getEstimationOfTokens(weisPerToken*10*1.5)).toNumber();
        assert.equal(tokens, 10);
    });

    it("Check weis closing time", async function() {
        await beforeAction();
        blTokenExchange.Test_SetClosingTime();
        let tokens = (await tokenExchange.getEstimationOfWeis(1)).toNumber();
        assert.equal(tokens, weisPerToken*1.5);
        blTokenExchange.Test_SetClosingTime();
        tokens = (await tokenExchange.getEstimationOfWeis(10)).toNumber();
        assert.equal(tokens, weisPerToken*10*1.5);
    });

});