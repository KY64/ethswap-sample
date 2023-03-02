const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");
const {expect} = require("chai");

require("chai")
    .use(require("chai-as-promised"))
    .should();

function tokens(n) {
    return web3.utils.toWei(n.toString(), "ether")
}

contract("EthSwap", function (accounts) {
    let token;
    let ethSwap;

    describe("Deployment", async () => {
        it("contract has a name", async () => {
            token = await Token.new();
            let name = await token.name();
            assert.equal(name, "Dumb Token");

            ethSwap = await EthSwap.new(token.address);
            name = await ethSwap.name();
            assert.equal(name, "EthSwap Instant Exchange");
        })
    })

    describe("Testing", async () => {
        it("contract has tokens", async () => {
            const totalSupply = tokens(1000000)
            await token.transfer(ethSwap.address, totalSupply);

            const ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), totalSupply.toString());
        })
    })

    describe("Buy tokens", async () => {
        it("Allows user to instantly purchase token from EthSwap for a fixed price", async () => {
            const result = await ethSwap.buyTokens({from: accounts[1], value: tokens(10)})
            let userBalance = await token.balanceOf(accounts[1]);
            assert.equal(userBalance.toString(), tokens(1000));

            let ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), tokens(999000));

            const event = result.logs[0].args;
            assert.equal(event.account, accounts[1]);
            assert.equal(event.token, token.address);
            assert.equal(event.amount.toString(), tokens(1000));
            assert.equal(event.rate.toString(), await ethSwap.rate())
        })
    })

    describe("Sell tokens", async() => {
        it("Allows user to instantly sell token to EthSwap for a fixed price", async () => {
            let ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), tokens(999000));
            let userBalance = await token.balanceOf(accounts[1]);
            assert.equal(userBalance.toString(), tokens(1000));

            await token.approve(ethSwap.address, tokens(1000), {from: accounts[1]})
            await ethSwap.sellTokens(tokens(1001), {from: accounts[1]}).should.be.rejected;
            const result = await ethSwap.sellTokens(tokens(1000), {from: accounts[1]})
            ethSwapBalance = await token.balanceOf(ethSwap.address);
            assert.equal(ethSwapBalance.toString(), tokens(1000000));
            userBalance = await token.balanceOf(accounts[1]);
            assert.equal(userBalance.toString(), tokens(0));

            const event = result.logs[0].args;
            assert.equal(event.account, accounts[1]);
            assert.equal(event.token, token.address);
            assert.equal(event.amount.toString(), tokens(1000));
            assert.equal(event.rate.toString(), await ethSwap.rate())
        })
    })
})