import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "@/components/icons";
import { colorTokens, fonts, radius, webPointer } from "@/theme";
import { useTranslation } from "@/i18n";
import { useResponsive } from "@/hooks/useResponsive";

const VIDEO_SRC = "/homenet-explainer.mp4";
const PREVIEW_LIMIT_SECONDS = 30;

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function HomeNetExplainerSection() {
  const { t } = useTranslation();
  const { isPhone, isTablet } = useResponsive();

  const containerRef = useRef<View>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(197.8);
  const [unlockedFull, setUnlockedFull] = useState(false);
  const [showPreviewLimit, setShowPreviewLimit] = useState(false);
  const [showUnmutePrompt, setShowUnmutePrompt] = useState(false);
  const [hasStartedAutoPlay, setHasStartedAutoPlay] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Playback handlers
  const handlePlay = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        // Fallback to muted if user gesture required
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          setShowUnmutePrompt(true);
          videoRef.current.play().then(() => setIsPlaying(true));
        }
      });
  }, []);

  const handlePause = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      if (showPreviewLimit) {
        setShowPreviewLimit(false);
      }
      handlePlay();
    }
  }, [isPlaying, showPreviewLimit, handlePlay, handlePause]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      setShowUnmutePrompt(false);
    }
  }, []);

  const handleUnmuteClick = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    setIsMuted(false);
    setShowUnmutePrompt(false);
  }, []);

  const handleContinueFull = useCallback(() => {
    setUnlockedFull(true);
    setShowPreviewLimit(false);
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      setShowUnmutePrompt(false);
      videoRef.current.play().then(() => setIsPlaying(true));
    }
  }, []);

  const handleReplayPreview = useCallback(() => {
    setShowPreviewLimit(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play().then(() => setIsPlaying(true));
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (Platform.OS !== "web" || !videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if ((videoRef.current as any).webkitRequestFullscreen) {
      (videoRef.current as any).webkitRequestFullscreen();
    }
  }, []);

  const handleSeek = useCallback(
    (e: any) => {
      if (!videoRef.current || duration <= 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = ratio * duration;

      if (!unlockedFull && targetTime >= PREVIEW_LIMIT_SECONDS) {
        setShowPreviewLimit(true);
        videoRef.current.pause();
        setIsPlaying(false);
        return;
      }

      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    },
    [duration, unlockedFull]
  );

  // Auto-play preview when scrolled into viewport on web
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined" || hasStartedAutoPlay) return;

    let observer: IntersectionObserver | null = null;
    const node = videoRef.current;

    if (node && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !hasStartedAutoPlay) {
            setHasStartedAutoPlay(true);
            // Attempt autoplay with sound
            node.muted = false;
            node
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsMuted(false);
              })
              .catch(() => {
                // Autoplay policy prevented sound; fall back to muted autoplay
                node.muted = true;
                setIsMuted(true);
                setShowUnmutePrompt(true);
                node
                  .play()
                  .then(() => setIsPlaying(true))
                  .catch(() => {
                    // Browser requires user click
                    setIsPlaying(false);
                  });
              });
          }
        },
        { threshold: 0.35 }
      );
      observer.observe(node);
    }

    return () => {
      observer?.disconnect();
    };
  }, [hasStartedAutoPlay]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || Platform.OS !== "web") return;

    const onTimeUpdate = () => {
      const cur = video.currentTime;
      setCurrentTime(cur);

      // Check preview limit (30s)
      if (!unlockedFull && cur >= PREVIEW_LIMIT_SECONDS) {
        video.pause();
        setIsPlaying(false);
        setShowPreviewLimit(true);
      }
    };

    const onLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [unlockedFull]);

  // Controls auto-hide on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const previewThresholdPercent = duration > 0 ? (PREVIEW_LIMIT_SECONDS / duration) * 100 : 15;

  return (
    <View ref={containerRef} style={styles.sectionWrap}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={[styles.title, isPhone && styles.titlePhone]}>
          {t("home.explainerTitle")}
        </Text>
        <Text style={[styles.subtitle, isPhone && styles.subtitlePhone]}>
          {t("home.explainerSubtitle")}
        </Text>
      </View>

      {/* Video Container Frame */}
      <View
        style={[
          styles.playerCard,
          isPhone && styles.playerCardPhone,
          isTablet && styles.playerCardTablet,
        ]}
        {...(Platform.OS === "web"
          ? ({
              onMouseMove: handleMouseMove,
              onMouseLeave: () => isPlaying && setShowControls(false),
            } as any)
          : {})}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            backgroundColor: "#061612",
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {Platform.OS === "web" ? (
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              playsInline
              preload="metadata"
              onClick={togglePlay}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                cursor: "pointer",
              }}
            />
          ) : (
            <View style={styles.nativeFallback}>
              <Play color="#FFFFFF" size={48} strokeWidth={2} />
              <Text style={styles.fallbackText}>{t("home.explainerTitle")}</Text>
            </View>
          )}

          {/* Big Center Play Button (When Paused & Not Blocked by Overlay) */}
          {!isPlaying && !showPreviewLimit && (
            <div
              onClick={handlePlay}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 72,
                height: 72,
                borderRadius: "50%",
                backgroundColor: "rgba(15, 109, 85, 0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                cursor: "pointer",
                transition: "transform 0.2s ease, background-color 0.2s ease",
                zIndex: 10,
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.08)";
                e.currentTarget.style.backgroundColor = "rgba(15, 109, 85, 1)";
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
                e.currentTarget.style.backgroundColor = "rgba(15, 109, 85, 0.9)";
              }}
            >
              <Play color="#FFFFFF" size={32} strokeWidth={2.5} />
            </div>
          )}

          {/* Unmute Prompt Pill (If Autoplay was muted by browser policy) */}
          {showUnmutePrompt && isPlaying && !showPreviewLimit && (
            <div
              onClick={handleUnmuteClick}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                backgroundColor: "rgba(6, 22, 18, 0.85)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 30,
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
                zIndex: 20,
              }}
            >
              <VolumeX color="#FBBF24" size={16} strokeWidth={2.5} />
              <span>{t("home.explainerUnmuteBtn")}</span>
            </div>
          )}

          {/* 30-Second Preview Limit Finished Overlay */}
          {showPreviewLimit && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(6, 22, 18, 0.92)",
                backdropFilter: "blur(12px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                textAlign: "center",
                zIndex: 30,
                animation: "fadeIn 0.3s ease",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "rgba(15, 109, 85, 0.2)",
                  border: "2px solid #0F6D55",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Sparkles color="#34D399" size={26} strokeWidth={2.5} />
              </div>

              <h3
                style={{
                  color: "#FFFFFF",
                  fontSize: isPhone ? 18 : 22,
                  fontWeight: 700,
                  margin: "0 0 8px 0",
                  fontFamily: fonts.bold,
                }}
              >
                {t("home.explainerPreviewLimitTitle")}
              </h3>

              <p
                style={{
                  color: "#CBD5E1",
                  fontSize: isPhone ? 13 : 15,
                  maxWidth: 520,
                  lineHeight: 1.5,
                  margin: "0 0 24px 0",
                  fontFamily: fonts.regular,
                }}
              >
                {t("home.explainerPreviewLimitDesc")}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={handleContinueFull}
                  style={{
                    backgroundColor: "#0F6D55",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 10,
                    padding: isPhone ? "10px 18px" : "12px 24px",
                    fontSize: isPhone ? 14 : 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(15, 109, 85, 0.4)",
                    transition: "transform 0.15s ease",
                  }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Play color="#FFFFFF" size={16} strokeWidth={2.5} />
                  <span>{t("home.explainerContinueBtn")}</span>
                </button>

                <button
                  onClick={handleReplayPreview}
                  style={{
                    backgroundColor: "transparent",
                    color: "#E2E8F0",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    borderRadius: 10,
                    padding: isPhone ? "10px 18px" : "12px 20px",
                    fontSize: isPhone ? 14 : 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <RotateCcw color="#E2E8F0" size={15} strokeWidth={2.5} />
                  <span>{t("home.explainerReplayBtn")}</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Custom Controls Bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: isPhone ? "8px 12px" : "12px 18px",
              background: "linear-gradient(to top, rgba(6, 22, 18, 0.95), rgba(6, 22, 18, 0))",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              opacity: showControls || !isPlaying ? 1 : 0,
              transition: "opacity 0.25s ease",
              pointerEvents: showControls || !isPlaying ? "auto" : "none",
              zIndex: 20,
            }}
          >
            {/* Timeline Scrubber */}
            <div
              onClick={handleSeek}
              style={{
                width: "100%",
                height: 6,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 4,
                cursor: "pointer",
                position: "relative",
              }}
            >
              {/* 30s preview limit marker */}
              {!unlockedFull && (
                <div
                  title="30s Preview Boundary"
                  style={{
                    position: "absolute",
                    left: `${previewThresholdPercent}%`,
                    top: -3,
                    bottom: -3,
                    width: 3,
                    backgroundColor: "#FBBF24",
                    borderRadius: 2,
                    zIndex: 2,
                  }}
                />
              )}

              {/* Played progress */}
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  backgroundColor: "#0F6D55",
                  borderRadius: 4,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: -4,
                    top: -3,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 0 6px rgba(0,0,0,0.4)",
                  }}
                />
              </div>
            </div>

            {/* Controls row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#FFFFFF",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button
                  onClick={togglePlay}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause color="#FFFFFF" size={18} strokeWidth={2.5} />
                  ) : (
                    <Play color="#FFFFFF" size={18} strokeWidth={2.5} />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX color="#FBBF24" size={18} strokeWidth={2.5} />
                  ) : (
                    <Volume2 color="#FFFFFF" size={18} strokeWidth={2.5} />
                  )}
                </button>

                <span
                  style={{
                    fontSize: 12,
                    color: "#E2E8F0",
                    fontFamily: fonts.mono || "monospace",
                  }}
                >
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {!unlockedFull && (
                  <span
                    style={{
                      fontSize: 11,
                      backgroundColor: "rgba(251, 191, 36, 0.2)",
                      color: "#FBBF24",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontWeight: 600,
                    }}
                  >
                    30s Preview
                  </span>
                )}
              </div>

              <div>
                <button
                  onClick={handleFullscreen}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label="Fullscreen"
                >
                  <Maximize2 color="#FFFFFF" size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    width: "100%",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
    maxWidth: 780,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colorTokens.brandSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginBottom: 12,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colorTokens.brandText,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 36,
    color: colorTokens.ink,
    textAlign: "center",
    marginBottom: 10,
  },
  titlePhone: {
    fontSize: 22,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: colorTokens.muted,
    textAlign: "center",
  },
  subtitlePhone: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  playerCard: {
    width: "100%",
    maxWidth: 960,
    backgroundColor: colorTokens.surface,
    borderRadius: radius.xl,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(15, 109, 85, 0.15)",
    boxShadow: "0 12px 40px rgba(6, 22, 18, 0.08)",
    overflow: "hidden",
  },
  playerCardTablet: {
    maxWidth: "100%",
  },
  playerCardPhone: {
    padding: 4,
    borderRadius: radius.lg,
  },
  nativeFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#061612",
  },
  fallbackText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 12,
  },
});
