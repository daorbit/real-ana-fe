import { ActionIcon, Button, createTheme, Pagination, rem, ThemeIcon } from "@mantine/core";

const DROPDOWN_DEFAULTS = {
  checkIconPosition: "right" as const,
  maxDropdownHeight: 340,
  comboboxProps: {
    radius: 12,
    shadow: "lg",
    offset: 6,
    transitionProps: { transition: "pop" as const, duration: 140 },
  },
};

const SOFT_HOVER = "color-mix(in srgb, var(--text) 7%, var(--surface-2))";

const DROPDOWN_CLASSES = {
  dropdown: "app-combobox-dropdown",
  option: "app-combobox-option",
  group: "app-combobox-group",
  groupLabel: "app-combobox-group-label",
};

export const theme = createTheme({
  primaryColor: "emerald",
  primaryShade: { light: 6, dark: 7 },
  fontFamily: "'Google Sans Flex', ui-sans-serif, system-ui, -apple-system, sans-serif",
  fontFamilyMonospace: "ui-monospace, 'SF Mono', Menlo, monospace",
  headings: {
    fontFamily: "'Google Sans Flex', ui-sans-serif, system-ui, sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: rem(27), lineHeight: "1.2" },
      h2: { fontSize: rem(21), lineHeight: "1.25" },
      h3: { fontSize: rem(16.5), lineHeight: "1.3" },
    },
  },
  defaultRadius: "md",
 
  cursorType: "pointer",
  colors: {
    emerald: [
      "#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#34d399",
      "#10b981", "#059669", "#047857", "#065f46", "#064e3b",
    ],
    dark: [
      "#c9c9c9", "#a8a8a8", "#8a8a8a", "#5e5e5e", "#2c2c2c",
      "#242424", "#1c1c1c", "#161616", "#0f0f0f", "#0a0a0a",
    ],
  },
  shadows: {
    md: "0 1px 3px rgba(15,17,21,0.08), 0 8px 24px -8px rgba(15,17,21,0.18)",
    lg: "0 2px 6px rgba(15,17,21,0.08), 0 18px 44px -12px rgba(15,17,21,0.24)",
  },
  components: {
 
    Loader: { defaultProps: { type: "oval" } },
 
    Skeleton: { defaultProps: { className: "skeleton-shimmer" } },
 
    Badge: {
 
      vars: () => ({
        root: {
          "--badge-bg": "transparent",
          "--badge-bd": "none",
          "--badge-radius": "0",
        },
      }),
      styles: {
        root: {
          paddingInline: 0,
          textTransform: "none",
          fontWeight: 650,
 
          height: "auto",
          lineHeight: 1.35,
          letterSpacing: "0.01em",
          fontVariantNumeric: "tabular-nums",
        },
      },
    },
 
    Switch: {
      vars: (_theme: unknown, props: { color?: string }) => ({
        root: {
          "--switch-bg": "var(--surface-2)",
          "--switch-bd": "1px solid var(--border)",
          "--switch-thumb-bg": "var(--text)",
          ...(props.color ? {} : { "--switch-color": "var(--cta)" }),
        },
      }),
    },
    Checkbox: {
      vars: (_theme: unknown, props: { color?: string }) => ({
        root: {
          "--checkbox-bd": "1px solid var(--border)",
          "--checkbox-icon-color": props.color ? "var(--accent-contrast)" : "var(--cta-fg)",
          ...(props.color ? {} : { "--checkbox-color": "var(--cta)" }),
        },
      }),
    },
    Radio: {
      vars: (_theme: unknown, props: { color?: string }) => ({
        root: {
          "--radio-bd": "1px solid var(--border)",
          "--radio-icon-color": props.color ? "var(--accent-contrast)" : "var(--cta-fg)",
          ...(props.color ? {} : { "--radio-color": "var(--cta)" }),
        },
      }),
    },
 
    ThemeIcon: ThemeIcon.extend({
      vars: (_theme, props) =>
        props.variant === "filled"
          ? { root: { "--ti-color": "var(--accent-contrast)" } }
          : { root: {} },
    }),
    Modal: {
      defaultProps: {
        radius: 24,
        centered: true,
        overlayProps: { backgroundOpacity: 0.5, blur: 8 },
        transitionProps: { transition: "pop", duration: 200 },
      },
    },
    Menu: {
      defaultProps: {
        radius: 14,
        shadow: "lg",
        transitionProps: { transition: "pop", duration: 140 },
      },
    },
    Popover: { defaultProps: { radius: 14, shadow: "lg" } },
    Card: { defaultProps: { radius: "md" } },
    Button: Button.extend({
      defaultProps: { radius: "md" },
      styles: { label: { fontWeight: 500, letterSpacing: "-0.005em" } },
      vars: (_theme, props) => {
        if (props.color && props.color !== "emerald") return { root: {} };
        if (props.variant === undefined || props.variant === "filled") {
          return {
            root: {
              "--button-bg": "var(--cta)",
              "--button-hover": "var(--cta-hover)",
              "--button-color": "var(--cta-fg)",
              "--button-hover-color": "var(--cta-fg)",
            },
          };
        }
        if (props.variant === "light") {
          return {
            root: {
              "--button-bg": "var(--surface-2)",
              "--button-hover": SOFT_HOVER,
              "--button-color": "var(--text)",
              "--button-hover-color": "var(--text)",
              "--button-bd": "1px solid var(--border)",
            },
          };
        }
        return { root: {} };
      },
    }),
    ActionIcon: ActionIcon.extend({
      vars: (_theme, props) => {
        if (props.color && props.color !== "emerald") return { root: {} };
        if (props.variant === undefined || props.variant === "filled") {
          return {
            root: {
              "--ai-bg": "var(--cta)",
              "--ai-hover": "var(--cta-hover)",
              "--ai-color": "var(--cta-fg)",
              "--ai-hover-color": "var(--cta-fg)",
            },
          };
        }
        if (props.variant === "light") {
          return {
            root: {
              "--ai-bg": "var(--surface-2)",
              "--ai-hover": SOFT_HOVER,
              "--ai-color": "var(--text)",
              "--ai-hover-color": "var(--text)",
              "--ai-bd": "1px solid var(--border)",
            },
          };
        }
        return { root: {} };
      },
    }),
    Pagination: Pagination.extend({
      vars: (_theme, props) =>
        !props.color || props.color === "emerald"
          ? {
              root: {
                "--pagination-active-bg": "var(--cta)",
                "--pagination-active-color": "var(--cta-fg)",
              },
            }
          : { root: {} },
    }),
    Paper: { defaultProps: { radius: "md" } },
    Input: { defaultProps: { radius: 8 } },
    TextInput: { defaultProps: { radius: 8 } },
    PasswordInput: { defaultProps: { radius: 8 } },
    Select: { defaultProps: { radius: 8, ...DROPDOWN_DEFAULTS }, classNames: DROPDOWN_CLASSES },
    MultiSelect: { defaultProps: DROPDOWN_DEFAULTS, classNames: DROPDOWN_CLASSES },
    Autocomplete: { defaultProps: { comboboxProps: DROPDOWN_DEFAULTS.comboboxProps }, classNames: DROPDOWN_CLASSES },
    TagsInput: { defaultProps: { comboboxProps: DROPDOWN_DEFAULTS.comboboxProps }, classNames: DROPDOWN_CLASSES },
  },
});
