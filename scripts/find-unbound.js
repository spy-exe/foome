// Reporta referências a C ou s que NÃO têm binding (quebradas) após o codemod.
const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

let total = 0;
for (const dir of ['screens', 'components']) {
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const rel = path.join(dir, f);
    const code = fs.readFileSync(rel, 'utf8');
    const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });
    const hits = [];
    traverse(ast, {
      Identifier(p) {
        const name = p.node.name;
        if (name !== 'C' && name !== 's') return;
        const parent = p.parent;
        if (t.isMemberExpression(parent) && parent.property === p.node && !parent.computed) return;
        if (t.isObjectProperty(parent) && parent.key === p.node && !parent.computed && parent.value !== p.node) return;
        if (t.isImportSpecifier(parent) || t.isImportDefaultSpecifier(parent)) return;
        if (t.isVariableDeclarator(parent) && parent.id === p.node) return;
        if (!p.isReferencedIdentifier()) return;
        if (p.scope.getBinding(name)) return; // tem binding -> ok
        const line = code.slice(0, p.node.start).split('\n').length;
        hits.push(`${name} (linha ${line})`);
      },
    });
    if (hits.length) {
      total += hits.length;
      console.log(`${rel}: ${hits.join(', ')}`);
    }
  }
}
console.log(total ? `\n${total} referência(s) sem binding para corrigir` : 'OK: nenhuma referência C/s sem binding');
