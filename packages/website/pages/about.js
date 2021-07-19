/* eslint-disable react/no-children-prop */
import matter from 'gray-matter'
import ReactMarkdown from "react-markdown";
// @ts-ignore
import VerticalLines from '../illustrations/vertical-lines.svg'

 export async function getStaticProps() {
   // @ts-ignore
   const content = await import ('../content/about.md')
   const data = matter(content.default)


    return {
      props: {
        needsUser: false,
        data: data.content,
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
        <div className="relative overflow-hidden">
          <ReactMarkdown className="prose text-w3storage-purple max-w-screen-lg mx-auto my-4 lg:my-32 px-8 lg:px-0 z-1" children={data} />
          <div className="absolute top-32 right-0 z-0">
            <VerticalLines />
          </div>
        </div>
    )
}