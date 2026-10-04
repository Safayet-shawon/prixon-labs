import { useSyncExternalStore } from 'react'

let query
function getQuery() {
  query ??= window.matchMedia('(prefers-reduced-motion: reduce)')
  return query
}
function subscribe(onChange) {
  const media = getQuery()
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}
function getSnapshot() {
  return getQuery().matches
}
function getServerSnapshot() {
  return true
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
