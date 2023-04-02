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

    mapping(address => uint256[]) private _addressToTokenIds;

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
        require(amount <= maxAmountPerTrx, "Cannot mint > 5 !");
        require(totalSupply + amount <= maxSupply, "Reach max supply!");
        require(msg.value >= price * amount, "Need to pay up!");

        for (uint256 index = 0; index < amount; index++) {
            uint256 tokenId = totalSupply + 1;
            _mint(msg.sender, tokenId);
            totalSupply++;

            // add token ID to mapping
            _addressToTokenIds[msg.sender].push(tokenId); 
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

    /// @notice Get amount of token that an address minted.
    /// @param _owner Address to query.
    function getTokenIds(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        return _addressToTokenIds[_owner];
    }

    /// @notice Transfer NFT token.
    /// @param _to Address to where NFT token is transferred.
    /// @param _tokenId NFT token ID.
    function safeTransferFrom(address _to, uint256 _tokenId) public {
        require(_exists(_tokenId), "Token ID does not exist");
        require(_isApprovedOrOwner(msg.sender, _tokenId), "Not owner or approved");

        address owner = ownerOf(_tokenId);

        // Remove token from sender's address
        uint256[] storage tokenIds = _addressToTokenIds[owner];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == _tokenId) {
                tokenIds[i] = tokenIds[tokenIds.length - 1];
                tokenIds.pop();
                break;
            }
        }

        // Add token to recipient's address
        _addressToTokenIds[_to].push(_tokenId);

        // Transfer token ownership
        safeTransferFrom(owner, _to, _tokenId);
    }

    /// @notice Transfer NFT token.
    /// @param _to Address to where NFT token is transferred.
    /// @param _tokenId NFT token ID.
    function transferTokens(address _to, uint256 _tokenId) public {
        require(_exists(_tokenId), "Token ID does not exist");
        require(_isApprovedOrOwner(msg.sender, _tokenId), "Not owner or approved");

        address owner = ownerOf(_tokenId);

        // Remove token from sender's address
        uint256[] storage tokenIds = _addressToTokenIds[owner];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == _tokenId) {
                tokenIds[i] = tokenIds[tokenIds.length - 1];
                tokenIds.pop();
                break;
            }
        }

        // Add token to recipient's address
        _addressToTokenIds[_to].push(_tokenId);
        // Transfer token ownership
        transferFrom(owner, _to, _tokenId);
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
