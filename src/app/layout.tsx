import type { Metadata } from "next";
import { vazir } from "@/fonts/vazir";
import { ClientLayout } from "./ClientLayout";
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
    <html className={`${vazir.variable} font-vazir`} suppressHydrationWarning>
      <body className="bg-dark-900 text-white antialiased min-h-screen" suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
