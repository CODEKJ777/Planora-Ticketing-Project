import { useEffect } from 'react'

// Animated space backdrop with mouse-parallax.
export default function SpaceBackground() {
  useEffect(() => {
    function handleMove(event: PointerEvent) {
      const xRatio = event.clientX / window.innerWidth - 0.5
      const yRatio = event.clientY / window.innerHeight - 0.5
      // Scale ratios to gentle parallax ranges
      const x = (xRatio * 30).toFixed(2)
      const y = (yRatio * 30).toFixed(2)
      const root = document.documentElement
      root.style.setProperty('--parallax-x', `${x}px`)
      root.style.setProperty('--parallax-y', `${y}px`)
    }

    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  return (
    <div className="space-bg" aria-hidden>
      <div className="space-bg__gradient" />
      <div className="space-bg__stars space-bg__stars--far" />
      <div className="space-bg__stars space-bg__stars--near" />
      <div className="space-bg__moon" />
      <div className="space-bg__glow" />
      <div className="space-bg__noise" />
      <div className="space-bg__shooting" />
    </div>
  )
}
