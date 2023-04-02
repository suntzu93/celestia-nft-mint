// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import {CelestiaNFT} from "src/CelestiaNFT.sol";
import "../src/CELToken.sol";
import "../src/Staking.sol";

contract CelestialScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        CelestiaNFT nft = new CelestiaNFT("Celestia NFT", "CEL", "https://gateway.pinata.cloud/ipfs/QmRZEeP6Dn6UUayRskFKVRCowui9LBpfCdmja1agmCUkiR");
        CELToken celToken = new CELToken(10000000000 * 10 ** 18);
        new Staking(address(nft), address(celToken));
        vm.stopBroadcast();
    }
}
