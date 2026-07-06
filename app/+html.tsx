import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <title>Me — The AI that grows with you</title>
        <meta
          name="description"
          content="Me est un compagnon IA personnel qui te connaît profondément et évolue avec toi au fil du temps."
        />

        <meta name="theme-color" content="#0B0620" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Me" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Prevents the bounce/gray flash and lets our own gradient show through on first paint */}
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `body { background-color: #0B0620; }` }} />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function () {});
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
