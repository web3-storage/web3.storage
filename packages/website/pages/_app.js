import { ReactQueryDevtools } from 'react-query/devtools'
import '../styles/global.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import Layout from '../components/layout.js'

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
  return (
    <QueryClientProvider client={queryClient}>
      <Layout {...pageProps}>
        {(props) => <Component {...pageProps} {...props} />}
      </Layout>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
