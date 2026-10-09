"use client";

import { Component } from "react";
import { ErrorState } from "@/components/ui/Feedback";

/** Keeps one failing dashboard section from taking down the rest (PRD §6.3). */
export class SectionBoundary extends Component<{ name: string; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <ErrorState
          title={`We couldn't load ${this.props.name}`}
          body="The rest of Alivora is still working."
          onRetry={() => this.setState({ failed: false })}
        />
      );
    }
    return this.props.children;
  }
}
