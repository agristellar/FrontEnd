// Leaf imports keep workspace icons independent of the legacy dynamic icon picker.
// Every Tabler Vue icon exposes the same component props as the public IconLeaf type.
declare module "@tabler/icons-vue/dist/esm/icons/*.mjs" {
  const icon: typeof import("@tabler/icons-vue").IconLeaf;
  export default icon;
}
