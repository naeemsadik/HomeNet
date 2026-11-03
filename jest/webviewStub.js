// Stands in for react-native-webview in tests. The real module looks up its native side
// (RNCWebViewModule) as soon as it is imported, and Jest has none, so any screen with the
// app's map would fail to load. This renders a host element with the WebView's props, and
// gives the two methods the app calls: tests read them through `__mock`.
const React = require("react");

const postMessage = jest.fn();
const reload = jest.fn();

const WebView = React.forwardRef(function WebView(props, ref) {
  React.useImperativeHandle(ref, () => ({ postMessage, reload }), []);
  return React.createElement("RNCWebView", props);
});

module.exports = { __esModule: true, WebView, default: WebView, __mock: { postMessage, reload } };
