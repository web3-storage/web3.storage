import { ReactQueryDevtools } from 'react-query/devtools'
import '../styles/global.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import Layout from '../components/layout'
import { FilesProvider } from '../components/upload'
import { useCountly } from '../lib/countly'


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
  useCountly()

  return (
    <QueryClientProvider client={queryClient}>
      <FilesProvider>
        <Layout {...pageProps}>
          {(props) => <Component {...pageProps} {...props} />}
        </Layout>
      </FilesProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
