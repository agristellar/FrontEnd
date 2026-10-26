import messages from "../../i18n/workspace-ui.json";
const dictionary = messages as Record<string, string>;
const reverse = Object.fromEntries(
  Object.entries(dictionary).map(([vi, en]) => [en, vi]),
);
export const useWorkspaceText = () => {
  const { locale } = useI18n();
  const ui = (input: unknown): string => {
    if (typeof input !== "string") return input == null ? "" : String(input);
    const key = input.trim().replace(/\s+/g, " ");
    const canonical = Object.hasOwn(dictionary, key)
      ? key
      : Object.hasOwn(reverse, key)
        ? reverse[key]
        : undefined;
    if (!canonical) return input;
    const text = locale.value === "en" ? dictionary[canonical] : canonical;
    return (
      (input.match(/^\s*/)?.[0] || "") + text + (input.match(/\s*$/)?.[0] || "")
    );
  };
  return { ui };
};
