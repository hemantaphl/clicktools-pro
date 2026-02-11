import bsCalendarData from "@/data/bs-calendar.json";

const bsData: Record<string, number[]> = bsCalendarData;

// Reference date: BS 2000/01/01 = AD 1943/04/14
const BS_REF_YEAR = 2000;
const BS_REF_MONTH = 1;
const BS_REF_DAY = 1;
const AD_REF = new Date(1943, 3, 14); // April 14, 1943

export const BS_MONTHS = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

export const AD_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function getBsYears(): number[] {
  return Object.keys(bsData).map(Number).sort((a, b) => a - b);
}

export function getBsDaysInMonth(year: number, month: number): number {
  const yearData = bsData[String(year)];
  if (!yearData || month < 1 || month > 12) return 30;
  return yearData[month - 1];
}

export function getTotalBsDaysInYear(year: number): number {
  const yearData = bsData[String(year)];
  if (!yearData) return 365;
  return yearData.reduce((a, b) => a + b, 0);
}

/** Convert BS date to AD Date */
export function bsToAd(bsYear: number, bsMonth: number, bsDay: number): Date | null {
  if (!bsData[String(bsYear)]) return null;

  let totalDays = 0;

  // Days from ref year to bsYear
  for (let y = BS_REF_YEAR; y < bsYear; y++) {
    totalDays += getTotalBsDaysInYear(y);
  }

  // Days from ref month to bsMonth in bsYear
  for (let m = 1; m < bsMonth; m++) {
    totalDays += getBsDaysInMonth(bsYear, m);
  }

  // Remaining days
  totalDays += bsDay - 1;

  const adDate = new Date(AD_REF);
  adDate.setDate(adDate.getDate() + totalDays);
  return adDate;
}

/** Convert AD Date to BS date */
export function adToBs(adDate: Date): { year: number; month: number; day: number } | null {
  const refTime = AD_REF.getTime();
  const targetTime = adDate.getTime();

  if (targetTime < refTime) return null;

  let totalDays = Math.floor((targetTime - refTime) / (1000 * 60 * 60 * 24));

  let bsYear = BS_REF_YEAR;
  let bsMonth = BS_REF_MONTH;
  let bsDay = BS_REF_DAY;

  const years = getBsYears();

  // Count years
  while (totalDays > 0) {
    const daysInYear = getTotalBsDaysInYear(bsYear);
    if (totalDays >= daysInYear) {
      totalDays -= daysInYear;
      bsYear++;
    } else {
      break;
    }
  }

  // Count months
  while (totalDays > 0) {
    const daysInMonth = getBsDaysInMonth(bsYear, bsMonth);
    if (totalDays >= daysInMonth) {
      totalDays -= daysInMonth;
      bsMonth++;
      if (bsMonth > 12) {
        bsMonth = 1;
        bsYear++;
      }
    } else {
      break;
    }
  }

  bsDay += totalDays;

  if (!bsData[String(bsYear)]) return null;

  return { year: bsYear, month: bsMonth, day: bsDay };
}

/** Get AD year range based on BS data */
export function getAdYearRange(): { min: number; max: number } {
  const years = getBsYears();
  const minAd = bsToAd(years[0], 1, 1);
  const maxAd = bsToAd(years[years.length - 1], 12, getBsDaysInMonth(years[years.length - 1], 12));
  return {
    min: minAd?.getFullYear() || 1943,
    max: maxAd?.getFullYear() || 2044,
  };
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getAdDaysInMonth(year: number, month: number): number {
  const daysPerMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysPerMonth[month - 1];
}
