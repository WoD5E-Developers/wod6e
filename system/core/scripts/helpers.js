/**
 * Define any helpers necessary for working with Handlebars
 * @return {Promise}
 */
export const loadHelpers = async function () {
  Handlebars.registerHelper('concat', function () {
    let outStr = ''
    for (const arg in arguments) {
      if (typeof arguments[arg] !== 'object') {
        outStr += arguments[arg]
      }
    }
    return outStr
  })

  Handlebars.registerHelper('ifeq', function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }

    return options.inverse(this)
  })

  Handlebars.registerHelper('ifnoteq', function (a, b, options) {
    if (a !== b) {
      return options.fn(this)
    }

    return options.inverse(this)
  })

  Handlebars.registerHelper('ifgr', function (a, b, options) {
    if (a > b) {
      return options.fn(this)
    }

    return options.inverse(this)
  })

  Handlebars.registerHelper('ifless', function (a, b, options) {
    if (a < b) {
      return options.fn(this)
    }

    return options.inverse(this)
  })

  Handlebars.registerHelper('or', function () {
    for (let i = 0; i < arguments.length - 1; i++) {
      if (arguments[i]) {
        return true
      }
    }

    return false
  })

  Handlebars.registerHelper('and', function (bool1, bool2) {
    return bool1 && bool2
  })

  Handlebars.registerHelper('add', function (int) {
    return Number(int) + 2
  })

  Handlebars.registerHelper('x2', function (int) {
    return Number(int) * 2
  })

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase()
  })

  Handlebars.registerHelper('toUpperCaseFirstLetter', function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  })

  Handlebars.registerHelper('splitArray', function (arr) {
    if (!Array.isArray(arr)) {
      return ''
    }

    return arr.join(',')
  })

  // Check whether an object is empty or not
  Handlebars.registerHelper('isNotEmpty', function (obj) {
    return Object.keys(obj).length > 0
  })

  Handlebars.registerHelper('attrIf', function (attr, value, test) {
    if (value === undefined) return ''
    return value === test ? attr : ''
  })

  Handlebars.registerHelper('numLoop', function (num, options) {
    let ret = ''

    for (let i = 0, j = num; i < j; i++) {
      ret = ret + options.fn(i)
    }

    return ret
  })

  // This is a quick and simple helper to only return the first sentence of a field's description.
  Handlebars.registerHelper('descriptionShort', function (text) {
    if (!text) return ''

    // Strip HTML tags
    const plainText = String(text)
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Find the first period
    const periodIndex = plainText.indexOf('.')

    // Return the first sentence (including the period)
    return periodIndex >= 0 ? plainText.slice(0, periodIndex + 1).trim() : plainText
  })
}
