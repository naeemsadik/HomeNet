// Stands in for lucide-react-native in the native test project. Its icons are
// .mjs files that Jest does not transform, and the tests there are about what a
// screen does when it loads, not how its icons are drawn.
const Icon = () => null;
module.exports = new Proxy(
  { __esModule: true, default: Icon },
  { get: (target, key) => (key in target ? target[key] : Icon) },
);
