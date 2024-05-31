"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import Script from "next/script"

import { cn } from "@/lib/utils/cn"

import { Main } from "./main"

// https://nextjs.org/docs/pages/building-your-application/optimizing/fonts 

export default function Page() {
  const [isLoaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=0.86, maximum-scale=5.0, minimum-scale=0.86" />
      </Head>
      <Script id="gtm">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K98T8ZFZ');`}</Script>
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K98T8ZFZ"
height="0" width="0" style={{ display: "none", visibility: "hidden" }}></iframe></noscript>
      <main className={cn(
        ``,
        `text-stone-900/90 dark:text-stone-100/90`,
        `bg-stone-500`,
        )}>
        {isLoaded && <Main />}
      </main>
    </>
  )
}