// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// ERC721URIStorage is extension of ERC721 with storage based token URI management
contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;
    Counters.Counter private _itemsSold;
  
    address payable owner;
    uint listingPrice = 0.0001 ether;

    mapping(uint => MarketItem) private MarketItems;

    struct MarketItem {
      uint id;
      address payable owner;
      address payable seller;
      uint price;
      bool sold;
    }

    // Emmit event to listeners when new MarketItem is created
    // indexed mofifier = enables to flter logs
    event MarketItemCreated (
      uint indexed id,
      address payable owner,
      address payable seller,      
      uint price,
      bool sold
    );

    // Set deployer as owner of this contract
    constructor() ERC721("Matix Token", "MTX") {
      owner = payable(msg.sender);
    }

    // NFT token Minting, Owners tokenizing their assets
    // Associate owner addr => tokenID, tokenID => tokenURI(NFT metadata ext. URL)
    function createNFTToken(string memory tokenURI, uint price) public payable returns (uint) {
        _tokenId.increment();
        uint newTokenId = _tokenId.current();

        // Create tokenID associated with NFT owner/creator 
        _safeMint(msg.sender, newTokenId);
        // Set token URI for the minted token
        _setTokenURI(newTokenId, tokenURI);
        // List the NFT token to Marketplace
        createMarketItem(newTokenId, price);
        return newTokenId;
    }

    // Create MarketItem of NFT to list in Marketplace
    // Transfer the NFT of owner to Marketplace
    function createMarketItem(uint tokenId, uint price) private {
      require(price > 0, "Price must be greater than 0");
      require(msg.value == listingPrice, "Listing Fee must be equal to listing price");

      // List the NFT Token to Marketplace
      MarketItems[tokenId] = MarketItem(
        tokenId,
        payable(address(this)), // Owner NFT => marketplace now owns => transfer to buyer
        payable(msg.sender), // addr of NFT owner, the seller
        price,
        false
      );

      // Transfers the ownership of NFT from orig owner to marketplace contract(this)
      // the marketplace transfers it to the next buyer later
      _transfer(msg.sender, address(this), tokenId);

      emit MarketItemCreated(
        tokenId,
        payable(address(this)),
        payable(msg.sender),
        price,
        false
      );
    }
    
    function createMarketSale(uint tokenId) public payable {
      uint price = MarketItems[tokenId].price;
      require(msg.value == price, "Please send asking amount price");

      // Transfer the "NFT listing" from marketplace contract to buyer
      MarketItems[tokenId].owner = payable(msg.sender);
      // Set seller to empty - NFT not fpr sale
      MarketItems[tokenId].seller = payable(address(0));
      MarketItems[tokenId].sold = true;

      _itemsSold.increment();

      // Actual transfer of the "NFT tokenId" from marketplace to buyer
      _transfer(address(this), msg.sender, tokenId);

      // Transfer the payment fee to NFT orig owner
      // .transfer == "receives"
      address seller = MarketItems[tokenId].seller;
      payable(seller).transfer(msg.value);
      // Tranfer the NFT listing fee to marketplace owner
      payable(owner).transfer(listingPrice);
    }
}