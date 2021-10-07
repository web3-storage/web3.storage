/* eslint-disable react/no-children-prop */
import matter from 'gray-matter'
import ReactMarkdown from "react-markdown";
import VerticalLines from '../illustrations/vertical-lines.js'
import slug from 'remark-slug'

 export async function getStaticProps() {
   // @ts-ignore
   const content = await import ('../content/about.md')
   const data = matter(content.default)


    return {
      props: {
        needsLoggedIn: false,
        data: data.content,
        title: 'Web3 Storage - About web3.storage, the easy way to store with IPFS and Filecoin',
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
          <ReactMarkdown className="prose max-w-screen-lg mx-auto text-w3storage-purple my-4 lg:my-32" children={data} remarkPlugins={[slug]} />
        </div>
      </div>
    )
}