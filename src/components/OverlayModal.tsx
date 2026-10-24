import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BackHandler, Modal, Platform, StyleSheet, View, type ModalProps } from "react-native";

/**
 * Drop-downs and pickers open as a full-screen layer. A React Native `Modal` is
 * its own native window, and on Android one opened from inside another `Modal`
 * (the filters sheet, the valuation wizard) can fail to appear at all, so the
 * select looks dead when tapped.
 *
 * `OverlayHost` marks the root of a window (the app, or the inside of a `Modal`).
 * An `OverlayModal` below a host draws its content in a layer at the top of that
 * same window, above every sibling, and so never depends on a second native
 * window. With no host above it, it is a plain `Modal`.
 */
type Layers = Record<string, ReactNode>;

interface OverlayApi {
  show: (id: string, node: ReactNode) => void;
  hide: (id: string) => void;
}

const OverlayContext = createContext<OverlayApi | null>(null);

// Above everything a screen draws; `elevation` is what Android sorts by.
const LAYER_Z = 999;

export function OverlayHost({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<Layers>({});

  const api = useMemo<OverlayApi>(
    () => ({
      show: (id, node) => setLayers((current) => ({ ...current, [id]: node })),
      hide: (id) =>
        setLayers((current) => {
          if (!(id in current)) return current;
          const rest = { ...current };
          delete rest[id];
          return rest;
        }),
    }),
    [],
  );

  const ids = Object.keys(layers);

  return (
    <OverlayContext.Provider value={api}>
      <View style={styles.host}>
        {children}
        {ids.length > 0 ? (
          // box-none: the layers take touches, the empty space around them does not.
          <View pointerEvents="box-none" style={styles.layers}>
            {ids.map((id) => (
              <View key={id} pointerEvents="box-none" style={styles.layer}>
                {layers[id]}
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </OverlayContext.Provider>
  );
}

function HostedLayer({
  api,
  visible,
  onRequestClose,
  children,
}: {
  api: OverlayApi;
  visible: boolean;
  onRequestClose?: () => void;
  children: ReactNode;
}) {
  const id = useId();

  // Re-published after every render, before the screen is painted, so the
  // layer always shows current content (a search box in it must not lag the
  // value typed into it).
  useLayoutEffect(() => {
    if (visible) api.show(id, children);
    else api.hide(id);
  });
  useLayoutEffect(() => () => api.hide(id), [api, id]);

  // The system back button closes a layer the way it closes a Modal.
  const close = useCallback(() => onRequestClose?.(), [onRequestClose]);
  useEffect(() => {
    if (!visible || Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => subscription.remove();
  }, [visible, close]);

  return null;
}

interface OverlayModalProps {
  visible?: boolean;
  onRequestClose?: () => void;
  animationType?: ModalProps["animationType"];
  children: ReactNode;
}

/** A `Modal` that stays inside the window of the nearest `OverlayHost`. */
export function OverlayModal({ visible, onRequestClose, animationType = "fade", children }: OverlayModalProps) {
  const hostApi = useContext(OverlayContext);
  // Browsers portal a Modal to <body> and nest it without trouble.
  const api = Platform.OS === "web" ? null : hostApi;

  if (api) {
    return (
      <HostedLayer api={api} onRequestClose={onRequestClose} visible={!!visible}>
        {children}
      </HostedLayer>
    );
  }

  return (
    <Modal
      animationType={animationType}
      navigationBarTranslucent
      onRequestClose={onRequestClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      {children}
    </Modal>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
  layers: { ...StyleSheet.absoluteFill, zIndex: LAYER_Z, elevation: LAYER_Z },
  layer: { ...StyleSheet.absoluteFill },
});
