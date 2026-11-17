import { useEffect, useState } from 'react'

// Ambil data dari fungsi service; kembalikan { data, loading, isFallback }.
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, isFallback: false })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true }))
    fetcher().then((res) => {
      if (!cancelled) setState({ data: res.data, loading: false, isFallback: res.isFallback })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
