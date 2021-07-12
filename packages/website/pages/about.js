/**
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
 export function getStaticProps() {
    return {
      props: {
        needsUser: false,
      },
    }
  }

export default function About() {
    return (
        <>
            <h1>About page</h1>
        </>
    )
}