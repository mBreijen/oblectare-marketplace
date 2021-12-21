// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarket is ReentrancyGuard {
	using Counters for Counters.Counter;
	Counters.Counter private _itemIds;
	Counters.Counter private _itemsSold;

	address payable owner;
	uint256 listingPrice = 0.1 ether;

	constructor() {
		owner = payable(msg.sender);
	}

	//Structure of a NFT (and market item)

	struct MarketItem {
		uint itemId;
		address nftContract;
		uint tokenId;
		address payable seller;
		address payable owner;
		uint256 price;
		bool sold;
		bool forsale;
		bool burned;
	}

	mapping(uint256 => MarketItem) private idToMarketItem;

	// You can call this event in an emit

	event MarketItemCreated (
		uint indexed itemId,
		address indexed nftContract,
		uint indexed tokenId,
		address seller,
		address owner,
		uint256 price,
		bool sold,
		bool forsale,
		bool burned
	);

	//Simply the listing price of a market item

	function getListingPrice() public view returns (uint256) {
		return listingPrice;
	}

	//Function of creating an NFT

	function createMarketItem(
		address nftContract,
		uint256 tokenId,
		uint256 price
	) public payable nonReentrant {
		require(price > 0, "Price must be at least 1 wei");
		require(msg.value == listingPrice, "Price must be equal to listing price");

		_itemIds.increment();
		uint256 itemId = _itemIds.current();

		idToMarketItem[itemId] = MarketItem(
			itemId,
			nftContract,
			tokenId,
			payable(msg.sender),
			payable(address(0)),
			price,
			false,
			true,
			false
		);

		IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

		emit MarketItemCreated(
			itemId,
			nftContract,
			tokenId,
			msg.sender,
			address(0),
			price,
			false,
			true,
			false
		);
	}

	//Function for creating a sale on the marketplace

	function createMarketSale(
		address nftContract,
		uint256 itemId
		) public payable nonReentrant {
		uint price = idToMarketItem[itemId].price;
		uint tokenId = idToMarketItem[itemId].tokenId;
		require(msg.value == price, "Please submit the asking price in order to complete the purchase");

		idToMarketItem[itemId].seller.transfer(msg.value);
		IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
		idToMarketItem[itemId].owner = payable(msg.sender);
		idToMarketItem[itemId].sold = true;
		idToMarketItem[itemId].forsale = false;
		_itemsSold.increment();
		payable(owner).transfer(listingPrice);

	}

	function burnItem(
		address nftContract,
		uint256 itemId
		) public payable nonReentrant {
		uint tokenId = idToMarketItem[itemId].tokenId;
		address burnAddress = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;
		//require(msg.sender == idToMarketItem[itemId].owner, "you are not the owner");

		idToMarketItem[itemId].seller = payable(burnAddress);
		IERC721(nftContract).transferFrom(address(this), burnAddress, tokenId);
		idToMarketItem[itemId].owner = payable(burnAddress);
		idToMarketItem[itemId].sold = true;
		idToMarketItem[itemId].forsale = false;
		idToMarketItem[itemId].burned = true;
		_itemsSold.increment();
		payable(owner).transfer(listingPrice);
	}

	//Get all the market items currently available

	function fetchMarketItems() public view returns (MarketItem[] memory) {
		uint itemCount = _itemIds.current();
		uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
		uint currentIndex = 0;

		MarketItem[] memory items = new MarketItem[](unsoldItemCount);
		for (uint i = 0; i < itemCount; i++) {
			if (idToMarketItem[i + 1].owner == address(0)){
				uint currentId = idToMarketItem[i + 1].itemId;
				MarketItem storage currentItem = idToMarketItem[currentId];
				items[currentIndex] = currentItem;
				currentIndex += 1;
			}
		}

		return items;
	}
	

	//Fetch my own NFTs

	function fetchMyNFTs() public view returns (MarketItem[] memory) {
		uint totalItemCount = _itemIds.current();
		uint itemCount = 0;
		uint currentIndex = 0;

		for (uint i = 0; i < totalItemCount; i++) {
			if (idToMarketItem[i + 1].owner == msg.sender) {
				itemCount += 1;
			}
		}

		MarketItem[] memory items = new MarketItem[](itemCount);

		for (uint i = 0; i < totalItemCount; i++) {
			if (idToMarketItem[i + 1].owner == msg.sender) {
				uint currentId = idToMarketItem[i + 1].itemId;
				MarketItem storage currentItem = idToMarketItem[currentId];
				items[currentIndex] = currentItem;
				currentIndex += 1;
			}
		}

		return items;

	}

	//Fetch the items I've created

	function fetchItemsCreated() public view returns (MarketItem[] memory) {
		uint totalItemCount = _itemIds.current();
		uint itemCount = 0;
		uint currentIndex = 0;

		for (uint i = 0; i < totalItemCount; i++) {
			if (idToMarketItem[i + 1].seller == msg.sender) {
				itemCount += 1;
			}
		}

		MarketItem[] memory items = new MarketItem[](itemCount);
		for (uint i = 0; i < totalItemCount; i++) {
			if (idToMarketItem[i + 1].seller == msg.sender) {
				uint currentId = idToMarketItem[i + 1].itemId;
				MarketItem storage currentItem = idToMarketItem[currentId];
				items[currentIndex] = currentItem;
				currentIndex += 1;
			}
		}
	return items;
	}

	
}