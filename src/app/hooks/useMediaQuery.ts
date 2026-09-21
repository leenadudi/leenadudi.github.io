import { useEffect, useState, type RefObject } from "react";

/** True while the CSS media query matches. Safe on the server (returns false). */
export function useMediaQuery(query: string): boolean {
  const get = () => typeof window !== "undefined" && window.matchMedia(query).matches;
  const [matches, setMatches] = useState<boolean>(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Phone-sized layout: stack side-by-side panels vertically. */
export function useNarrow(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/** Devices with a real mouse: the only place a custom cursor / paint canvas makes sense. */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/** Live viewport size, updated on resize (throttled to one frame). */
export function useViewport(): { w: number; h: number } {
  const read = () => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1000,
    h: typeof window !== "undefined" ? window.innerHeight : 600,
  });
  const [size, setSize] = useState(read);
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSize(read()));
    };
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);
  return size;
}

/** Rendered size of an element (ResizeObserver). Used for the sticky stage so
 *  the scene padding matches what is actually on screen: on iOS Safari
 *  `window.innerHeight` and `100dvh` do not always agree. */
export function useStageSize(ref: RefObject<HTMLElement | null>): { w: number; h: number } {
  const [size, setSize] = useState({ w: 1000, h: 600 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) setSize(prev => (prev.w === r.width && prev.h === r.height ? prev : { w: r.width, h: r.height }));
    };
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); });
    ro.observe(el);
    measure();
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [ref]);
  return size;
}
