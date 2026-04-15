import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlipIQ",
  description: "FlipIQ - Is it worth flipping?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
