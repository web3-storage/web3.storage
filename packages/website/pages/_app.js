import { useEffect } from 'react'
import { ReactQueryDevtools } from 'react-query/devtools'
import Router from 'next/router'
import '../styles/global.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import StateProvider from '../components/state-provider'
import Layout from '../components/layout.js'
import countly from '../lib/countly';


const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000
    }
  },
})

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
    <QueryClientProvider client={queryClient}>
      <StateProvider>
        <Layout {...pageProps}>
          {(props) => <Component {...pageProps} {...props} />}
        </Layout>
      </StateProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
