import { defineConfig } from 'i18next-cli';

export default defineConfig({
  "locales": [
    "en",
    "de"
  ],
  "extract": {
    "input": "src/**/*.{js,jsx,ts,tsx}",
    "output": "src/locales/{{language}}/{{namespace}}.json",
    "defaultNS": "translation",
    "keySeparator": ".",
    "nsSeparator": ":",
    "contextSeparator": "_",
    "functions": [
      "t",
      "*.t"
    ],
    "transComponents": [
      "Trans"
    ]
  },
  "types": {
    "input": [
      "locales/{{language}}/{{namespace}}.json"
    ],
    "output": "src/types/i18next.d.ts"
  }
});