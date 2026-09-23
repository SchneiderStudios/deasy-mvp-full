import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="de">
      <Head>
        <meta charSet="UTF-8" />
        <meta property="og:title" content="DEASY — Deutsche Bürokratie. Endlich verständlich." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%231C2340'/%3E%3Crect x='9' y='9' width='14' height='14' rx='4' fill='%234338CA'/%3E%3C/svg%3E" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html {
              scroll-behavior: smooth;
            }
            body {
              margin: 0;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              -webkit-font-smoothing: antialiased;
              line-height: 1.5;
              background: #f5f5f1;
              color: #14151c;
            }
            img, svg {
              display: block;
              max-width: 100%;
            }
            a {
              color: inherit;
              text-decoration: none;
            }
            button {
              font-family: inherit;
            }
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
