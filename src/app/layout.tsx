import type { Metadata } from "next";
import { vazir } from "@/fonts/vazir";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Cons",
  description: "دستیار مشاوره هوشمند شما",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.variable} font-vazir bg-dark-900 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
