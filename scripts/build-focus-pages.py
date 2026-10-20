# صفحه‌های «حالت تمرکز» همیشه از www/index.html ساخته می‌شوند تا با آن همگام بمانند.
# اجرا: python scripts/build-focus-pages.py  (در CI ورک‌فلو هم اجرا می‌شود)
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / "www" / "index.html").read_text(encoding="utf-8")

PAGES = [
    ("dashboard", "داشبورد", "داشبورد.html"),
    ("fund", "صندوق", "صندوق.html"),
    ("wealth", "ثروت", "ثروت.html"),
    ("cashflow", "درآمد-هزینه", "درآمد-هزینه.html"),
    ("loans", "اقساط", "اقساط.html"),
    ("persons", "اشخاص", "اشخاص.html"),
    ("checks", "چک‌ها", "چک‌ها.html"),
]

for view, label, name in PAGES:
    style = (
        '<style id="focus-mode">\n'
        f'  .view:not([data-view="{view}"]){{display:none!important;}}\n'
        f'  .view[data-view="{view}"]{{display:block!important;}}\n'
        "  .tabbar{display:none!important;}\n"
        "  body{padding-bottom:20px!important;}\n"
        "</style>\n"
    )
    banner = (
        '<div style="background:linear-gradient(90deg,#0B4D8C,#178BFF);color:#fff;'
        'text-align:center;padding:10px 12px;font-size:13px;font-weight:800;letter-spacing:.3px;'
        'position:sticky;top:0;z-index:100;box-shadow:0 4px 14px rgba(0,0,0,.35);">\n'
        f'    🗂️ حالت تمرکز — فقط بخش «{label}»\n'
        '    <a href="index.html" style="color:#B8E0FF;margin-right:14px;font-size:12px;'
        'text-decoration:underline;">بازگشت به برنامه کامل</a>\n'
        "  </div>"
    )
    out = re.sub(r"<title>.*?</title>", f"<title>تمرکز: {label} — مدیریت مالی</title>", html, count=1, flags=re.S)
    out = out.replace("</head>", style + "</head>", 1)
    out = out.replace('<div class="app">', '<div class="app">\n  ' + banner, 1)
    (ROOT / "www" / name).write_text(out, encoding="utf-8")

print("focus pages regenerated:", len(PAGES))
