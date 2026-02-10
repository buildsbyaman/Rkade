"use client"

import { useEffect, useState } from 'react'

/**
 * Custom hook to detect if the current screen size is desktop
 * Returns true for screens wider than 1024px (lg breakpoint)
 */
export function useDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    // Check initial screen size
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return isDesktop
}