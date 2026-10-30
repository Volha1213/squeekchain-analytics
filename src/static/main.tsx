import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Dashboard } from "../components/dashboard";
import "./base.css";
import "./static.css";

export class RenderBoundary extends Component<
  { children: ReactNode }, { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed)
      return <main className="fatal-error">
        <h1>The view could not open.</h1>
        <p>Independent community project. No wallet or blockchain action was performed.</p>
        <p>Try reopening this static site. Live readings may be unavailable.</p>
        <button className="subtle-button" onClick={() => location.reload()}>Reload site</button>
      </main>;
    return this.props.children;
  }
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<RenderBoundary><Dashboard /></RenderBoundary>);
