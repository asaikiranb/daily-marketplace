import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'Husky Helpers — UW Student Marketplace',
  description: 'A two-sided marketplace for UW students to offer and find services within the Husky community.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="main-content">
          {children}
        </main>
        <footer className="site-footer">
          © 2026 Husky Helpers · University of Washington
        </footer>
      </body>
    </html>
  );
}
