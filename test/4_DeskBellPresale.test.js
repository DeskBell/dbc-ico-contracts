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
    const CLOSING_TIME = 1523275200;
    const AFTER_CLOSING_TIME = CLOSING_TIME + duration.minutes(1);

    const OWNER = accounts[0];
    const INVESTOR = accounts[1];
    const WALLET = accounts[2];

    before(async function () {
        await advanceBlock();
        this.token = await DeskBellToken.new();
        this.crowdsale = await DeskBellPresale.new(this.token.address);
        await this.token.transferOwnership(this.crowdsale.address);
    });

    it('allow finalization with refund if goal not reached', async function () {
        const investmentAmount = ether(1);
        const beforeFinalization = await web3.eth.getBalance(INVESTOR);
        await increaseTimeTo(OPENING_TIME);
        await this.crowdsale.sendTransaction({ value: investmentAmount, from: INVESTOR, gasPrice: 0 }).should.be.fulfilled;
        await increaseTimeTo(AFTER_CLOSING_TIME);
        await this.crowdsale.finalize({ from: OWNER });
        await this.crowdsale.claimRefund({ from: INVESTOR, gasPrice: 0 }).should.be.fulfilled;
        const afterFinalization = await web3.eth.getBalance(INVESTOR);
        await beforeFinalization.should.be.bignumber.equal(afterFinalization);
    });
});
