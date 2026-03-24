"use client";

import type { AnchorHTMLAttributes } from "react";
import type { MetaEventName } from "@/lib/meta-events";
import { trackMetaEvent } from "@/lib/meta-browser";

type MetaTrackedAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  customData?: Record<string, unknown>;
  eventName: MetaEventName;
};

export function MetaTrackedAnchor({
  customData,
  eventName,
  onClick,
  ...props
}: MetaTrackedAnchorProps) {
  return (
    <a
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
