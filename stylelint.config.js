export default {
  extends: ['stylelint-config-recommended'],
  customSyntax: 'postcss-less',
  ignoreFiles: ['node_modules/**', 'lib/**'],
  rules: {
    // LESS mixins and variables are not CSS at-rules.
    'at-rule-no-unknown': null,
    // LESS supports import options such as @import (css).
    'at-rule-prelude-no-invalid': [true, { ignoreAtRules: ['import'] }],
    // Nested sheet/theme overrides intentionally use source order.
    'no-descending-specificity': null,
    'no-duplicate-selectors': null,
    // Symbol fonts deliberately have no generic fallback.
    'font-family-no-missing-generic-family-keyword': null,
    // Chromium (Foundry's desktop runtime) supports this legacy alignment.
    'declaration-property-value-no-unknown': [
      true,
      {
        ignoreProperties: {
          'text-align': ['-webkit-center']
        }
      }
    ],
    // Foundry supplies this custom HTML element.
    'selector-type-no-unknown': [true, { ignoreTypes: ['prose-mirror'] }]
  }
}
