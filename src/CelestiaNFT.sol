// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

error TokenDoesNotExist();
error NoEthBalance();

contract CelestiaNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 public totalSupply = 0;
    string public baseURI;

    uint256 public immutable maxSupply = 10000;
    uint256 public immutable price = 0.15 ether;
    uint256 public immutable maxAmountPerTrx = 5;

    address payable public vaultAddress;

    /*///////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Creates an NFT Drop
    /// @param _name The name of the token.
    /// @param _symbol The Symbol of the token.
    /// @param _baseURI The baseURI for the token that will be used for metadata.
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) ERC721(_name, _symbol) {
        baseURI = _baseURI;
        vaultAddress = payable(msg.sender);
    }

    /*///////////////////////////////////////////////////////////////
                               MINT FUNCTION
    //////////////////////////////////////////////////////////////*/

    /// @notice Mint NFT function.
    /// @param amount Amount of token that the sender wants to mint.
    function mintNft(uint256 amount) external payable {
        require(amount < maxAmountPerTrx, "Cannot mint > 5 !");
        require(totalSupply + amount < maxSupply, "Reach max supply!");
        require(msg.value >= price * amount, "Need to pay up!");

        unchecked {
            for (uint256 index = 0; index < amount; index++) {
                uint256 tokenId = totalSupply + 1;
                _mint(msg.sender, tokenId);
                totalSupply++;
            }
        }
    }

    /*///////////////////////////////////////////////////////////////
                            ETH WITHDRAWAL
    //////////////////////////////////////////////////////////////*/

    /// @notice Withdraw all ETH from the contract to the vault addres.
    function withdraw() external onlyOwner {
        if (address(this).balance == 0) revert NoEthBalance();

        uint256 balance = address(this).balance;
        vaultAddress.transfer(balance);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        if (ownerOf(tokenId) == address(0)) {
            revert TokenDoesNotExist();
        }

        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
                : "";
    }
}
