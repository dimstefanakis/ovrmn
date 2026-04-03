"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { MetaEventName } from "@/lib/meta-events";
import { trackMetaEvent } from "@/lib/meta-browser";
import posthog from "posthog-js";

type MetaTrackedLinkProps = ComponentProps<typeof Link> & {
  customData?: Record<string, unknown>;
  eventName: MetaEventName;
};

export function MetaTrackedLink({
  customData,
  eventName,
  onClick,
  ...props
}: MetaTrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        trackMetaEvent({
          customData,
          eventName,
        });
        posthog.capture("cta_clicked", {
          label: typeof props.children === "string" ? props.children : undefined,
          href: typeof props.href === "string" ? props.href : undefined,
          content_name: customData?.content_name,
          content_category: customData?.content_category,
        });
      }}
    />
  );
}
