// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.3;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./CelestiaNFT.sol";

contract Staking is ERC721Holder {

    CelestiaNFT public nftContract;
    using SafeERC20 for IERC20;
    IERC20 private celTokenContract;
    uint256 private totalTokens;

    uint256 month = 2629743;
    uint256 constant deno = 100;
    uint256 MINUTES = 60;

    struct Staking {
        uint256 tokenId;
        uint256 timestamp;
        bool isActive;
    }

    mapping(address => Staking[]) public stakes;

    constructor(address _token, address _CelestiaNFT) {
        celTokenContract = IERC20(_token);
        nftContract = CelestiaNFT(_CelestiaNFT);
    }

    event Stake(address indexed owner, uint256 id);
    event UnStake(address indexed owner, uint256 id, uint256 rewardTokens);
    event ClaimReward(address indexed owner, uint256 reward);

    // @notice Calculates the reward in CEL tokens for a given duration of time based on the current staking reward rate of 0.5 CEL tokens per minute.
    function calculateReward(uint256 minutesPassed) internal pure returns (uint256) {
        return minutesPassed * 5 * (10 ** 17);
    }

    // @notice Stakes an NFT with the specified token ID. The staked NFT will be locked for a period of time and the user will receive reward tokens.
    //The staking details are saved in the stakes mapping.
    // @param _tokenId : The ID of the NFT being staked.

    function stake(uint256 _tokenId) public {
        require(nftContract.ownerOf(_tokenId) == msg.sender, "You're not owner !");
        stakes[msg.sender].push(Staking(_tokenId, block.timestamp, true));
        nftContract.transferTokens(address(this), _tokenId);
        emit Stake(msg.sender, _tokenId);
    }

    // @notice Unstakes the NFT with the specified token ID, and sends reward tokens back to the user. The reward is calculated based on the time that has passed since the NFT was staked.
    // @param _tokenId The ID of the NFT being unstaked.
    function unStake(uint256 _tokenId) external {
        Staking[] storage userStakes = stakes[msg.sender];
        uint256 index = getUserStakingIndex(userStakes, _tokenId);
        require(index != uint256(uint256(int256(- 1))), "Token not staked");
        Staking storage staking = userStakes[index];
        require(staking.isActive, "Staking is already inactive");

        //calculate how much time this nft has been staked
        uint256 minutesPassed = (block.timestamp - staking.timestamp) / MINUTES;
        uint256 reward = calculateReward(minutesPassed);

        celTokenContract.transfer(msg.sender, reward);
        nftContract.transferTokens(msg.sender, _tokenId);
        staking.isActive = false;

        emit UnStake(msg.sender, _tokenId, reward);
    }

    // @return This function retrieves the user's list of staked NFTs from the stakes mapping and returns an array of their token IDs.
    function getStakingNFTs(address owner) external view returns (uint256[] memory) {
        Staking[] storage userStakes = stakes[owner];
        uint256[] memory stakingTokens = new uint256[](userStakes.length);
        uint256 counter = 0;
        for (uint256 i = 0; i < userStakes.length; i++) {
            if (userStakes[i].isActive) {
                stakingTokens[counter] = userStakes[i].tokenId;
                counter++;
            }
        }
        // Resize the array to remove any empty elements
        assembly {
            mstore(stakingTokens, counter)
        }
        return stakingTokens;
    }

    // @return uint256[][]:  an array of arrays of uint256 values representing the pending rewards of the staked NFTs for the caller of the function.
    function getPendingRewards(address owner) external view returns (uint256[][] memory) {
        Staking[] storage userStakes = stakes[owner];
        uint256[][] memory rewards = new uint256[][](userStakes.length);
        for (uint256 i = 0; i < userStakes.length; i++) {
            if (userStakes[i].isActive) {
                uint256 timeStaked = userStakes[i].timestamp;
                uint256 minutesPassed = (block.timestamp - timeStaked) / MINUTES;
                uint256 reward = calculateReward(minutesPassed);
                rewards[i] = new uint256[](2);
                rewards[i][0] = userStakes[i].tokenId;
                rewards[i][1] = reward;
            }
        }
        return rewards;
    }

    // @return all pending reward of all staked nft.
    function claimPendingReward() external {
        Staking[] storage userStakes = stakes[msg.sender];
        uint256 pendingRewards = 0;
        for (uint256 i = 0; i < userStakes.length; i++) {
            if (userStakes[i].isActive) {
                uint256 timeStaked = userStakes[i].timestamp;
                uint256 minutesPassed = (block.timestamp - timeStaked) / MINUTES;
                uint256 reward = calculateReward(minutesPassed);
                if (reward > 0) {
                    // update timestamp
                    userStakes[i].timestamp = block.timestamp;
                    pendingRewards += reward;
                }
            }
        }
        require(pendingRewards > 0, "no pending reward");
        require(celTokenContract.balanceOf(address(this)) >= pendingRewards, "Staking contract not enough token!");

        emit ClaimReward(msg.sender, pendingRewards);

        celTokenContract.transfer(msg.sender, pendingRewards);
    }


    function getUserStakingIndex(Staking[] storage userStakes, uint256 tokenId) internal view returns (uint256) {
        for (uint256 i = 0; i < userStakes.length; i++) {
            if (userStakes[i].tokenId == tokenId) {
                return i;
            }
        }
        return uint256(uint256(int256(- 1)));
    }


}