const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

module.exports = async function (deployer) {
    await deployer.deploy(Token);
    const TokenContract = await Token.deployed();

    await deployer.deploy(EthSwap, TokenContract.address);
    const EthSwapContract = await EthSwap.deployed();

    const TotalSupply = (await TokenContract.totalSupply()).toString();
    await TokenContract.transfer(EthSwapContract.address, TotalSupply);
};
