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
    const RATE = new BigNumber(1000);
    const GOAL = ether(5);
    const CAP = ether(50);

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

    it('should create crowdsale with correct parameters', async function () {
        this.crowdsale.should.exist;
        this.token.should.exist;

        (await this.crowdsale.openingTime()).should.be.bignumber.equal(OPENING_TIME);
        (await this.crowdsale.closingTime()).should.be.bignumber.equal(CLOSING_TIME);
        (await this.crowdsale.rate()).should.be.bignumber.equal(RATE);
        (await this.crowdsale.wallet()).should.be.equal(WALLET);
        (await this.crowdsale.goal()).should.be.bignumber.equal(GOAL);
        (await this.crowdsale.cap()).should.be.bignumber.equal(CAP);
    });

    it('should not accept payments before start', async function () {
        await this.crowdsale.buyTokens(INVESTOR, { from: INVESTOR, value: ether(1) }).should.be.rejectedWith(EVMRevert);
    });

    it('should be more than 10 DBT and should not accept more than hardcap', async function () {
        await increaseTimeTo(OPENING_TIME);
        await this.crowdsale.buyTokens(INVESTOR, { from: INVESTOR, value: new web3.BigNumber(1) }).should.be.rejectedWith(EVMRevert);
        await this.crowdsale.buyTokens(INVESTOR, { from: INVESTOR, value: CAP.add(ether(1)) }).should.be.rejectedWith(EVMRevert);
    });

    it('test bonus period 1 with 15%', async function () {
        const investmentAmount = ether(1);
        const ratedTokenAmount = RATE.mul(investmentAmount);
        const tokenAmountWithBonuses = ratedTokenAmount.add(ratedTokenAmount.mul(15).div(100));
        const oldBalance = await this.token.balanceOf(INVESTOR);
        await this.crowdsale.buyTokens(INVESTOR, { from: INVESTOR, value: investmentAmount }).should.be.fulfilled;
        const newBalance = await this.token.balanceOf(INVESTOR);
        newBalance.sub(oldBalance).should.be.bignumber.equal(tokenAmountWithBonuses);
    });

    it('test bonus period 2 with 7,5%', async function () {
        await increaseTimeTo(OPENING_TIME + duration.days(7)); // + 7 days
        const investmentAmount = ether(1);
        const ratedTokenAmount = RATE.mul(investmentAmount);
        const tokenAmountWithBonuses = ratedTokenAmount.add(ratedTokenAmount.mul(75).div(1000));
        const oldBalance = await this.token.balanceOf(INVESTOR);
        await this.crowdsale.buyTokens(INVESTOR, { from: INVESTOR, value: investmentAmount }).should.be.fulfilled;
        const newBalance = await this.token.balanceOf(INVESTOR);
        newBalance.sub(oldBalance).should.be.bignumber.equal(tokenAmountWithBonuses);
    });

    it('should not finalize if goal not reached and should reject payments after end', async function () {
        await this.crowdsale.finalize({ from: OWNER }).should.be.rejectedWith(EVMRevert);
        await increaseTimeTo(AFTER_CLOSING_TIME);
        await this.crowdsale.buyTokens(INVESTOR, { from: INVESTOR, value: ether(1) }).should.be.rejectedWith(EVMRevert);
    });

    it('should transfer token owner to origin address', async function () {
        await this.crowdsale.finalize({ from: OWNER }).should.be.fulfilled;
        (await this.token.owner()).should.be.equal(OWNER);
    });
});
