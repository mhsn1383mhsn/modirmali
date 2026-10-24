// Copies the Supabase JS SDK (UMD build) into www/vendor so the app works inside the WebView.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, 'www', 'vendor');
fs.mkdirSync(out, { recursive: true });
const src = path.join(root, 'node_modules', '@supabase', 'supabase-js', 'dist', 'umd', 'supabase.js');
if (!fs.existsSync(src)) { console.error('Missing ' + src + ' — run npm install first'); process.exit(1); }
fs.copyFileSync(src, path.join(out, 'supabase.js'));
console.log('Supabase JS SDK copied to www/vendor');
