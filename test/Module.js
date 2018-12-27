
const Kernel = artifacts.require("./test/kernel/KernelMock.sol");
const Module1 = artifacts.require("./test/app/Module1.sol");
const Module2 = artifacts.require("./test/app/Module2.sol");
const ParentModule = artifacts.require("./test/app/ParentModule.sol");


contract('Module', function(accounts) {
    let kernel, module1, module2;
    let gasLimit = web3.eth.getBlock("pending").gasLimit-1;
    let deploy = {from:accounts[0], gas:gasLimit};
    let sender = {from:accounts[0]};
    let invalidSender = {from:accounts[1]};

    // Initial setup
    before(async () => {
        /// Create constants
        kernel = await Kernel.new(deploy);
        module1 = await Module1.new(deploy);
        module2 = await Module2.new(deploy);
        parentModule = await ParentModule.new(deploy);

        await kernel.init();
        await kernel.registerModule("Mars.app.Module", module2.address,sender);
    });

    const setKernel = async(kerneladdress, module, txsender)=>{
        let result = await module.setKernel(kerneladdress, txsender);
        result = result.logs[0].args;
        return result.result;
    }

    const setKernelError = async (kerneladdress, module, txsender, message) => {
        let errorFound = false;
        try
        {
            await setKernel(kerneladdress, module, txsender);
        }
        catch(error)
        {
            if(error == message);
                errorFound = true;
        }
        return errorFound;
    }

    const loadModule = async(module, namespace, txsender) => {
        return await module.load(namespace, txsender);
    }

    const loadModuleError = async (module, namespace, txsender, message) => {
        let errorFound = false;
        try
        {
            await loadModule(kerneladdress, module, txsender);
        }
        catch(error)
        {
            if(error == message);
                errorFound = true;
        }
        return errorFound;
    }

    const KillModule = async(module, txsender) => {
        return await module.destroy(txsender);
    }

    const KillModuleError = async (module, txsender, message) => {
        let errorFound = false;
        try
        {
            await KillModule(module, txsender);
        }
        catch(error)
        {
            if(error == message);
                errorFound = true;
        }
        return errorFound;
    }

    it("Setting Kernel", async function() {
        assert.isTrue(await setKernel(kernel.address, module1, sender), 'Kernel cant set');
    });

    it("Using a module inside a contract", async function() {
        await setKernel(kernel.address, parentModule, sender);
        await kernel.registerModule("Mars.app.Module", module1.address,sender);
        let result1 = await parentModule.GetA();
        assert.equal(result1, 1);
        await kernel.registerModule("Mars.app.Module", module2.address,sender);
        let result2 = await parentModule.GetA();
        assert.equal(result2, 2);
    });

    it("Try setting Kernel with invalid sender", async function() {
        assert.isTrue(await setKernelError(kernel.address, module1, invalidSender, 'Sender not authorized.'));
    });

    it("Try setting Kernel with empty kernel", async function() {
        assert.isTrue(await setKernelError(0x0, module1, sender, 'Kernel should be not empty'));
    });

    it("Try setting Kernel is not a contract", async function() {
        assert.isTrue(await setKernelError(accounts[2], module1, sender, 'Address is not a contract'));
    });

    it("Loading module", async function() {
        await setKernel(kernel.address, module1, sender);
        assert.equal(await loadModule(module1, "Mars.app.Module", sender), module2.address);
    });

    it("Loading a not valid namespace", async function() {
        await setKernel(kernel.address, module1, sender);
        assert.isTrue(await loadModuleError(module1, "Mars.app.Module2", sender, "Module is empty"));
    });

    it("Try loading module with empty namespace", async function() {
        await setKernel(kernel.address, module1, sender);
        assert.isTrue(await loadModuleError(module1, "", sender, "Namespace shouldn't be empty"));
    });

    it("Try loading module without kernel", async function() {
        assert.isTrue(await loadModuleError(module1, "Mars.app.Module", sender, "Kernel is not set"));
    });

    it("Try loading module with kernel stopped", async function() {
        await setKernel(kernel.address, module1, sender);
        await kernel.stop(sender);
        assert.isTrue(await loadModuleError(module1, "Mars.app.Module", sender, "Kernel is freezed"));
    });

    it("Killing module", async function() {
        await setKernel(kernel.address, module1, sender);
        await KillModule(module1, sender);
        assert.isTrue(await loadModuleError(module1, "Mars.app.Module", sender, "Kernel is not set"));
    });

    it("Try Killing module with invalid sender", async function() {
        assert.isTrue(await KillModuleError(module1, invalidSender, 'Sender not authorized.'));
    });
});
