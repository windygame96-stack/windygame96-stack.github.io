// Mechanical patch of the published client, paired with the generator source fix.
// Preserve all existing cloud/auth settings in the original client.
const fs = require('node:fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const crypto = require('node:crypto');
const code = fs.readFileSync('work/public-assets/learning-original.js', 'utf8');
const ast = parser.parse(code, { sourceType: 'module' });
let parsers = 0, choices = 0, matches = 0;
traverse(ast, {
  RegExpLiteral(path) {
    if (path.node.pattern !== '^([^：:，,。]{1,12})[：:]\\s*(.{2,})$') return;
    const fn = path.getFunctionParent();
    const name = fn.node.params[0].name;
    const patch = parser.parse(`const __englishPair = ${name}.match(/^([A-Za-z][A-Za-z0-9'’() \\-]{1,70}?)(?:\\s*:\\s*|\\s+(?:is defined as|refers to|means|is|are)\\s+)(.{3,})$/i); if (__englishPair) return {term:__englishPair[1].trim(),definition:__englishPair[2].trim()};`, { allowReturnOutsideFunction: true }).program.body;
    fn.node.body.body.unshift(...patch); parsers++;
  },
  ConditionalExpression: { exit(path) {
    const node = path.node;
    if (!t.isMemberExpression(node.test) || node.test.property.name !== 'hasPair' || !t.isTemplateLiteral(node.consequent) || !node.consequent.quasis[0].value.raw.includes('以下哪一项')) return;
    const name = generate(node.test.object).code;
    const english = parser.parseExpression(`${name}.hasPair && !/[\\u3400-\\u9fff]/.test(${name}.term) ? \`Which term best matches "\${${name}.definition}"?\` : null`);
    english.alternate = t.cloneNode(node, true); path.replaceWith(english); choices++; path.skip();
  } },
  ObjectProperty(path) {
    const value = t.isTemplateLiteral(path.node.value) && path.node.value.expressions.length === 0 ? path.node.value.quasis[0].value.cooked : path.node.value.value;
    if ((path.node.key.name || path.node.key.value) !== 'stem' || value !== '请将左侧术语与右侧释义正确匹配') return;
    const pairs = path.parent.properties.find((p) => (p.key?.name || p.key?.value) === 'pairs');
    if (!pairs || !t.isCallExpression(pairs.value) || !t.isMemberExpression(pairs.value.callee)) return;
    const group = generate(pairs.value.callee.object).code;
    path.node.value = parser.parseExpression(`${group}.every(item => !/[\\u3400-\\u9fff]/.test(item.term)) ? "Match each term with its definition." : "请将左侧术语与右侧释义正确匹配"`);
    matches++;
  },
});
if (parsers !== 1 || choices !== 1 || matches !== 1) throw Error(`Unexpected patch counts: ${parsers}/${choices}/${matches}`);
const output = generate(ast, { compact: true, comments: false }).code;
const filename = `index-en-${crypto.createHash('sha256').update(output).digest('hex').slice(0, 10)}.js`;
fs.writeFileSync('learning-workshop/assets/' + filename, output);
const html = fs.readFileSync('learning-workshop/index.html', 'utf8');
fs.writeFileSync('learning-workshop/index.html', html.replace('./assets/index-Cq1T2fTS.js', './assets/' + filename));
console.log(`Patched English rule generation: ${filename}; matched exactly one parser and two question builders`);
