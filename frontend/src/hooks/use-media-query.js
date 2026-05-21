import { useEffect, useState } from "react"

export function useMediaQuery(query) {
	const [matches, setMatches] = useState(() => {
		if (typeof window === "undefined") {
			return false
		}

		return window.matchMedia(query).matches
	})

	useEffect(() => {
		if (typeof window === "undefined") {
			return undefined
		}

		const mediaQueryList = window.matchMedia(query)

		const updateMatches = () => {
			setMatches(mediaQueryList.matches)
		}

		updateMatches()
		mediaQueryList.addEventListener("change", updateMatches)

		return () => {
			mediaQueryList.removeEventListener("change", updateMatches)
		}
	}, [query])

	return matches
}
