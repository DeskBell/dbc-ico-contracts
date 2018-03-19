pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";

/**
 * @title DeskBellPresale
 * @dev Pre-sale contract, with emission limits, with time of sale limits, bonus periods and finalisation
 */
contract DeskBellPresale is CappedCrowdsale, RefundableCrowdsale, MintedCrowdsale {

    function DeskBellPresale(address tokenAddress) public
        Crowdsale(1000, 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef, MintableToken(tokenAddress))
        CappedCrowdsale(50 ether)
        TimedCrowdsale(1522065600, 1523275200)
        RefundableCrowdsale(5 ether)
    {
        require(goal <= cap);
    }

    /**
     * @dev minimum limit of purchase
     */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
        super._preValidatePurchase(_beneficiary, _weiAmount);
        require(_weiAmount >= (1 ether / rate).mul(10));
    }

    /**
     * @dev calculation of the bonuses in two periods
     */
    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
        uint256 tokens = _weiAmount.mul(rate);
        uint256 bonusTokens = 0;
        if (now < openingTime.add(7 days)) {
            bonusTokens = tokens.mul(15).div(100);
        } else {
            bonusTokens = tokens.mul(75).div(1000);
        }
        return tokens.add(bonusTokens);
    }

    /**
     * @dev overload finalize with condition on goal over hasClosed
     */
    function finalize() onlyOwner public {
        require(!isFinalized);
        require(hasClosed() || goalReached());

        finalization();
        Finalized();

        isFinalized = true;
    }

    /**
     * @dev finalizing contract with returning of ownership to developers address
     */
    function finalization() internal {
        super.finalization();
        MintableToken(token).transferOwnership(0x627306090abaB3A6e1400e9345bC60c78a8BEf57);
    }
}
