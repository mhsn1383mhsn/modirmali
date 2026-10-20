// Minimal Android patch: stable debug signing so new APKs install over old ones (data kept).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
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

// Deep link so Google login (Supabase OAuth) can return to the app.
const manifestPath = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
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
console.log('patch-android: OK');
