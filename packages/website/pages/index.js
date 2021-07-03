import Hero from '../components/hero.js'

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

export default function Home() {
  return (
    <>
      <Hero />
      <main>
      </main>
    </>
  )
}
