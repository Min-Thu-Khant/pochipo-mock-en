import {cp, mkdir, readdir, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.resolve(root,'dist');
if(path.dirname(output)!==path.resolve(root)||path.basename(output)!=='dist')throw Error('Invalid build output path');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
const excluded=new Set(['tests','node_modules','.git','package.json','package-lock.json','server.mjs']);
let count=0;
async function copyDirectory(source,destination){
 await mkdir(destination,{recursive:true});
 for(const entry of await readdir(source,{withFileTypes:true})){
  if(excluded.has(entry.name)||entry.isSymbolicLink())continue;
  const from=path.join(source,entry.name),to=path.join(destination,entry.name);
  if(entry.isDirectory())await copyDirectory(from,to);
  else if(entry.isFile()&&!['.py','.mjs'].includes(path.extname(entry.name))){await cp(from,to);count++;}
 }
}
await cp(path.join(root,'index.html'),path.join(output,'index.html'));count++;
for(const directory of ['mock-app','mock-admin','mock-nacs','mock-demo','docs'])await copyDirectory(path.join(root,directory),path.join(output,directory));
console.log(`Static build complete: ${count} files in dist/`);
