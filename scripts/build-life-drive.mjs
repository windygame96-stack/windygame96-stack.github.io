import {spawnSync} from 'node:child_process';
import {rename} from 'node:fs/promises';
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.life-drive.config.ts'],{stdio:'inherit',env:process.env});
if(result.status!==0)process.exit(result.status||1);
await rename('dist-life-drive/life-drive-paid.html','dist-life-drive/index.html');
