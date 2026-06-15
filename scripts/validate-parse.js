// Valida sintaxe (parse) de todos os arquivos JS do app via @babel/parser.
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const dirs = ['screens', 'components', 'contexts', 'utils', 'navigation', 'constants'];
let errors = 0;
for (const d of dirs) {
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.js')) continue;
    const p = path.join(d, f);
    try {
      parser.parse(fs.readFileSync(p, 'utf8'), {
        sourceType: 'module',
        plugins: ['jsx'],
      });
    } catch (e) {
      errors++;
      console.log('PARSE ERROR', p + ':', e.message.split('\n')[0]);
    }
  }
}
console.log(errors ? `\n${errors} parse error(s)` : 'OK: todos os arquivos passam no parse');
process.exit(errors ? 1 : 0);
