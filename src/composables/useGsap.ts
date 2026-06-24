import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(ScrollTrigger, Flip)

export function useGsap() {
  function animateIn(el: string | Element, options?: Record<string, any>) {
    return gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: 'power2.out',
      ...options,
    })
  }

  function staggerCards(
    container: string | Element,
    options?: { stagger?: number; fromVars?: Record<string, any>; trigger?: Element | string }
  ) {
    const nodes = container instanceof Element
      ? container.querySelectorAll('[data-stagger]')
      : document.querySelectorAll(`${container} [data-stagger]`)

    if (!nodes.length) return

    const cards = Array.from(nodes)
    const tl = gsap.timeline({
      scrollTrigger: options?.trigger
        ? { trigger: options.trigger, start: 'top 88%' }
        : undefined,
    })

    tl.from(cards, {
      opacity: 0,
      y: 30,
      scale: 0.96,
      duration: 0.45,
      stagger: options?.stagger ?? 0.06,
      ease: 'power2.out',
      ...options?.fromVars,
    })

    return tl
  }

  function parallax(
    el: string | Element,
    options?: { speed?: number; trigger?: string | Element }
  ) {
    const speed = options?.speed ?? 0.3
    return gsap.to(el, {
      y: `${100 * speed}%`,
      ease: 'none',
      scrollTrigger: {
        trigger: options?.trigger ?? el,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }

  function animateCount(
    el: string | Element | null,
    from: number,
    to: number,
    options?: Record<string, any>
  ) {
    if (!el) return
    return gsap.fromTo(
      el,
      { textContent: from },
      {
        textContent: to,
        duration: 1.2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: el as Element,
          start: 'top 90%',
        },
        ...options,
      }
    )
  }

  function flipLayout(
    el: Element,
    state: Flip.FlipState,
    options?: Record<string, any>
  ) {
    return Flip.from(state, {
      duration: 0.5,
      ease: 'power2.inOut',
      ...options,
    }).play()
  }

  function pageEnter(el: Element, backward: boolean) {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    if (backward) {
      tl.to(el, { opacity: 1, x: 0, duration: 0.3 })
    } else {
      tl.to(el, { opacity: 1, x: 0, scale: 1, duration: 0.4 })
      const staggerEls = Array.from(el.querySelectorAll('[data-stagger]'))
      if (staggerEls.length) {
        tl.from(staggerEls, { opacity: 0, y: 20, stagger: 0.04, duration: 0.35 }, '-=0.15')
      }
    }
    return tl
  }

  function pageLeave(el: Element, backward: boolean) {
    const tl = gsap.timeline({ defaults: { ease: 'power2.in' } })
    if (backward) {
      tl.to(el, { opacity: 0, x: 20, duration: 0.2 })
    } else {
      tl.to(el, { opacity: 0, scale: 0.99, duration: 0.2 })
    }
    return tl
  }

  function flyToDetail(cardEl: Element, targetRect: DOMRect) {
    const clone = cardEl.cloneNode(true) as HTMLElement
    clone.style.position = 'fixed'
    clone.style.zIndex = '9999'
    clone.style.pointerEvents = 'none'
    clone.style.margin = '0'
    clone.style.width = `${cardEl.getBoundingClientRect().width}px`
    clone.style.height = `${cardEl.getBoundingClientRect().height}px`

    const cardRect = cardEl.getBoundingClientRect()
    clone.style.left = `${cardRect.left}px`
    clone.style.top = `${cardRect.top}px`

    document.body.appendChild(clone)

    const tl = gsap.timeline({
      onComplete: () => clone.remove(),
    })

    tl.to(clone, {
      left: targetRect.left,
      top: targetRect.top,
      width: targetRect.width,
      height: targetRect.height,
      duration: 0.45,
      ease: 'power2.inOut',
      borderRadius: '4px',
    })
    tl.to(clone, { opacity: 0, duration: 0.15 }, '-=0.1')

    return tl
  }

  function pulse(el: string | Element, scale = 1.15, duration = 0.3) {
    return gsap.fromTo(el, { scale: 1 }, { scale, yoyo: true, repeat: 1, duration, ease: 'power2.out' })
  }

  function shake(el: string | Element, intensity = 4) {
    return gsap.to(el, {
      x: `random(-${intensity}, ${intensity})`,
      repeat: 3,
      duration: 0.08,
      yoyo: true,
      ease: 'power1.inOut',
    })
  }

  return {
    animateIn,
    staggerCards,
    parallax,
    animateCount,
    flipLayout,
    pageEnter,
    pageLeave,
    flyToDetail,
    pulse,
    shake,
  }
}

export { gsap, ScrollTrigger, Flip }
