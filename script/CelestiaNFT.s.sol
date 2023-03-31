// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import {CelestiaNFT} from "src/CelestiaNFT.sol";

contract CelestialScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        new CelestiaNFT("Celestia NFT","CEL","https://gateway.pinata.cloud/ipfs/QmRZEeP6Dn6UUayRskFKVRCowui9LBpfCdmja1agmCUkiR");
        vm.stopBroadcast();
    }
}
