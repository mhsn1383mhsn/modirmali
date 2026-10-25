# بسته آماده راه‌اندازی Android SDK برای مدیریت مالی

این بسته، فایل HTML اصلاح‌شده را داخل پروژه Capacitor قرار می‌دهد و تنظیمات پایه سازگار را فراهم می‌کند. Android SDK خودش داخل ZIP نیست؛ باید Android Studio و SDK رسمی را روی سیستم نصب کنید.

## پیش‌نیازها
- Node.js نسخه LTS
- Android Studio
- Android SDK Platform و Build Tools نصب‌شده از SDK Manager
- JDK 17

## راه‌اندازی ویندوز
1. ZIP را استخراج کنید.
2. در پوشه `dayflow-sdk` ترمینال باز کنید.
3. اجرا کنید:

```bat
npm install
npx cap add android
npx cap sync android
npx cap open android
```

4. در Android Studio صبر کنید Gradle Sync کامل شود و اگر خواست SDK یا Build Tools نصب شود، از SDK Manager نصب کنید.
5. برای APK آزمایشی: از منوی **Build > Build Bundle(s) / APK(s) > Build APK(s)** استفاده کنید.

## نکات مهم
- شناسه فعلی برنامه `com.dayflow.planner` است. اگر در پروژه قبلی شناسه متفاوتی داری، قبل از `npx cap add android` آن را در `capacitor.config.ts` به شناسه قبلی تغییر بده؛ شناسه پس از انتشار نباید بی‌دلیل عوض شود.
- نسخه‌های Capacitor در این بسته روی 6.2.0 پین شده‌اند تا نصب قابل تکرار باشد؛ فایل‌های Gradle را دستی جایگزین نکن. دستور `npx cap add android` فایل‌های بومی متناسب را تولید می‌کند.
- این بسته APK آماده نیست و SDK را دانلود/نصب نمی‌کند؛ محیط Android Studio باید روی کامپیوتر تنظیم شود.
- `service-worker.js` و `manifest.json` برای حالت وب/PWA هستند؛ داخل WebView اندروید سرویس‌ورکر به‌تنهایی مجوز اعلان یا اجرای پس‌زمینه ایجاد نمی‌کند.
