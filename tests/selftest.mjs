// selftest — توابع محاسبات مالی جدید را مستقیم از www/index.html استخراج و چک می‌کند
import fs from 'fs';
const html = fs.readFileSync(new URL('../www/index.html', import.meta.url), 'utf8');

function grab(name){
  const one = html.match(new RegExp('^function ' + name + '\\(.*\\}[ \\t]*$', 'm'));
  if(one && !/\\{[ \\t]*$/.test(one[0])) return one[0]; // تابع تک‌خطی
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
  grab('g2d'), grab('toJalali'), grab('jalaliToDateObj'),
  grab('uid'), grab('fundType'), grab('isExpenseFund'), grab('findFund'), grab('topExpenseFunds'), grab('childFunds'), grab('autoAllocateIncome'), grab('removeLinkedFundEntries'), grab('linkFundEntry'),
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
  eq(jalaliMonthDays(1404,7), 30, 'مهر ۳۰ روز');
  eq(jalaliMonthDays(1404,6), 31, 'شهریور ۳۱ روز');
  eq(jalaliMonthDays(1403,12), 30, 'اسفند ۱۴۰۳ کبیسه (۳۰ روز)');
  eq(jalaliMonthDays(1404,12), 29, 'اسفند ۱۴۰۴ (۲۹ روز)');
  eq(budgetDaysLeft(), 12, 'روزهای باقی‌مانده ماه (۱۹ مهر، با احتساب امروز → ۱۲ روز)');
  // تبدیل شمسی → میلادی باید با toJalali دوطرفه یکی باشد (همه روزهای ۱۴۰۳ تا ۱۴۰۵)
  for(let y=1403;y<=1405;y++) for(let m=1;m<=12;m++) for(let d=1;d<=jalaliMonthDays(y,m);d++){
    const g=jalaliToDateObj(y,m,d,9,0);
    const j=toJalali(g.getFullYear(),g.getMonth()+1,g.getDate());
    eq(j.jy+'/'+j.jm+'/'+j.jd, y+'/'+m+'/'+d, 'رفت‌وبرگشت تاریخ');
  }
  // تخصیص خودکار درآمد باید با حذف تراکنش برگردانده شود و سال در ورودی‌ها ثبت شود
  STATE.funds = [
    {id:'inc', type:'income', entries:[]},
    {id:'p1', type:'expense', percent:60, parentId:null, entries:[]},
    {id:'p2', type:'expense', percent:40, parentId:null, entries:[]}
  ];
  const tx = {id:'t1', type:'income', amount:1000, fundId:'inc'};
  tx.fundEntryId = linkFundEntry(findFund('inc'), 'in', 1000, 5, 7, 'x', 1404);
  eq(findFund('inc').entries[0].jy, 1404, 'سال ورودی صندوق');
  tx.allocRefs = autoAllocateIncome(1000, {jy:1404,jm:7,jd:5}, 'inc', '');
  eq(findFund('p1').entries.length + findFund('p2').entries.length, 2, 'تخصیص انجام شد');
  removeLinkedFundEntries(tx);
  eq(findFund('p1').entries.length + findFund('p2').entries.length + findFund('inc').entries.length, 0, 'حذف تراکنش باید تخصیص‌ها را هم برگرداند');
  console.log('selftest: همه بررسی‌های مالی درست بود ✅');
  `
].join('\n');
new Function(code)();
