import React, { Component, type ErrorInfo, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "@/App";
import "@/styles.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Frontend gagal dimuat", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="mx-auto mt-8 max-w-3xl rounded-lg border bg-background p-6 text-foreground">
          <h1 className="text-2xl font-semibold">Frontend gagal dimuat</h1>
          <p className="mt-3 text-muted-foreground">{this.state.error.message}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Buka DevTools Console untuk detail error JavaScript.
          </p>
        </main>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemen root tidak ditemukan.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
