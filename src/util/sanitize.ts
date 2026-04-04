// Sanitize filename
// Based on https://github.com/parshap/node-sanitize-filename/blob/master/index.js

// eslint-disable-next-line no-control-regex
const controlRe = /[\x00-\x1F\x80-\x9F]/g
const illegalRe = /[/?<>\\:*|"]/g
const reservedRe = /^\.+$/
const windowsReservedRe = /^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i
const windowsTrailingRe = /[. ]+$/

export function sanitizeFilename (v: string): string {
  const replacement = ''
  if (typeof v !== 'string') {
    throw new TypeError('Input must be string')
  }
  return v.replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement)
}

// Sanitize URL
// Based on https://github.com/braintree/sanitize-url

/* eslint-disable no-control-regex */
const ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/g
const invalidProtocolRegex = /^\W*(?:javascript|data|vbscript)/im
const htmlEntitiesRegex = /&#\w+\W?/g
const htmlCtrlEntityRegex = /&(newline|tab);/gi
const urlSchemeRegex = /^.+(?::|&colon;)/gim
/* eslint-enable no-control-regex */
const relativeFirstCharacters = ['.', '/']
const BLANK_URL = 'about:blank'
const whitespaceEscapeCharsRegex = /(\\|%5[cC])((%(6[eE]|72|74))|[nrt])/g

function isRelativeUrlWithoutProtocol (url: string): boolean {
  return url.length > 0 && url[0] !== undefined && relativeFirstCharacters.includes(url[0])
}

function decodeHtmlCharacters (str: string) {
  const removedNullByte = str.replace(ctrlCharactersRegex, '')
  return removedNullByte.replace(htmlEntitiesRegex, (_, dec) => {
    return String.fromCharCode(dec)
  })
}

function decodeURI (uri: string): string {
  try {
    return decodeURIComponent(uri)
  } catch {
    return uri
  }
}

export function sanitizeUrl (url: string): string {
  if (!url) {
    return BLANK_URL
  }
  let charsToDecode
  let decodedUrl = decodeURI(url)

  do {
    decodedUrl = decodeHtmlCharacters(decodedUrl)
      .replace(htmlCtrlEntityRegex, '')
      .replace(ctrlCharactersRegex, '')
      .replace(whitespaceEscapeCharsRegex, '')
      .trim()

    decodedUrl = decodeURI(decodedUrl)

    charsToDecode
      = decodedUrl.match(ctrlCharactersRegex)
        || decodedUrl.match(htmlEntitiesRegex)
        || decodedUrl.match(htmlCtrlEntityRegex)
        || decodedUrl.match(whitespaceEscapeCharsRegex)
  } while (charsToDecode && charsToDecode.length > 0)
  const sanitizedUrl = decodedUrl
  if (!sanitizedUrl) {
    return BLANK_URL
  }

  if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
    return sanitizedUrl
  }

  const urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex)

  if (!urlSchemeParseResults) {
    return sanitizedUrl
  }

  const urlScheme = urlSchemeParseResults[0]

  if (invalidProtocolRegex.test(urlScheme)) {
    return BLANK_URL
  }

  return sanitizedUrl
}
