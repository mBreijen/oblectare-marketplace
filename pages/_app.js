import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
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
          <Link href="/">
            <a className="mr-6 text-pink">
            My Assets
            </a>
          </Link>
          <Link href="/">
            <a className="mr-6 text-pink">
            Sell Asset
            </a>
          </Link>
          <Link href="/">
            <a className="mr-6 text-pink">
            Dashboard
            </a>
          </Link>
        </div>

      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
