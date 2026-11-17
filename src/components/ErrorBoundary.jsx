import { Component } from 'react'

// Tangkap error render supaya tidak berakhir layar putih.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="p-6 text-center">
        <p className="font-medium">Halaman gagal ditampilkan</p>
        <p className="mt-1 text-sm text-muted">{String(this.state.error.message)}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
          Muat ulang
        </button>
      </div>
    )
  }
}
