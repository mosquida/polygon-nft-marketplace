// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("Matix", "MTX") {
        contractAddress = marketplaceAddress;
    }

    function createToken(string memory tokenURI) public returns (uint) {
        _tokenId.increment();
        uint256 newItemId = _tokenId.current();

        // Create token associated with NFT owner/creator 
        _mint(msg.sender, newItemId);
        // Set token Uri for the minted token
        _setTokenURI(newItemId, tokenURI);
        // Allows the operator (Marketplace addr) to sell/transfe NFT token on behalf of owner
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }
}