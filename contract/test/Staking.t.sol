pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/CelestiaNFT.sol";
import "../src/CELToken.sol";
import "../src/Staking.sol";

contract StakingTest is Test {
    CelestiaNFT public nft;
    CELToken public celToken;
    Staking public staking;

    function setUp() public {
        celToken = new CELToken(100000000000000000000000);
        nft = new CelestiaNFT(
            "Celestia NFT",
            "CEL",
            "https://gateway.pinata.cloud/ipfs/QmRZEeP6Dn6UUayRskFKVRCowui9LBpfCdmja1agmCUkiR"
        );

        staking = new Staking(address(celToken), address(nft));

        //        celToken.transfer(address(staking),10000000000000000000000);
    }

    function testStake() public {
        uint256 tokenId = 1;
        uint256 tokenId1 = 2;
        uint256 tokenId2 = 3;
        nft.mintNft{value : nft.price() * 5}(5);
        nft.approve(address(staking), tokenId);
        nft.approve(address(staking), tokenId1);
        nft.approve(address(staking), tokenId2);
        staking.stake(tokenId);
        staking.stake(tokenId1);
        staking.stake(tokenId2);

        uint256[] memory stakingIds = staking.getStakingNFTs(address(this));
        assertEq(stakingIds.length, 3);
    }

    function testUnstake() public {
        uint256 tokenId = 1;
        nft.mintNft{value : nft.price() * 5}(5);
        nft.approve(address(staking), tokenId);
        staking.stake(tokenId);
        staking.unStake(tokenId);
        uint256[] memory stakingIds = staking.getStakingNFTs(address(this));
        assertEq(stakingIds.length, 0);
    }

    function testGetStakingNFTs() public {
        uint256 tokenId1 = 1;
        uint256 tokenId2 = 2;
        nft.mintNft{value : nft.price() * 5}(5);
        nft.approve(address(staking), tokenId1);
        nft.approve(address(staking), tokenId2);
        staking.stake(tokenId1);
        staking.stake(tokenId2);
        uint256[] memory stakingNFTs = staking.getStakingNFTs(address(this));
        assertEq(stakingNFTs.length, 2);
        assertEq(stakingNFTs[0], 1);
        assertEq(stakingNFTs[1], 2);
    }

    function testGetPendingRewards() public {
        uint256 tokenId1 = 1;
        uint256 tokenId2 = 2;
        uint256 tokenId3 = 3;
        nft.mintNft{value : nft.price() * 5}(5);
        nft.approve(address(staking), tokenId1);
        nft.approve(address(staking), tokenId2);
        vm.warp(1641070800);
        staking.stake(tokenId1);
        staking.stake(tokenId2);
        // plus 2 minute
        vm.warp(1641070920);
        //[[1, 10000000000000000000], [2, 10000000000000000000]]
        uint256[][] memory rewards = staking.getPendingRewards(address(this));
        assertEq(rewards.length, 2);
        assertEq(rewards[0][1], 1 * 10 ** 18);
        assertEq(rewards[1][1], 1 * 10 ** 18);

        nft.approve(address(staking), tokenId3);
        staking.stake(tokenId3);
        // plus 3 minutes
        vm.warp(1641070980);
        //[[1, 250000000000000000000], [2, 250000000000000000000], [3,150000000000000000000]]
        uint256[][] memory newRewards = staking.getPendingRewards(address(this));
        assertEq(newRewards.length, 3);
        assertEq(newRewards[0][1], 3 * 5 * 10 ** 17);
        assertEq(newRewards[1][1], 3 * 5 * 10 ** 17);
        assertEq(newRewards[2][1], 1 * 5 * 10 ** 17);
    }

    function testClaimPendingRewards() public {
        celToken.transfer(address(staking), 10000000000000000000000);

        uint256 tokenId1 = 1;
        nft.mintNft{value : nft.price() * 5}(5);
        nft.approve(address(staking), tokenId1);
        vm.warp(1641070800);
        staking.stake(tokenId1);
        // plus 2 minutes
        vm.warp(1641070920);
        // set balance for owner address is 1 eth
        uint256 balanceBefore = celToken.balanceOf(address(this));
        staking.claimPendingReward();
        //balance should increase 10 CEL
        assertEq(celToken.balanceOf(address(this)), balanceBefore + 2 * 5 * 10 ** 17);
    }
}
