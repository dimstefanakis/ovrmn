"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  EXPLORE_FIRST_TEXT,
  exploreFirstText,
  firstTextSmsUrl,
} from "./first-text";

function subscribeLanguage(onChange: () => void) {
  window.addEventListener("languagechange", onChange);
  return () => window.removeEventListener("languagechange", onChange);
}
const browserMessage = () => exploreFirstText(navigator.language);
const serverMessage = () => EXPLORE_FIRST_TEXT;

export function FirstTextLink({
  number,
  className,
  children,
}: {
  number: string | null;
  className: string;
  children: ReactNode;
}) {
  // The English server snapshot preserves static rendering and hydration.
  const message = useSyncExternalStore(
    subscribeLanguage,
    browserMessage,
    serverMessage,
  );
  const href = firstTextSmsUrl(number, message);
  return href ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <button type="button" className={className} aria-disabled="true">
      {children}
    </button>
  );
}
