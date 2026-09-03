"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import MetaPixelNavigation from "@/components/MetaPixelNavigation";

/**
 * Google Ads, Pinterest, and Meta advertising tags.
 *
 * These belong on the public marketing site only. The client portal and the
 * studio admin are private, signed-in areas: sending their page views to three
 * ad networks leaks client URLs, and the tags compete with hydration on exactly
 * the pages where a couple is trying to click a button.
 */
export default function MarketingScripts() {
  const pathname = usePathname();

  if (pathname.startsWith("/portal") || pathname.startsWith("/admin")) return null;

  return (
    <>
      <MetaPixelNavigation />
      <Script
        id="google-tag"
        src="https://www.googletagmanager.com/gtag/js?id=AW-11134478295"
        strategy="afterInteractive"
      />
      <Script id="google-tag-config" strategy="afterInteractive">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            gtag('config', 'AW-11134478295');
          `}
      </Script>
      <Script id="pinterest-tag" strategy="afterInteractive">
        {`
            !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            pintrk('load', '2613901982449');
            pintrk('page');
          `}
      </Script>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1263840655319183');
            fbq('track', 'PageView');
          `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1263840655319183&ev=PageView&noscript=1"
          alt=""
        />
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://ct.pinterest.com/v3/?event=init&tid=2613901982449&noscript=1"
          alt=""
        />
      </noscript>
    </>
  );
}
