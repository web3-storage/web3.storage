import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  /**
   * @param {import("next/document").DocumentContext} ctx
   */
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="icon" href="/favicon.png" type="image/png" />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <div id="modal-root"></div>
        </body>
      </Html>
    )
  }
}

export default MyDocument
