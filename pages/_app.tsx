import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import Layout from '../components/Layout'

import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/html5-qrcode@2.3.9/minified/html5-qrcode.min.js" strategy="afterInteractive" />
      <Component {...pageProps} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(3, 0, 20, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontFamily: 'Outfit, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#00C2FF',
              secondary: '#1e3a8a',
            },
          },
        }}
      />
    </Layout>
  )
}
