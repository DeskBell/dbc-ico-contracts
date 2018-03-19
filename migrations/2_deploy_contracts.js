var DeskBellPresale = artifacts.require('../contracts/DeskBellPresale.sol');
var DeskBellToken = artifacts.require('../contracts/DeskBellToken.sol');

module.exports = function (deployer) {
    return deployer
        .then(() => {
            return deployer.deploy(DeskBellToken);
        })
        .then(() => {
            return deployer.deploy(DeskBellPresale, DeskBellToken.address);
        });
};