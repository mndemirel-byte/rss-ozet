// eslint.config.js
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommended,
  { rules: { "max-lines-per-function": ["error", 60] } }
);
