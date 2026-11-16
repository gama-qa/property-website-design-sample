"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE_HALDEN } from "./motion";

let registered = false;

/** Register plugins and the house ease once, on the client. */
export function ensureGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("halden", EASE_HALDEN.join(","));
  gsap.defaults({ ease: "halden", duration: 1.1 });
  registered = true;
  return gsap;
}

export { gsap, ScrollTrigger };
