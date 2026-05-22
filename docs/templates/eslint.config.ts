import boundaries from "eslint-plugin-boundaries"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "feature", pattern: "features/*", mode: "folder" },
        { type: "shared", pattern: "shared/**" },
        { type: "app", pattern: "app/**" },
        { type: "lib", pattern: "lib/**" },
        { type: "ui", pattern: "components/ui/**" },
      ],
      "boundaries/ignore": ["**/*.test.ts", "**/*.test.tsx"],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "feature",
              allow: ["feature", "shared", "lib", "ui"],
            },
            {
              from: "shared",
              allow: ["shared", "lib"],
            },
            {
              from: "app",
              allow: ["feature", "shared", "lib", "ui"],
            },
          ],
        },
      ],
    },
  }
)
