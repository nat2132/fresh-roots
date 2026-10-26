import './globals.css';

export const metadata = {
  title: 'Fresh Roots — Your Digital Farmers Market',
  description: 'Discover fresh, locally-grown vegetables straight from trusted farmers. From farm to table, experience the freshest produce with stories behind every harvest.',
  keywords: 'fresh vegetables, farmers market, organic produce, local farming, farm to table',
  openGraph: {
    title: 'Fresh Roots — Your Digital Farmers Market',
    description: 'Discover farm-fresh vegetables from local farmers who care.',
    type: 'website',
  },
};

import Providers from './Providers';
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
