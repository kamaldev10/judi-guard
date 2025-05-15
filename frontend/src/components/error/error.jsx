import React, { Component } from "react";

const errorAnimationStyle = `
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}
.error-container {
  padding: 2rem;
  background-color: #fee;
  color: #900;
  border-radius: 8px;
  max-width: 480px;
  margin: 3rem auto;
  font-family: Arial, sans-serif;
  text-align: center;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.2);
}
.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  animation: bounce 2s infinite;
  fill: #900;
}
.error-message {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.error-details {
  font-size: 0.9rem;
  white-space: pre-wrap;
  color: #600;
  margin-top: 1rem;
  text-align: left;
  background: #fdd;
  padding: 1rem;
  border-radius: 5px;
  max-height: 150px;
  overflow-y: auto;
}
`;

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <style>{errorAnimationStyle}</style>
          <div className="error-container" role="alert" aria-live="assertive">
            <svg
              className="error-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
              aria-hidden="true"
            >
              <circle
                cx="32"
                cy="32"
                r="30"
                stroke="#900"
                strokeWidth="4"
                fill="none"
              />
              <line
                x1="20"
                y1="20"
                x2="44"
                y2="44"
                stroke="#900"
                strokeWidth="4"
              />
              <line
                x1="44"
                y1="20"
                x2="20"
                y2="44"
                stroke="#900"
                strokeWidth="4"
              />
            </svg>
            <h2 className="error-message">Something went wrong.</h2>
            {this.state.error && <p>{this.state.error.toString()}</p>}
            {this.state.errorInfo && (
              <pre className="error-details">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
        </>
      );
    }

    return this.props.children;
  }
}
