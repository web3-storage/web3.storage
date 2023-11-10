import Document, { Html, Head, Main, NextScript } from 'next/document';

import { createW3upLaunchConfig, W3upLaunchContext } from '../components/w3up-launch.js';

class MyDocument extends Document {
  /**
   * @param {import("next/document").DocumentContext} ctx
   */

  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3a0839" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta name="msapplication-TileColor" content="#3a0839" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <meta name="theme-color" content="#5bbad5" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <div id="modal-root"></div>
          {/* add this for debuggability of launch announcements that only appear when configured */}
          <W3upLaunchContext.Consumer>
            {w3upLaunch => {
              return (
                <script
                  type="application/json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(createW3upLaunchConfig(w3upLaunch)) }}
                ></script>
              );
            }}
          </W3upLaunchContext.Consumer>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
