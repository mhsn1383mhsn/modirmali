# راه‌اندازی ورود با گوگل (Supabase)

1. **Supabase → SQL Editor**: محتوای `schema.sql` را اجرا کن.
2. **Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID** (نوع *Web application*).
   - Authorized redirect URI: `https://rrxxiykwzkwbsdzplact.supabase.co/auth/v1/callback`
   - Client ID و Client Secret را کپی کن.
3. **Supabase → Authentication → Providers → Google**: فعالش کن و Client ID / Secret را بگذار.
4. **Supabase → Authentication → URL Configuration → Redirect URLs**: این دو را اضافه کن:
   - `app.dayflow.planner://login-callback`  (اپ اندروید)
   - آدرس نسخه وب، اگر استفاده می‌کنی (مثلاً `https://yourdomain.com/index.html`)
5. **Supabase → Project Settings → API**: مقدار Project URL و anon public key را در `www/index.html` جای `SB_URL` و `SB_KEY` بگذار.
6. Push کن تا GitHub Actions دوباره APK بسازد.

نکته: کلید `anon` عمداً داخل اپ قرار می‌گیرد و امن است؛ دسترسی داده با RLS محدود شده. کلید `service_role` را هرگز داخل اپ نگذار.
