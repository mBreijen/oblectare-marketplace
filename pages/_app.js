import '../styles/globals.css'
import Link from 'next/link'
import React, {useState, useEffect} from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'

function MyApp({ Component, pageProps }) {

  const [errorMessage, setErrorMessage] = useState(null)
  const [defaultAccount, setDefaultAccount] = useState(null)
  const [connButtonText, setConnButtonText] = useState("Connect Wallet")

  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  async function checkWalletConnection() {
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();

    console.log(accounts)

    if (accounts <= 1){
      setConnButtonText('Connect Wallet')
    } else {
      setConnButtonText('Wallet Connected')
    }

  }

  const connectWalletHandler = () => {
    if (window.ethereum) {
      window.ethereum.request({method: 'eth_requestAccounts'})
      .then(result => {
        accountChangedHandler(result[0])
        setConnButtonText('Wallet Connected')
      })
    } else {
      setErrorMessage("Need to install Metamask!")
    }
  }

  const accountChangedHandler = (newAccount) => {
    setDefaultAccount(newAccount)
  }

  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-xl4 font-bold">Oblectare</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-6 text-pink">
            Home
            </a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-pink">
            My Assets
            </a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-pink">
            Sell Asset
            </a>
          </Link>
          <Link href="/dashboard">
            <a className="mr-6 text-pink">
            Dashboard
            </a>
          </Link>

          <button onClick={connectWalletHandler}>{connButtonText}</button>
          {errorMessage}
        </div>

      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
