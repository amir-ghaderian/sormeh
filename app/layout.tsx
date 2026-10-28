
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "سورمه | مدیریت فروشگاه پوشاک",
    template: "%s | سورمه",
  },
  description:
    "سامانه مدیریت کالاها، موجودی، فروش، فاکتورها و حساب‌های فروشگاه سورمه",
  applicationName: "سورمه",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
