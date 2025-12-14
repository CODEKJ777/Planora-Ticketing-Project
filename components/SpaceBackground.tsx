import { useEffect } from 'react'

// Animated space backdrop with mouse-parallax.
export default function SpaceBackground() {
  useEffect(() => {
    let frameId: number
    const root = document.documentElement

    function handleMove(event: PointerEvent) {
      if (frameId) cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        const xRatio = event.clientX / window.innerWidth - 0.5
        const yRatio = event.clientY / window.innerHeight - 0.5
        // Scale ratios to gentle parallax ranges
        const x = (xRatio * 20).toFixed(2)
        const y = (yRatio * 20).toFixed(2)
        root.style.setProperty('--parallax-x', `${x}px`)
        root.style.setProperty('--parallax-y', `${y}px`)
      })
    }

    window.addEventListener('pointermove', handleMove)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div className="space-bg fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <div className="space-bg__gradient absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background" />
      <div className="space-bg__stars space-bg__stars--far opacity-50" />
      <div className="space-bg__stars space-bg__stars--near opacity-80" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      <div className="space-bg__glow absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="space-bg__glow absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-secondary/10 rounded-full blur-[100px] animate-pulse-glow delay-1000" />
    </div>
  )
}
