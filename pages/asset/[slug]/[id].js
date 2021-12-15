import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Link from 'next/link'

import {
    nftmarketaddress, nftaddress
} from '../../../config.js'

import NFT from '../../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../../artifacts/contracts/NFTMarket.sol/NFTMarket.json'


export default function NFTDetails() {

    const [nft, setNft] = useState()
    const [nftVal, setNftVal] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(async () => {
        getURL()
        loadNFTs()
    }, [])

    function getURL() {
        const tokenId = window.location.href;
        const urlArray = tokenId.split("/");

        const numArray = urlArray[5] - 1

        setNft(numArray)
    }

    async function loadNFTs() {
        const provider = new ethers.providers.JsonRpcProvider()
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
        const data = await marketContract.fetchMarketItems()

        const items = await Promise.all(data.map(async i => {

            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')

            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
            }
            return item

        }))


        setNftVal(items)

        console.log(items)

        console.log(nft)

        console.log(nftVal[nft])

        setLoadingState('loaded')
      }

    //if (loadingState === 'loaded') return (
    //    <h1 className="py-10 px-20 text-3xl">No assets owned</h1>
    //) 

    if (nftVal[nft] === undefined) return (
        <h1 className="py-10 px-20 text-3xl">Doesn't exist</h1>
    )

    console.log(nftVal[nft])

    return (
        <div className="flex justify-center">
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        
                    <div className="border shadow rounded-xl overflow-hidden">
                            <img src={nftVal[nft].image} className="rounded" />
                            <div className="p-4 bg-black">
                                <p className="text-2xl font-bold text-white">Price - {nftVal[nft].price} OBLEC, {nftVal[nft].tokenId}</p>
                            </div>
                            <button 
                            className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
                            >
                                Sell NFT</button>
                    </div>
                </div>
            </div>
        </div>

    )
}
