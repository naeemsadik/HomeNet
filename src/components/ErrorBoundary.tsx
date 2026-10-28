import React, { Component, type ReactNode } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { router } from "expo-router";
import { AlertTriangle, RotateCcw, Home } from "@/components/icons";
import { reportError } from "@/lib/errorLogger";
import { colorTokens, fonts, webPointer } from "@/theme";

import { useTranslation } from "@/i18n";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

function DefaultErrorFallback({ onReset, onGoHome }: { onReset: () => void; onGoHome: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <AlertTriangle color={colorTokens.errorText} size={32} />
        </View>
        <Text style={styles.title}>{t("errorBoundary.title")}</Text>
        <Text style={styles.message}>{t("errorBoundary.message")}</Text>
        <View style={styles.buttonRow}>
          <Pressable
            accessibilityLabel={t("errorBoundary.tryAgain")}
            onPress={onReset}
            style={[styles.primaryButton, webPointer]}
          >
            <RotateCcw color={colorTokens.onBrand} size={16} />
            <Text style={styles.primaryButtonText}>{t("errorBoundary.tryAgain")}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={t("errorBoundary.goHome")}
            onPress={onGoHome}
            style={[styles.secondaryButton, webPointer]}
          >
            <Home color={colorTokens.textPrimary} size={16} />
            <Text style={styles.secondaryButtonText}>{t("errorBoundary.goHome")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
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
      router.replace("/");
    } catch {
      // A browser can reload the site root. On a phone `window.location` does not
      // exist, and this runs while the app is already failing, so it must not throw.
      if (Platform.OS === "web" && typeof window !== "undefined" && window.location) {
        window.location.href = "/";
      }
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback onReset={this.handleReset} onGoHome={this.handleGoHome} />;
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
