import React, { Component, type ReactNode } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { AlertTriangle, RotateCcw, Home } from "@/components/icons";
import { reportError } from "@/lib/errorLogger";
import { colorTokens, fonts, webPointer } from "@/theme";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Report full diagnostic error with component trace to server logs / telemetry
    reportError(error, {
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  handleGoHome = () => {
    this.setState({ hasError: false });
    try {
      router.replace("/home");
    } catch {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <AlertTriangle color={colorTokens.errorText} size={32} />
            </View>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              An unexpected error occurred while displaying this page. Our team has been notified.
            </Text>
            <View style={styles.buttonRow}>
              <Pressable
                accessibilityLabel="Try again"
                onPress={this.handleReset}
                style={[styles.primaryButton, webPointer]}
              >
                <RotateCcw color={colorTokens.onBrand} size={16} />
                <Text style={styles.primaryButtonText}>Try again</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Go to Home"
                onPress={this.handleGoHome}
                style={[styles.secondaryButton, webPointer]}
              >
                <Home color={colorTokens.textPrimary} size={16} />
                <Text style={styles.secondaryButtonText}>Go to Home</Text>
              </Pressable>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: colorTokens.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    maxWidth: 440,
    width: "100%",
    backgroundColor: colorTokens.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colorTokens.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colorTokens.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colorTokens.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colorTokens.brand,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colorTokens.onBrand,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colorTokens.surfaceSunken,
    borderWidth: 1,
    borderColor: colorTokens.cardBorder,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colorTokens.textPrimary,
  },
});
