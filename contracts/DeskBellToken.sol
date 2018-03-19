pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

/**
 * @title DeskBellToken
 * @dev standard ERC20 contract 
 */
contract DeskBellToken is MintableToken {
    string public constant name = "DeskBell Token";
    string public constant symbol = "DBT";
    uint8 public constant decimals = 18;
}