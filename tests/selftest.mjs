// selftest — توابع محاسبات مالی جدید را مستقیم از www/index.html استخراج و چک می‌کند
import fs from 'fs';
const html = fs.readFileSync(new URL('../www/index.html', import.meta.url), 'utf8');

function grab(name){
  const m = html.match(new RegExp('^function ' + name + '\\([\\s\\S]*?\\n}', 'm'));
  if(!m) throw new Error('تابع ' + name + ' در index.html پیدا نشد');
  return m[0];
}

const code = [
  `
  let STATE={transactions:[]};
  function todayJalali(){ return {jy:1404, jm:7, jd:19}; }
  function div(a,b){return ~~(a/b);}
  function mod(a,b){return a-~~(a/b)*b;}
  function eq(a,b,msg){ if(a!==b) throw new Error(msg+' → گرفتم '+a+' ولی انتظار '+b); }
  `,
  grab('jalCalLeap'), grab('jalaliMonthDays'), grab('parseTxDate'),
  grab('monthIncomeExpense'), grab('monthExpenseByCategory'), grab('budgetDaysLeft'),
  `
  STATE.transactions = [
    {type:'expense',  amount:1000, date:'1404/07/05', category:'خوراک'},
    {type:'expense',  amount:500,  date:'1404/07/20', category:'خوراک'},
    {type:'expense',  amount:700,  date:'1404/06/10', category:'خوراک'},
    {type:'income',   amount:9000, date:'1404/07/01', category:'حقوق'},
    {type:'transfer', amount:300,  date:'1404/07/02', fundId:'a', toFundId:'b'},
  ];
  const cur = monthIncomeExpense(0);
  eq(cur.inc, 9000, 'درآمد ماه');
  eq(cur.exp, 1500, 'هزینه ماه (انتقال نباید حساب شود)');
  eq(monthIncomeExpense(-1).exp, 700, 'هزینه ماه قبل');
  const map = monthExpenseByCategory();
  eq(map['خوراک'], 1500, 'تفکیک دسته');
  eq(map['حقوق'], undefined, 'درآمد در تفکیک هزینه نیست');
  eq(jalaliMonthDays(1404,7), 31, 'مهر ۳۱ روز');
  eq(jalaliMonthDays(1403,12), 30, 'اسفند ۱۴۰۳ کبیسه (۳۰ روز)');
  eq(jalaliMonthDays(1404,12), 29, 'اسفند ۱۴۰۴ (۲۹ روز)');
  eq(budgetDaysLeft(), 13, 'روزهای باقی‌مانده ماه (۱۹ مهر → ۱۳ روز)');
  console.log('selftest: همه بررسی‌های مالی درست بود ✅');
  `
].join('\n');
new Function(code)();
