/* eslint-disable react/no-children-prop */
import { loadMDX } from '../lib/markdown'
import { MDX } from '../components/mdx'
import VerticalLines from '../illustrations/vertical-lines.js'

 export async function getStaticProps() {
   const { mdx } = await loadMDX('content/about.md', { disableToc: true })
    return {
      props: {
        needsLoggedIn: false,
        data: mdx,
      },
    }
  }


/**
 * About Page
 *
 * @param {import('../components/types.js').LayoutChildrenProps} props
 * @returns
 */
export default function About({ data }) {
    return (
      <div className="relative overflow-hidden z-0">
        <div className="absolute top-10 right-0 pointer-events-none bottom-0 hidden xl:flex justify-end z-n1">
          <VerticalLines className="h-full"/>
        </div>
        <div className="layout-margins">
          <div className="prose max-w-screen-lg mx-auto text-w3storage-purple my-4 lg:my-32" >
            <MDX mdx={data} />
          </div>
        </div>
      </div>
    )
}