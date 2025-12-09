import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import Layout from '../components/Layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/html5-qrcode@2.3.9/minified/html5-qrcode.min.js" strategy="afterInteractive" />
      <Component {...pageProps} />
    </Layout>
  )
}
