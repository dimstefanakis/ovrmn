"use client";

import { useEffect, useState, type ReactNode } from "react";
import { trackLanding } from "@/lib/pt-analytics";
import { prefersReducedMotion } from "./imessage";
import s from "../landing.module.css";

/**
 * Scroll reveals for every [data-reveal] element, once each, plus one landing_section_viewed per
 * [data-section]. Elements already on screen at hydration are marked shown in the same frame the
 * motion flag turns on, so nothing visible ever blinks out. Without JS everything stays visible.
 */
export function Reveals() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-landing]");
    if (!root) return;
    const reduce = prefersReducedMotion();
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    const sections = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          trackLanding("landing_section_viewed", { section: entry.target.getAttribute("data-section") ?? "" });
          sections.unobserve(entry.target);
        }
      },
      { threshold: 0.35 },
    );
    if (!reduce) {
      const height = window.innerHeight;
      for (const node of root.querySelectorAll("[data-reveal]")) {
        const box = node.getBoundingClientRect();
        if (box.top < height * 0.92 && box.bottom > 0) node.setAttribute("data-shown", "");
        else reveal.observe(node);
      }
      root.setAttribute("data-motion", "on");
    }
    for (const node of root.querySelectorAll("[data-section]")) sections.observe(node);
    return () => {
      reveal.disconnect();
      sections.disconnect();
    };
  }, []);
  return null;
}

/** A bar that appears once the whole hero (form and feature reel) has scrolled away, so it never
 * covers the reel's chips, and hides near the closing form. */
export function StickyCta({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero");
    const final = document.getElementById("final-signup");
    if (!hero) return;
    const state = { heroOut: false, finalIn: false };
    const update = () => setVisible(state.heroOut && !state.finalIn);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) state.heroOut = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (entry.target === final) state.finalIn = entry.isIntersecting;
      }
      update();
    });
    observer.observe(hero);
    if (final) observer.observe(final);
    return () => observer.disconnect();
  }, []);
  return (
    <div className={s.sticky} data-visible={visible || undefined} inert={!visible}>
      {children}
    </div>
  );
}
