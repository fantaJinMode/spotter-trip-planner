import { Component, type ReactNode } from "react";
import { Alert, Button } from "@mui/material";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => this.setState({ hasError: false })}>
              Retry
            </Button>
          }
        >
          Something went wrong rendering this section.
        </Alert>
      );
    }
    return this.props.children;
  }
}
