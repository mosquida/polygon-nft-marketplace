// const { expect } = require("chai");

describe("NFT Marketplace Contract", function () {
  it("Should create and execute market sale", async function () {
    // Get the cpntract reference
    const MarketplaceContract = await ethers.getContractFactory(
      "NFTMarketplace"
    );
    // Deploy the contract
    const marketplace = await MarketplaceContract.deploy();
    // Wait, if it's successfully dployed
    await marketplace.deployed();

    let listingPrice = await marketplace.getListingPrice();
    listingPrice = listingPrice.toString();
    const auctionPrice = ethers.utils.parseUnits("1", "ether");

    // Get test accounts provided by ethers
    // _ = first addr, used to deploy the contract
    const [_, acct1, buyerAddr] = await ethers.getSigners();
    console.log("marketplace addr", marketplace.address);
    console.log("acct 1", acct1.address);
    console.log("buyer acct", buyerAddr.address);

    // Create 2 NFT token
    await marketplace
      .connect(acct1)
      .createNFTToken("https://www.mytokenlocation.com/1", auctionPrice, {
        value: listingPrice,
      });
    await marketplace
      .connect(acct1)
      .createNFTToken("https://www.mytokenlocation.com/2", auctionPrice, {
        value: listingPrice,
      });

    // Create a market sale of token to buyer
    // .connect = connects account(signs in) to marketplace
    await marketplace
      .connect(buyerAddr)
      .createMarketSale(1, { value: auctionPrice });

    // // Buyer resells the token he bought
    await marketplace
      .connect(buyerAddr)
      .resellToken(1, auctionPrice, { value: listingPrice });

    // Fetch unsold listed items at marketplace
    let items = await marketplace.getMarketItems();
    // Promise.all => async mapping(many to one)
    items = await Promise.all(
      items.map(async (item) => {
        // .tokenURI available at 721 openzeppelin contract, returns uri of tokenid
        const tokenURI = await marketplace.tokenURI(item.id);
        // Restructure the returned items
        return (content = {
          id: item.id.toString(),
          tokenURI,
          owner: item.owner,
          seller: item.seller,
          price: item.price.toString(),
          sold: item.sold.toString(),
        });
      })
    );

    console.log("items: ", items);
  });
});
