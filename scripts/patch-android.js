const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
if (fs.existsSync(gradlePath)) {
  let gradle = fs.readFileSync(gradlePath, 'utf8');
  if (!gradle.includes('dayflow-debug.keystore')) {
    gradle = gradle.replace(/android\s*\{/, `android {
    signingConfigs {
        debug {
            storeFile file('../../keystore/dayflow-debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`);
    gradle = gradle.replace(/buildTypes\s*\{/, `buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }`);
    fs.writeFileSync(gradlePath, gradle);
  }
}
const manifestPath = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (!manifest.includes('login-callback')) {
    const filter = `
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="app.dayflow.planner" android:host="login-callback" />
            </intent-filter>`;
    manifest = manifest.replace(/(<activity[\s\S]*?)(<\/activity>)/, (m, a, b) => a + filter + '\n        ' + b);
    fs.writeFileSync(manifestPath, manifest);
  }
}
const brandingAndroid = path.join(root, 'branding', 'android');
const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');
if (fs.existsSync(brandingAndroid) && fs.existsSync(resDir)) {
  for (const d of ['mdpi','hdpi','xhdpi','xxhdpi','xxxhdpi']) {
    const from = path.join(brandingAndroid, 'mipmap-' + d);
    const to = path.join(resDir, 'mipmap-' + d);
    if (!fs.existsSync(from)) continue;
    fs.mkdirSync(to, { recursive: true });
    for (const f of fs.readdirSync(from)) fs.copyFileSync(path.join(from, f), path.join(to, f));
  }
  for (const [sub] of [['mipmap-anydpi-v26'],['drawable']]) {
    const from = path.join(brandingAndroid, sub);
    const to = path.join(resDir, sub);
    if (!fs.existsSync(from)) continue;
    fs.mkdirSync(to, { recursive: true });
    for (const f of fs.readdirSync(from)) fs.copyFileSync(path.join(from, f), path.join(to, f));
  }
  console.log('patch-android: custom icons applied');
}
console.log('patch-android: OK');

// System bars: light defaults (JS updates StatusBar style/color at runtime)
try {
  const stylesDir = path.join(root, 'android', 'app', 'src', 'main', 'res', 'values');
  const stylesPath = path.join(stylesDir, 'styles.xml');
  if (fs.existsSync(stylesPath)) {
    let styles = fs.readFileSync(stylesPath, 'utf8');
    // strip previous injected items if re-run
    if (!styles.includes('financeSystemBars')) {
      styles = styles.replace(
        /<\/style>\s*<\/resources>/,
        `    <!-- financeSystemBars -->
        <item name="android:statusBarColor">#EEF3F9</item>
        <item name="android:navigationBarColor">#EEF3F9</item>
        <item name="android:windowBackground">#EEF3F9</item>
        <item name="android:windowLightStatusBar">true</item>
        <item name="android:windowLightNavigationBar">true</item>
    </style>
</resources>`
      );
      fs.writeFileSync(stylesPath, styles);
      console.log('patch-android: system bars transparent + light icons');
    }
  }
} catch (e) { console.warn('styles patch', e); }


// Ensure navigation bar color is applied in MainActivity when possible
try {
  const mainPaths = [
    path.join(root, 'android', 'app', 'src', 'main', 'java'),
    path.join(root, 'android', 'app', 'src', 'main', 'kotlin')
  ];
  function walk(dir, out=[]) {
    if (!fs.existsSync(dir)) return out;
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) walk(p, out);
      else if (/MainActivity\.(java|kt)$/.test(name)) out.push(p);
    }
    return out;
  }
  for (const base of mainPaths) {
    for (const mainFile of walk(base)) {
      let src = fs.readFileSync(mainFile, 'utf8');
      if (src.includes('financeNavBar')) continue;
      if (mainFile.endsWith('.java') && src.includes('onCreate')) {
        src = src.replace(
          /super\.onCreate\([^)]*\);/,
          (m) => m + `
        // financeNavBar: match light theme default; JS plugin updates at runtime
        try {
            if (android.os.Build.VERSION.SDK_INT >= 21) {
                getWindow().setNavigationBarColor(android.graphics.Color.parseColor("#EEF3F9"));
            }
            if (android.os.Build.VERSION.SDK_INT >= 27) {
                int flags = getWindow().getDecorView().getSystemUiVisibility();
                flags |= android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                getWindow().getDecorView().setSystemUiVisibility(flags);
            }
        } catch (Exception ignored) {}`
        );
        fs.writeFileSync(mainFile, src);
        console.log('patch-android: MainActivity nav bar', mainFile);
      }
    }
  }
} catch (e) { console.warn('MainActivity nav patch', e); }
