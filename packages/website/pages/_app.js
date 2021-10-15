import { useEffect } from 'react'
import Router from 'next/router'
import '../styles/global.css'
import Layout from '../components/layout.js'
import countly from '../lib/countly'

/**
 * App Component
 *
 * @param {any} props
 */
export default function App({ Component, pageProps }) {
  useEffect(() => {
    countly.init()
    Router.events.on('routeChangeComplete', (route) => {
      countly.trackPageView(route)
    })
  }, [])
  
  return (
    <Layout {...pageProps}>
      {(props) => <Component {...pageProps} {...props} />}
    </Layout>
  )
}
