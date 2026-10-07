"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { getMetaPixelId, getMetaPixelIdForPath, rememberAttributionFromBrowser } from "@/lib/meta-browser";
import { isPrivateJoinPath } from "@/lib/analytics-privacy";

export function MetaPixel() {
  const pathname = usePathname();
  const lastPathname = useRef<string | null>(null);
  const pixelId = getMetaPixelIdForPath(pathname);
  const pixels = [...new Set([getMetaPixelId(), process.env.NEXT_PUBLIC_PT_META_PIXEL_ID].filter(Boolean))];

  useEffect(() => {
    if (isPrivateJoinPath(pathname)) {
      lastPathname.current = pathname;
      return;
    }
    rememberAttributionFromBrowser();

    if (
      lastPathname.current &&
      lastPathname.current !== pathname &&
      typeof window.fbq === "function"
    ) {
      window.fbq("trackSingle",getMetaPixelIdForPath(pathname),"PageView");
    }

    lastPathname.current = pathname;
  }, [pathname]);

  if (!pixelId || isPrivateJoinPath(pathname)) {
    return null;
  }

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          if (!/^\\/join(?:\\/|$)/.test(window.location.pathname)) {
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          ${pixels.map((id)=>`fbq('init', '${id}');`).join("\n")}
          fbq('trackSingle', /^\\/pt(?:-waitlist)?(?:\\/|$)/.test(window.location.pathname)
            ? '${process.env.NEXT_PUBLIC_PT_META_PIXEL_ID || getMetaPixelId()}' : '${getMetaPixelId()}', 'PageView');
          }
        `}
      </Script>
      <noscript>
        <img
          alt=""
          height="1"
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          style={{ display: "none" }}
          width="1"
        />
      </noscript>
    </>
  );
}
