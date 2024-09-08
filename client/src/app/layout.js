"use client"
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import NextHead from "next/head";
import theme from "../theme";
import Fonts from "@/theme/fonts";
import { useEffect, useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
        <ChakraProvider theme={theme}>
              <Fonts />
          {children}
          </ChakraProvider>
          </Providers>
      </body>
    </html>
  );
}
