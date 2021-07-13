/* eslint-disable react/no-children-prop */
import matter from 'gray-matter'
import ReactMarkdown from "react-markdown";

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
        <>
          <ReactMarkdown className="prose max-w-screen-lg mx-auto my-32" children={data} />
        </>
    )
}