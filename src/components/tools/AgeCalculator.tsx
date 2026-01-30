import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Cake, Clock, CalendarDays, RefreshCw, Heart } from "lucide-react";
import { 
  nepaliCalendarData, 
  nepaliMonths, 
  nepaliMonthsNp,
  adToBS, 
  bsToAD, 
  getDaysInBSMonth,
  getAvailableBSYears,
  isValidBSDate
} from "@/lib/nepaliCalendarData";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  totalMinutes: number;
  nextBirthday: Date;
  daysUntilBirthday: number;
  zodiacSign: string;
  dayOfBirth: string;
}

const zodiacSigns = [
  { name: "Capricorn", symbol: "♑", start: [12, 22], end: [1, 19] },
  { name: "Aquarius", symbol: "♒", start: [1, 20], end: [2, 18] },
  { name: "Pisces", symbol: "♓", start: [2, 19], end: [3, 20] },
  { name: "Aries", symbol: "♈", start: [3, 21], end: [4, 19] },
  { name: "Taurus", symbol: "♉", start: [4, 20], end: [5, 20] },
  { name: "Gemini", symbol: "♊", start: [5, 21], end: [6, 20] },
  { name: "Cancer", symbol: "♋", start: [6, 21], end: [7, 22] },
  { name: "Leo", symbol: "♌", start: [7, 23], end: [8, 22] },
  { name: "Virgo", symbol: "♍", start: [8, 23], end: [9, 22] },
  { name: "Libra", symbol: "♎", start: [9, 23], end: [10, 22] },
  { name: "Scorpio", symbol: "♏", start: [10, 23], end: [11, 21] },
  { name: "Sagittarius", symbol: "♐", start: [11, 22], end: [12, 21] },
];

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getZodiacSign(month: number, day: number): string {
  for (const sign of zodiacSigns) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if (startMonth === endMonth) {
      if (month === startMonth && day >= startDay && day <= endDay) {
        return `${sign.symbol} ${sign.name}`;
      }
    } else if (startMonth > endMonth) {
      // Capricorn case (Dec-Jan)
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return `${sign.symbol} ${sign.name}`;
      }
    } else {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return `${sign.symbol} ${sign.name}`;
      }
    }
  }
  return "Unknown";
}

function calculateAge(birthDate: Date, today: Date = new Date()): AgeResult {
  const birth = new Date(birthDate);
  const now = new Date(today);
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  // Calculate next birthday
  let nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday <= now) {
    nextBirthday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const zodiacSign = getZodiacSign(birth.getMonth() + 1, birth.getDate());
  const dayOfBirth = daysOfWeek[birth.getDay()];

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
    nextBirthday,
    daysUntilBirthday,
    zodiacSign,
    dayOfBirth,
  };
}

function calculateBSAge(
  birthYear: number, 
  birthMonth: number, 
  birthDay: number,
  todayYear: number,
  todayMonth: number,
  todayDay: number
): AgeResult {
  let years = todayYear - birthYear;
  let months = todayMonth - birthMonth;
  let days = todayDay - birthDay;

  if (days < 0) {
    months--;
    const prevMonth = todayMonth === 1 ? 12 : todayMonth - 1;
    const prevYear = todayMonth === 1 ? todayYear - 1 : todayYear;
    days += getDaysInBSMonth(prevYear, prevMonth);
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Convert to AD for additional calculations
  const birthAD = bsToAD(birthYear, birthMonth, birthDay);
  const todayAD = bsToAD(todayYear, todayMonth, todayDay);
  
  const diffTime = Math.abs(todayAD.getTime() - birthAD.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  // Calculate next birthday in BS
  let nextBirthdayYear = todayYear;
  if (birthMonth < todayMonth || (birthMonth === todayMonth && birthDay <= todayDay)) {
    nextBirthdayYear = todayYear + 1;
  }
  const nextBirthdayAD = bsToAD(nextBirthdayYear, birthMonth, birthDay);
  const daysUntilBirthday = Math.ceil((nextBirthdayAD.getTime() - todayAD.getTime()) / (1000 * 60 * 60 * 24));

  const zodiacSign = getZodiacSign(birthAD.getMonth() + 1, birthAD.getDate());
  const dayOfBirth = daysOfWeek[birthAD.getDay()];

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
    nextBirthday: nextBirthdayAD,
    daysUntilBirthday: daysUntilBirthday > 0 ? daysUntilBirthday : 365 + daysUntilBirthday,
    zodiacSign,
    dayOfBirth,
  };
}

export function AgeCalculator() {
  const [calendarType, setCalendarType] = useState<"ad" | "bs">("ad");
  
  // AD state
  const [adBirthDate, setAdBirthDate] = useState("");
  
  // BS state
  const [bsYear, setBsYear] = useState("");
  const [bsMonth, setBsMonth] = useState("");
  const [bsDay, setBsDay] = useState("");
  
  const [result, setResult] = useState<AgeResult | null>(null);
  const [convertedDate, setConvertedDate] = useState<string>("");
  const [error, setError] = useState("");

  const availableYears = useMemo(() => getAvailableBSYears(), []);
  
  const availableDays = useMemo(() => {
    if (!bsYear || !bsMonth) return Array.from({ length: 30 }, (_, i) => i + 1);
    const days = getDaysInBSMonth(parseInt(bsYear), parseInt(bsMonth));
    return Array.from({ length: days }, (_, i) => i + 1);
  }, [bsYear, bsMonth]);

  const handleCalculateAD = () => {
    setError("");
    setResult(null);
    setConvertedDate("");

    if (!adBirthDate) {
      setError("Please select your birth date");
      return;
    }

    const birthDate = new Date(adBirthDate);
    const today = new Date();

    if (birthDate > today) {
      setError("Birth date cannot be in the future");
      return;
    }

    const age = calculateAge(birthDate);
    setResult(age);

    // Convert to BS
    const bsDate = adToBS(birthDate);
    setConvertedDate(`${bsDate.year} ${nepaliMonths[bsDate.month - 1]} ${bsDate.day}`);
  };

  const handleCalculateBS = () => {
    setError("");
    setResult(null);
    setConvertedDate("");

    if (!bsYear || !bsMonth || !bsDay) {
      setError("Please fill all date fields");
      return;
    }

    const year = parseInt(bsYear);
    const month = parseInt(bsMonth);
    const day = parseInt(bsDay);

    if (!isValidBSDate(year, month, day)) {
      setError("Invalid BS date");
      return;
    }

    const todayBS = adToBS(new Date());
    
    // Check if birth date is in future
    if (year > todayBS.year || 
        (year === todayBS.year && month > todayBS.month) ||
        (year === todayBS.year && month === todayBS.month && day > todayBS.day)) {
      setError("Birth date cannot be in the future");
      return;
    }

    const age = calculateBSAge(year, month, day, todayBS.year, todayBS.month, todayBS.day);
    setResult(age);

    // Convert to AD
    const adDate = bsToAD(year, month, day);
    setConvertedDate(adDate.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    }));
  };

  const handleReset = () => {
    setAdBirthDate("");
    setBsYear("");
    setBsMonth("");
    setBsDay("");
    setResult(null);
    setConvertedDate("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Calendar Type Selection */}
      <Tabs value={calendarType} onValueChange={(v) => { setCalendarType(v as "ad" | "bs"); handleReset(); }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ad" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            AD (English)
          </TabsTrigger>
          <TabsTrigger value="bs" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            BS (Nepali)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ad" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ad-date">Birth Date (AD)</Label>
                <Input
                  id="ad-date"
                  type="date"
                  value={adBirthDate}
                  onChange={(e) => setAdBirthDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="h-12"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCalculateAD} className="flex-1 h-12">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calculate Age
                </Button>
                <Button variant="outline" onClick={handleReset} className="h-12">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bs" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Year (BS)</Label>
                  <Select value={bsYear} onValueChange={setBsYear}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={bsMonth} onValueChange={setBsMonth}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {nepaliMonths.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select value={bsDay} onValueChange={setBsDay}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableDays.map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCalculateBS} className="flex-1 h-12">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Calculate Age
                </Button>
                <Button variant="outline" onClick={handleReset} className="h-12">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-3 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Main Age Display */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Age</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{result.years}</p>
                    <p className="text-xs text-muted-foreground">Years</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{result.months}</p>
                    <p className="text-xs text-muted-foreground">Months</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{result.days}</p>
                    <p className="text-xs text-muted-foreground">Days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Conversion */}
          {convertedDate && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {calendarType === "ad" ? "Birth Date in BS" : "Birth Date in AD"}
                    </p>
                    <p className="font-semibold">{convertedDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Cake className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Next Birthday</p>
                    <p className="font-semibold text-sm">{result.daysUntilBirthday} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Zodiac Sign</p>
                    <p className="font-semibold text-sm">{result.zodiacSign}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Born On</p>
                    <p className="font-semibold text-sm">{result.dayOfBirth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Months</p>
                    <p className="font-semibold text-sm">{result.totalMonths.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extended Stats */}
          <Card>
            <CardContent className="py-4">
              <p className="text-sm font-medium mb-3">Life Statistics</p>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Days</p>
                  <p className="font-semibold">{result.totalDays.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Weeks</p>
                  <p className="font-semibold">{result.totalWeeks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Hours</p>
                  <p className="font-semibold">{result.totalHours.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Minutes</p>
                  <p className="font-semibold">{result.totalMinutes.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
