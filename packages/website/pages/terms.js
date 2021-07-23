/* eslint-disable react/no-children-prop */
import matter from 'gray-matter'
import ReactMarkdown from "react-markdown";
import VerticalLines from '../illustrations/vertical-lines.js'

 export async function getStaticProps() {
   // @ts-ignore
   const content = await import ('../content/terms.md')
   const data = matter(content.default)

    return {
      props: {
        title: 'Terms of Service - Web3 Storage',
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
export default function TermsOfService({ data }) {
    return (
      <div className="relative">
        <div className="layout-margins">
          <ReactMarkdown className="prose max-w-screen-lg mx-auto text-w3storage-purple my-4 lg:my-32" children={data} />
          <div className="absolute top-10 left-0 h-full w-full pointer-events-none">
            <div className="w-min ml-auto h-full">
              <VerticalLines className="h-full" style={{ maxWidth: 200 }}/>
            </div>
          </div>
        </div>
      </div>
    )
}
