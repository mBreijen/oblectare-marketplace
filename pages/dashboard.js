import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Link from 'next/link'


import {
    nftmarketaddress, nftaddress
} from '../config.js'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function Dashboard() {
    const [nfts, setNfts] = useState([])
    const [sold, setSold] = useState([])

    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        loadNFTs()
    }, [])

    async function loadNFTs() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await marketContract.fetchItemsCreated()

        console.log(data)

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

            if(i.burned != true) {
                return item
            }
        }))

    
        
        //const soldItems = items.filter(i => i.burned == false)
        //setSold(soldItems)
        setNfts(items)
        setLoadingState('loaded')
    }

    async function burnNFT(nft) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        
        console.log(nft.tokenId)

        const transaction = await contract.burnItem(
            nftaddress, nft.tokenId
        )
        await transaction.wait()
        loadNFTs()
    }

    return(
        <div>
            <div className="p-4">
                <h2 className="text-2xl py-2">Items Created</h2> 
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
                            <Link href={'/asset/' + nft.seller + "/" + nft.tokenId} key={nft.tokenId}>
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <img src={nft.image} className="rounded" />
                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">Price - {nft.price} OBLEC</p>
                                </div>
                            </div>
                            </Link>
                        ))
                    }
                </div>

                <h2 className="text-2xl py-2">Items For Sale</h2> 
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
                            
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <Link href={'/asset/' + nft.seller + "/" + nft.tokenId} key={nft.tokenId}>
                                    <img src={nft.image} className="rounded" />
                                </Link>
                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">Price - {nft.price} OBLEC</p>
                                </div>
                                <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => burnNFT(nft)}>Burn
                                </button>
                            </div>
                            
                        ))
                    }
                </div>
            </div>
            <div className="px-4">
                {
                    Boolean(sold.length) && (
                        <div>
                            <h2 className="text-2xl py-2">Items Sold</h2>  
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                            {
                                sold.map((nft, i) => (
                                <div key={i} className="border shadow rounded-xl overflow-hidden">
                                    <img src={nft.image} className="rounded" />
                                    <div className="p-4 bg-black">
                                        <p className="text-2xl font-bold text-white">Price - {nft.price} OBLEC</p>
                                    </div>
                                </div>
                                ))
                            }
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}