import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

// Reference to Marketplace Contract ABI Json Representation
import NFTMarketplace from "../../blockchain/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export default function Home() {
  const [NFTitems, setNFTitems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNFTItems();
  }, []);

  async function fetchNFTItems() {
    // Connect to network via ethers JSON RPC provider
    const provider = new ethers.providers.JsonRpcProvider();
    // Configure the contract, ref. with the ABI for remote connection
    const NFTMarketplaceContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS,
      NFTMarketplace.abi,
      provider
    );
    // Call contract function, Fetch unsold items
    let items = await NFTMarketplaceContract.getMarketItems();
    console.log(items);
    // Format the data
    items = await items.map(async (item) => {
      // Get token URI given token id
      const tokenURI = await NFTMarketplaceContract.tokenURI(item.id);
      // Get JSON metadata given URI from IPFS or REST API
      const meta = await axios.get(tokenURI);
      console.log(meta);
      // Transform price format to decimal
      const price = await ethers.utils.formatUnits(
        item.price.toString(),
        "ether"
      );

      // Return each index content
      return {
        id: item.id.toString(),
        owner: item.owner,
        seller: item.seller,
        price,
        name: meta.data.name,
        description: meta.data.description,
        image: meta.data.image,
      };
    });
    console.log(items);
    setNFTitems(items);
    setLoading(false);
  }

  async function buyNFT(nft) {
    // CONNECT TO WALLET via Web3Modal
    const web3Modal = new Web3Modal();
    // Create a web3 instance connection
    const conn = await web3Modal.connect();
    // Create web3 provider to connect to netwoek via ethers
    const provider = new ethers.providers.Web3Provider(conn);
    // to sign contract tx(when buying)
    const signer = provider.getSigner();
    // Reference to Marketplace contract
    const NFTMarketplaceContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS,
      NFTMarketplace.abi,
      provider
    );
    // Transform back to wei fornat
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    // User buying the token, transferring asset to user wallet from mktplace
    const transaction = await NFTMarketplaceContract.createMarketSale(nft.id, {
      value: price,
    });
    // Wait until transaction is created
    await transaction.wait();
    fetchNFTItems();
  }

  // Return if no NFT loaded
  if (NFTitems.length === 0) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ height: "calc(100vh - 6rem)" }}
      >
        <h1 className="">No Items in Marketplace yet</h1>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold underline"></h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 py-10 px-20">
        <div class="relative bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <a href="#">
            <img
              class="rounded-t-lg"
              src="/abs.jpg"
              alt=""
              className="object-cover"
            />
          </a>
          <div class="absolute p-4 bottom-0 text-white bg-black w-full ">
            <a href="#">
              <h5 class=" text-md font-bold tracking-tight text-gray-900 dark:text-white">
                OmniWorld
              </h5>
            </a>
            <p
              class="pb-4 text-sm text-gray-700 dark:text-gray-400"
              style={{ fontSize: "0.8rem" }}
            >
              Abstract Universe
            </p>
            <div className="flex justify-between items-center">
              <p class=" text-md font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-800">
                3.3 MATIC
              </p>
              <a
                href=""
                className="text-sm bg-blue-700 px-3 py-2 rounded-md"
                style={{ fontSize: "0.8em" }}
              >
                Buy Me
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
