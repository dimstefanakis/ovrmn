"use client";
/* eslint-disable @next/next/no-img-element */

import Script from "next/script";
import { getLinkedInPartnerId } from "@/lib/linkedin-browser";

export function LinkedInInsightTag() {
  const partnerId = getLinkedInPartnerId();

  if (!partnerId) {
    return null;
  }

  return (
    <>
      <Script id="linkedin-insight-tag" strategy="afterInteractive">
        {`
          _linkedin_partner_id = "${partnerId}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          (function(l) {
            if (!l) {
              window.lintrk = function(a, b) {
                window.lintrk.q.push([a, b]);
              };
              window.lintrk.q = [];
            }
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";
            b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);
          })(window.lintrk);
        `}
      </Script>
      <noscript>
        <img
          alt=""
          height="1"
          src={`https://px.ads.linkedin.com/collect/?pid=${partnerId}&fmt=gif`}
          style={{ display: "none" }}
          width="1"
        />
      </noscript>
    </>
  );
}
