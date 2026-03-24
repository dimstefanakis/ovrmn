"use client";

import { useEffect, useRef } from "react";
import { trackMetaEvent } from "@/lib/meta-browser";

export function MetaViewContent({
  contentCategory,
  contentName,
}: {
  contentCategory: string;
  contentName: string;
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) {
      return;
    }

    hasTracked.current = true;

    trackMetaEvent({
      customData: {
        content_category: contentCategory,
        content_name: contentName,
      },
      eventName: "ViewContent",
    });
  }, [contentCategory, contentName]);

  return null;
}
