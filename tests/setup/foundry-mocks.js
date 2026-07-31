global.game = {
  i18n: {
    localize: (key) => key
  }
}

global.foundry = {
  dice: {
    Roll: class {
      constructor(formula, data, options) {
        this._formula = formula
        this.data = data
        this.options = options
      }
    },
    terms: {
      Die: class {}
    }
  },
  applications: {
    ux: {
      TextEditor: {
        implementation: {
          enrichHTML: async (html) => html
        }
      }
    }
  }
}
