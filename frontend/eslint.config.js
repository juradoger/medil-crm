import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignorar carpetas generadas — Ignore generated folders
  globalIgnores(['dist', 'coverage']),

  // Configuración principal — Main config
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Permite React importado en JSX (workaround Vitest JSX transform) — Allow React import in JSX (Vitest JSX transform workaround)
      // Permite _prefijo en args no usados — Allow _prefix on unused args
      // Permite rest siblings como { foo, ...rest } — Allow rest siblings like { foo, ...rest }
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^React$',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      // Permite exportar hooks junto a componentes — Allow exporting hooks alongside components
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Globales de Vitest para archivos de test — Vitest globals for test files
  {
    files: ['**/*.test.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest, // Vitest es compatible con globals de Jest — Vitest is Jest-globals compatible
        vi: true,        // Global específico de Vitest — Vitest-specific global
      },
    },
  },
])
