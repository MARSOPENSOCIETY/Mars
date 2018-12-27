
const Kernel = artifacts.require("./test/kernel/KernelMock.sol");
const Module1 = artifacts.require("./test/app/Module1.sol");
const Module2 = artifacts.require("./test/app/Module2.sol");


contract('Kernel', function(accounts) {
    let kernel, module1, module2;
    let gasLimit = web3.eth.getBlock("pending").gasLimit-1;
    let deploy = {from:accounts[0], gas:gasLimit};
    let sender = {from:accounts[0]};
    let senderWithValue = {from:accounts[0], value:web3.toWei(1, "ether")};
    let invalidSender = {from:accounts[1]};
    let invalidSenderWithValue = {from:accounts[1], value:web3.toWei(1, "ether")};

    // Initial setup
    before(async () => {
        /// Create constants
        kernel = await Kernel.new(deploy);
        module1 = await Module1.new(deploy);
        module2 = await Module2.new(deploy);

        kernel.init();
        module1.setKernel(kernel.address, sender);
        module2.setKernel(kernel.address, sender);
    });

    const registerModule = async (name, address, txsender) => {
        let result = await kernel.registerModuleMock(name, address, txsender);
        let registry = result.logs[0].args;
        return registry.name == name && registry.contractAddress == address;
    }

    const loadModule = async(name, txsender) => {
        return await kernel.loadModuleMock(name, txsender);
    }

    const registerModuleError = async (name, address, txsender, message) => {
        let errorFound = false;
        try
        {
            await registerModule(name, address, txsender);
        }
        catch(error)
        {
            if(error == message);
                errorFound = true;
        }
        return errorFound;
    }

    const loadModuleError = async (name, txsender, message) => {
        let errorFound = false;
        try
        {
            await loadModule(name, txsender);
        }
        catch(error)
        {
            if(error == message);
                errorFound = true;
        }
        return errorFound;
    }

    const InitError = async (name, txsender, message) => {
        let errorFound = false;
        try
        {
            await kernel.init(txsender);
        }
        catch(error)
        {
            if(error == message);
                errorFound = true;
        }
        return errorFound;
    }

    const StopError = async (name, txsender, message) => {
        let errorFound = false;
        try
        {
            await kernel.stop(txsender);
        }
        catch(error)
        {
            if(error == message);
                errorFound = true;
        }
        return errorFound;
    }

    it("Registry module", async function() {
        assert.isTrue(await registerModule('Mars.App.Module', module1.address, sender), 'Module is not register');
    });

    it("Try Registry module with invalid user", async function() {
        assert.isTrue(await registerModuleError('Mars.App.Module', module1.address, invalidSender, "Sender not authorized"), 'Module is not register');
    });

    it("Getting contract details", async function() {
        await registerModule('Mars.App.Module', module1.address, sender);
        assert.equal(await loadModule('Mars.App.Module'), module1.address);
    });

    it("Changing module contract", async function() {
        await registerModule('Mars.App.Module', module1.address, sender);
        assert.equal(await loadModule('Mars.App.Module'), module1.address);
        await registerModule('Mars.App.Module', module2.address, sender);
        assert.equal(await loadModule('Mars.App.Module'), module2.address);
    });

    it("Registring several modules", async function() {
        await registerModule('Mars.App.Module1', module1.address, sender);
        assert.equal(await loadModule('Mars.App.Module1'), module1.address);
        await registerModule('Mars.App.Module2', module2.address, sender);
        assert.equal(await loadModule('Mars.App.Module2'), module2.address);
    });

    it("Registring same module several times with different namespace", async function() {
        await registerModule('Mars.App.Module1', module1.address, sender);
        assert.equal(await loadModule('Mars.App.Module1'), module1.address);
        await registerModule('Mars.App.Module2', module1.address, sender);
        assert.equal(await loadModule('Mars.App.Module2'), module1.address);
    });

    it("Try Registry module with empty namespace", async function() {
        assert.isTrue(await registerModuleError('', module1.address, sender, "Namespace shouldn't be empty"));
    });

    it("Try Registry module with empty address", async function() {
        assert.isTrue(await registerModuleError('', 0x0, sender, "Module address shouldn't be empty"));
    });

    it("Try Registry module with account", async function() {
        assert.isTrue(await registerModuleError('Mars.App.Module2', accounts[1], sender, "Address is not a contract"));
    });

    it("Stopping kernel", async function() {
        await kernel.stop(sender);
        assert.isTrue(await registerModuleError('Mars.App.Module2', sender, sender, "Kernel is freezed"));
        assert.isTrue(await loadModuleError('Mars.App.Module2', sender, "Kernel is freezed"));
    });

    it("Stopping and init kernel", async function() {
        await kernel.stop(sender);
        assert.isTrue(await registerModuleError('Mars.App.Module2', sender, sender, "Kernel is freezed"));
        assert.isTrue(await loadModuleError('Mars.App.Module2', sender, "Kernel is freezed"));

        await kernel.init(sender);
        assert.isTrue(await registerModule('Mars.App.Module', module1.address, sender), 'Module is not register');
        assert.equal(await loadModule('Mars.App.Module'), module1.address);
    });

    it("Stopping kernel", async function() {
        await kernel.stop(sender);
        assert.isTrue(await registerModuleError('Mars.App.Module2', sender, sender, "Kernel is freezed"));
        assert.isTrue(await loadModuleError('Mars.App.Module2', sender, "Kernel is freezed"));
    });

    it("Trying stopping kernel", async function() {
        assert.isTrue(await StopError(invalidSender, "Sender not authorized"));
    });

    it("Trying starting kernel", async function() {
        assert.isTrue(await InitError(invalidSender, "Sender not authorized"));
    });


});
