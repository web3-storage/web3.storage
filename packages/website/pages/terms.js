import HashLink from '../components/hashlink.js'

/**
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
export function getStaticProps() {
  return {
    props: {
      title: 'Terms of Service - Web3 Storage',
      needsUser: false,
    },
  }
}

export default function TermsOfService() {
  return (
    <main className="bg-nspeach">
      <div className="mw9 center pa4 pa5-ns">
        <h1 className="chicagoflf">
          <HashLink id="terms-of-service">Terms of Service</HashLink>
        </h1>
        <p className="lh-copy">
          The following terms and conditions govern all use of the{' '}
          <a className="black" href="https://web3.storage">
            web3.storage
          </a>{' '}
          website (the “Website”) and all content, services and products
          available at or through the Website. The Website is offered subject to
          your acceptance without modification of all of the terms and
          conditions contained herein. As all data uploaded to nft.storage will
          be stored on IPFS, this website incorporates the{' '}
          <a className="black" href="https://discuss.ipfs.io/tos">
            Terms of Service of IPFS.io
          </a>
          .
        </p>
        <p className="lh-copy">
          If you do not agree to all the terms and conditions of this agreement,
          then you may not access the Website or use any services.
        </p>
      </div>
    </main>
  )
}
