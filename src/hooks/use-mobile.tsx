import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // This code now runs only on the client, after the component has mounted.
    // This prevents any server-client mismatch during the initial render.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Handler to call on media query change
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    // Set the initial value correctly on the client
    setIsMobile(mql.matches);

    // Add the event listener
    mql.addEventListener("change", onChange)

    // Clean up the event listener on component unmount
    return () => mql.removeEventListener("change", onChange)
  }, []) // Empty dependency array ensures this effect runs only once on mount.

  return isMobile
}
