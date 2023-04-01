// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "src/CelestiaNFT.sol";

contract CelestiaNFTTest is Test {
    using stdStorage for StdStorage;

    CelestiaNFT private nftContract;

    function setUp() public {
        // Deploy NFT contract
        nftContract = new CelestiaNFT(
            "Celestia NFT",
            "CEL",
            "https://gateway.pinata.cloud/ipfs/QmRZEeP6Dn6UUayRskFKVRCowui9LBpfCdmja1agmCUkiR"
        );
    }

    function testMint() public {
        nftContract.mintNft{value: nftContract.price() * 5}(5);
        assertEq(nftContract.balanceOf(address(this)), 5);
        assertEq(nftContract.totalSupply(), 5);
    }

    function testGetTokenIds() public {
        // Mint 3 tokens to a test address
        nftContract.mintNft{value: 0.45 ether}(3);

        // Check that the test address owns those tokens
        uint256[] memory tokenIds = nftContract.getTokenIds(address(this));
        assertEq(tokenIds.length, 3);
        assertEq(tokenIds[0], 1);
        assertEq(tokenIds[1], 2);
        assertEq(tokenIds[2], 3);
    }

    function testTransferTokens() public {
        // Mint 3 token to the test deployer
        nftContract.mintNft{value: 0.45 ether}(3);
        uint256[] memory tokenIds = nftContract.getTokenIds(address(this));
        assertEq(tokenIds.length,3);

        uint256 tokenId = tokenIds[0];
        console.logUint(tokenId);

        // Approve another address to transfer the token
        address testAddress = address(0x123);
        nftContract.approve(testAddress, tokenId);

        // Transfer the token to the new address
        nftContract.transferTokens(testAddress, tokenId);

        // Check that the token was transferred successfully
        assertEq(nftContract.getTokenIds(address(this)).length, 2);
        assertEq(nftContract.getTokenIds(testAddress).length, 1);
        assertEq(nftContract.ownerOf(tokenId), testAddress);
    }
}
