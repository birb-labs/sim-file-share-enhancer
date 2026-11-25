const { build } = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const header = fs.readFileSync(path.join(root, 'src', 'header.txt'), 'utf8');

build({
  entryPoints: [path.join(root, 'src', 'index.js')],
  outfile: path.join(root, 'simfileshare-enhancer.user.js'),
  bundle: true,
  format: 'iife',
  globalName: '__sfx',
  target: 'es2020',
  banner: { js: `${header}\n'use strict';` },
  footer: {
    js: [
      "if (typeof module !== 'undefined' && module.exports) {",
      '  module.exports = __sfx;',
      '} else {',
      '  __sfx.main(window, document, { addStyle: GM_addStyle, getValue: GM_getValue, setValue: GM_setValue, xhr: GM_xmlhttpRequest });',
      '}',
    ].join('\n'),
  },
  legalComments: 'none',
}).catch(() => process.exit(1));
