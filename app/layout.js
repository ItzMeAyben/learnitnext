import Providers from './providers.js'
import './globals.css'

export const metadata = {
  title: 'LearnIt',
}

/** @type {import('next').Viewport} */
export const viewport = {
  // Activates env(safe-area-inset-*) on notched devices for the phone tab
  // bar (plan 02-08). width/initialScale stay unset — Next auto-sets them.
  viewportFit: 'cover',
  themeColor: '#f3f2f9', // canvas token — matches the page background
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
