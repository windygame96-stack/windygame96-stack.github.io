const fs = require('node:fs');
const dictionary = { ...JSON.parse(fs.readFileSync('assets/product-english-v1.json', 'utf8')), ...JSON.parse(fs.readFileSync('scripts/i18n/product-translation-overrides.json', 'utf8')) };
const runtime = fs.readFileSync('scripts/i18n/product-language-runtime.js', 'utf8');
fs.writeFileSync('assets/product-language-v1.js', runtime.replace('const dictionary = WENDI_PRODUCT_ENGLISH;', `const dictionary = ${JSON.stringify(dictionary)};`));
console.log(`Packaged ${Object.keys(dictionary).length} fixed English UI translations`);
