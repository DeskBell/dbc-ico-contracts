import ether from '../node_modules/zeppelin-solidity/test/helpers/ether';
import { advanceBlock } from '../node_modules/zeppelin-solidity/test/helpers/advanceToBlock';
import { increaseTimeTo, duration } from '../node_modules/zeppelin-solidity/test/helpers/increaseTime';
import EVMRevert from '../node_modules/zeppelin-solidity/test/helpers/EVMRevert';

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

const DeskBellPresale = artifacts.require('DeskBellPresale');
const DeskBellToken = artifacts.require('DeskBellToken');

contract('DeskBellPresale', function (accounts) {
    const GOAL = ether(5);

    const OPENING_TIME = 1522065600;

    const OWNER = accounts[0];
    const INVESTOR = accounts[1];
    const WALLET = accounts[2];

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
        this.token = await DeskBellToken.new();
        this.crowdsale = await DeskBellPresale.new(this.token.address);
        await this.token.transferOwnership(this.crowdsale.address);
    });

    it('allow finalization with transfer funds if goal reached', async function () {
        await increaseTimeTo(OPENING_TIME);
        await this.crowdsale.buyTokens(INVESTOR, { from: INVESTOR, value: GOAL }).should.be.fulfilled;
        const beforeFinalization = await web3.eth.getBalance(WALLET);
        await this.crowdsale.finalize({ from: OWNER });
        const afterFinalization = await web3.eth.getBalance(WALLET);
        await afterFinalization.sub(beforeFinalization).should.be.bignumber.equal(GOAL);
    });
});
