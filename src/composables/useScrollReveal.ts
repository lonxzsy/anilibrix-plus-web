import { onMounted, onUnmounted, type Ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  stagger?: number
  fromVars?: gsap.TweenVars
  once?: boolean
}

export function useScrollReveal() {
  const observers: IntersectionObserver[] = []
  const scrollTriggers: ScrollTrigger[] = []

  function revealElements(
    container: string | Element | Ref<Element | null>,
    options: ScrollRevealOptions = {}
  ) {
    const {
      threshold = 0.08,
      rootMargin = '0px 0px -40px 0px',
      stagger = 0.05,
      fromVars = {},
      once = true,
    } = options

    const containerEl =
      container instanceof Element
        ? container
        : (container as Ref<Element | null>)?.value || document.querySelector(container as string)

    if (!containerEl) return

    const children = Array.from(containerEl.children).filter(
      (child) => child instanceof HTMLElement
    ) as HTMLElement[]

    if (children.length === 0) return

    children.forEach((child, i) => {
      child.style.opacity = '0'
      child.style.transform = 'translateY(24px) scale(0.98)'
      child.style.willChange = 'transform, opacity'
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          const idx = children.indexOf(el)
          const delay = idx >= 0 ? idx * stagger : 0

          gsap.to(el, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            delay,
            ease: 'power2.out',
            onStart: () => { el.style.willChange = 'auto' },
            ...fromVars,
          })

          if (once) observer.unobserve(el)
        })
      },
      { threshold, rootMargin }
    )

    children.forEach((child) => observer.observe(child))
    observers.push(observer)
  }

  function revealFromContainer(
    containerSelector: string,
    childSelector: string,
    options: ScrollRevealOptions = {}
  ) {
    const { stagger = 0.06, fromVars = {} } = options

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerSelector,
        start: 'top 88%',
        once: options.once ?? true,
      },
    })

    tl.from(`${containerSelector} ${childSelector}`, {
      opacity: 0,
      y: 30,
      scale: 0.96,
      duration: 0.45,
      stagger,
      ease: 'power2.out',
      ...fromVars,
    })

    return tl
  }

  function cleanup() {
    observers.forEach((obs) => obs.disconnect())
    observers.length = 0
    scrollTriggers.forEach((st) => st.kill())
    scrollTriggers.length = 0
  }

  onUnmounted(cleanup)

  return {
    revealElements,
    revealFromContainer,
    cleanup,
  }
}
