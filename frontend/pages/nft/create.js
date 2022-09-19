import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
// To connect web3 wallet to application
import Web3Modal from "web3modal";
// to create an instance of IPFS HTTP API client
import { create } from "ipfs-http-client";

// connect to the default IPFS API
const ipfs = create("/ip4/127.0.0.1/tcp/5001");

// Marketplace contract ABI reference
import NFTMarketplace from "../../../blockchain/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import { parseEther } from "ethers/lib/utils";

export default function createItem() {
  // Store URL/CID of uploaded nft img to IPFS
  const [nftMetadata, setnftMetadata] = useState({
    name: "",
    descrition: "",
    price: "",
  });
  const [imgFile, setimgFile] = useState();

  const router = useRouter();

  async function uploadImage(e) {
    setimgFile(e.target.files[0]);
  }

  async function saveMetadata() {
    const { name, description, price } = nftMetadata;
    if (!name || !description || !price || !imgFile) return;

    // Upload the img file to IPFS network
    const img = await ipfs.add(imgFile);
    // console.log(img);
    const imgUrl = `https://ipfs.io/ipfs/${img.path}`;
    console.log(imgUrl);

    const data = JSON.stringify({
      name,
      description,
      price,
      image: imgUrl,
    });

    const meta = await ipfs.add(data);
    const url = `https://ipfs.io/ipfs/${meta.path}`;

    return url;
  }

  async function listNFT(url) {
    const web3Modal = new Web3Modal();
    const conn = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(conn);
    const signer = provider.getSigner();

    const NFTMarketplaceContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS,
      NFTMarketplace.abi,
      signer
    );

    let listingPrice = await NFTMarketplaceContract.getListingPrice();
    listingPrice = await listingPrice.toString();

    // transform to wei format
    const price = ethers.utils.parseUnits(nftMetadata.price, "ether");

    const transaction = await NFTMarketplaceContract.createNFTToken(
      url,
      price,
      { value: listingPrice }
    );

    const tx = await transaction.wait();

    // Redirect to home
    router.push("/");
  }

  function uploadAndList() {
    const url = saveMetadata();
    listNFT(url);
  }

  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <h1 className=" font-medium">CREATE AND LIST NFT ITEM</h1>

      <div className="py-20 flex flex-col">
        <label htmlFor="name">NFT Name</label>
        <input
          type="text"
          id="name"
          className="border rounded-md mb-8"
          onChange={(e) =>
            setnftMetadata({ ...nftMetadata, name: e.target.value })
          }
        />
        <label htmlFor="desc">NFT Description</label>
        <textarea
          type="text"
          id="desc"
          className="border rounded-md mb-8"
          onChange={(e) =>
            setnftMetadata({ ...nftMetadata, description: e.target.value })
          }
        />
        <label htmlFor="price">Price</label>
        <input
          type="number"
          id="price"
          className="border rounded-md mb-8"
          onChange={(e) =>
            setnftMetadata({ ...nftMetadata, price: e.target.value })
          }
        />
        <label htmlFor="img">NFT Image</label>
        <input
          type="file"
          id="img"
          className="border rounded-md mb-5"
          onChange={(e) => uploadImage(e)}
        />
        {/* {imgFile && (
                      <img className="rounded mt-4" width="350" src={} />

        )} */}

        <button
          onClick={uploadAndList}
          className="bg-black text-white px-2 py-3"
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
