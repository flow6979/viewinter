import { Component, type ReactNode } from 'react'

/** If a screen crashes, show what happened instead of a blank page */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    // Navigating somewhere else clears the error
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="crash">
        <h2>Something broke on this screen</h2>
        <p className="muted small">{this.state.error.message}</p>
        <div className="row">
          <button className="btn primary" onClick={() => window.location.reload()}>
            Reload
          </button>
          <button className="btn" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      </div>
    )
  }
}
