"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { MetaEventName } from "@/lib/meta-events";
import { trackMetaEvent } from "@/lib/meta-browser";

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
      }}
    />
  );
}
