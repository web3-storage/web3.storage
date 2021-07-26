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
        <div className="layout-margins">
          <ReactMarkdown className="prose max-w-screen-lg mx-auto text-w3storage-purple my-4 lg:my-32" children={data} remarkPlugins={[slug]} />
          <div className="absolute top-48 left-0 w-full pointer-events-none" style={{ minWidth: '1536px' }}>
            <div className="w-min ml-auto">
              <VerticalLines />
            </div>
          </div>
        </div>
      </div>
    )
}