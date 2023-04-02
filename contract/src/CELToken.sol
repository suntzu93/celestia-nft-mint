// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;
import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract CELToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Celestia", "CEL") {
        _mint(msg.sender, initialSupply);
    }
}