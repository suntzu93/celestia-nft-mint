// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "src/CelestiaNFT.sol";

contract CelestiaNFTTest is Test {
    using stdStorage for StdStorage;

    CelestiaNFT private nftToken;

    function setUp() public {
        // Deploy NFT contract
        nftToken = new CelestiaNFT("Celestia NFT","CEL","https://gateway.pinata.cloud/ipfs/QmRZEeP6Dn6UUayRskFKVRCowui9LBpfCdmja1agmCUkiR");
    }

    function testMint() public {
        nftToken.mintNft{value: nftToken.price() * 5}(5);
        assertEq(nftToken.balanceOf(address(this)), 5);
        assertEq(nftToken.totalSupply(), 5);
    }


    // function testWithdraw() public {
    //     nftToken.mintNft{value: nftToken.price() * 1}(1);
    //     nftToken.withdraw();
    //     assertEq(address(nftToken.vaultAddress()).balance, 0.15 ether);
    //     assertEq(address(nftToken).balance, 0);
    // }


}
