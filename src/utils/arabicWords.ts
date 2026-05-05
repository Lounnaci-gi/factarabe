/**
 * Arabic Number to Words Converter (Simplified for Currency)
 * Focused on Algerian Dinars (DZD)
 */

const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
const teens = ['أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

function convertGroup(n: number): string {
  let res = '';
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;

  if (h > 0) {
    res += hundreds[h];
  }

  if (t === 1 && o > 0) {
    if (res !== '') res += ' و ';
    res += teens[o - 1];
  } else {
    if (o > 0) {
      if (res !== '') res += ' و ';
      res += ones[o];
    }
    if (t >= 2) {
      if (res !== '') res += ' و ';
      res += tens[t];
    } else if (t === 1 && o === 0) {
      if (res !== '') res += ' و ';
      res += ones[10];
    }
  }

  return res;
}

export function numberToArabicWords(n: number): string {
  if (n === 0) return 'صفر';
  
  const integerPart = Math.floor(n);
  const decimalPart = Math.round((n - integerPart) * 100);

  let result = '';

  if (integerPart > 0) {
    const bill = Math.floor(integerPart / 1000000000);
    const mill = Math.floor((integerPart % 1000000000) / 1000000);
    const thou = Math.floor((integerPart % 1000000) / 1000);
    const rem = integerPart % 1000;

    if (bill > 0) {
      result += convertGroup(bill) + ' مليار';
    }
    if (mill > 0) {
      if (result !== '') result += ' و ';
      result += convertGroup(mill) + ' مليون';
    }
    if (thou > 0) {
      if (result !== '') result += ' و ';
      if (thou === 1) result += 'ألف';
      else if (thou === 2) result += 'ألفان';
      else if (thou >= 3 && thou <= 10) result += convertGroup(thou) + ' آلاف';
      else result += convertGroup(thou) + ' ألف';
    }
    if (rem > 0) {
      if (result !== '') result += ' و ';
      result += convertGroup(rem);
    }
    
    result += ' دينار';
  }

  if (decimalPart > 0) {
    if (result !== '') result += ' و ';
    result += convertGroup(decimalPart) + ' سنتيم';
  }

  return result.trim();
}
