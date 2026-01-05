import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Beyond - Digital Legacy Platform',
  description: 'Leave messages, photos, and wishes to your loved ones, revealed only after your passing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
