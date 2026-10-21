// Android patches: debug signing, deep link for Supabase OAuth, custom icons
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');

// Stable debug signing so new APKs install over old ones
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

// Deep link so Google login (Supabase OAuth) can return to the app
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

// Custom app icons from branding/android
const brandingAndroid = path.join(root, 'branding', 'android');
const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');
if (fs.existsSync(brandingAndroid) && fs.existsSync(resDir)) {
  const dens = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
  for (const d of dens) {
    const from = path.join(brandingAndroid, 'mipmap-' + d);
    const to = path.join(resDir, 'mipmap-' + d);
    if (!fs.existsSync(from)) continue;
    fs.mkdirSync(to, { recursive: true });
    for (const f of fs.readdirSync(from)) {
      fs.copyFileSync(path.join(from, f), path.join(to, f));
    }
  }
  const anyFrom = path.join(brandingAndroid, 'mipmap-anydpi-v26');
  const anyTo = path.join(resDir, 'mipmap-anydpi-v26');
  if (fs.existsSync(anyFrom)) {
    fs.mkdirSync(anyTo, { recursive: true });
    for (const f of fs.readdirSync(anyFrom)) {
      fs.copyFileSync(path.join(anyFrom, f), path.join(anyTo, f));
    }
  }
  const drFrom = path.join(brandingAndroid, 'drawable');
  const drTo = path.join(resDir, 'drawable');
  if (fs.existsSync(drFrom)) {
    fs.mkdirSync(drTo, { recursive: true });
    for (const f of fs.readdirSync(drFrom)) {
      fs.copyFileSync(path.join(drFrom, f), path.join(drTo, f));
    }
  }
  console.log('patch-android: custom icons applied');
}

console.log('patch-android: OK');
