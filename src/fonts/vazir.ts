import localFont from "next/font/local";

export const vazir = localFont({
  src: [
    {
      path: "./Vazir-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Vazir-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Vazir-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./Vazir-Light.woff2",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-vazir",
  display: "swap",
  preload: true,
});

export const vazirVariable = localFont({
  src: "./Vazir-Variable.woff2",
  variable: "--font-vazir-variable",
  display: "swap",
  preload: true,
});