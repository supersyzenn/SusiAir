// Syntax-only fallback. This does not replace Nuxt/Nest typechecking or builds.
const fs=require('node:fs');
const path=require('node:path');
const ts=require(process.argv[2] || 'typescript');
let checked=0,errors=0;
function scan(directory) {
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    if(entry.name.startsWith('.') || entry.name==='node_modules') continue;
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()) {scan(file);continue;}
    if(!/\.(ts|vue)$/.test(file)) continue;
    let code=fs.readFileSync(file,'utf8');
    if(file.endsWith('.vue')) {
      const script=code.match(/<script\s+setup\s+lang="ts">([\s\S]*?)<\/script>/);
      if(!script) continue;
      code=script[1];
    }
    const result=ts.transpileModule(code,{
      fileName:file.replace(/\.vue$/,'.ts'),
      compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,experimentalDecorators:true,emitDecoratorMetadata:true},
      reportDiagnostics:true,
    });
    checked++;
    for(const diagnostic of result.diagnostics || []) {
      if(diagnostic.category!==ts.DiagnosticCategory.Error) continue;
      errors++;
      console.error(file,ts.flattenDiagnosticMessageText(diagnostic.messageText,' '));
    }
  }
}
for(const directory of ['nest/src','nest/test','nuxt','tests']) scan(directory);
console.log(`${checked} TypeScript files/Vue script blocks parsed; ${errors} syntax errors. Not full typechecking.`);
process.exitCode=errors?1:0;
