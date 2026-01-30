import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Cake, Clock, CalendarDays, RefreshCw, Heart, ChevronLeft, ChevronRight, Keyboard, CalendarRange, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  nepaliMonths, 
  nepaliMonthsNp,
  adToBS, 
  bsToAD, 
  getDaysInBSMonth,
  getAvailableBSYears,
  isValidBSDate,
  getTotalDaysInBSYear
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
  totalSeconds: number;
  nextBirthday: Date;
  daysUntilBirthday: number;
  zodiacSign: string;
  dayOfBirth: string;
  lifePercentage: number;
  season: string;
  chineseZodiac: string;
  birthstone: string;
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

const chineseZodiacs = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const birthstones = ["Garnet", "Amethyst", "Aquamarine", "Diamond", "Emerald", "Pearl", "Ruby", "Peridot", "Sapphire", "Opal", "Topaz", "Turquoise"];
const seasons = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];

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

function getChineseZodiac(year: number): string {
  const animals = ["🐀 Rat", "🐂 Ox", "🐅 Tiger", "🐇 Rabbit", "🐉 Dragon", "🐍 Snake", "🐴 Horse", "🐐 Goat", "🐵 Monkey", "🐓 Rooster", "🐕 Dog", "🐖 Pig"];
  return animals[(year - 4) % 12];
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
  const totalSeconds = totalMinutes * 60;

  // Calculate next birthday
  let nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday <= now) {
    nextBirthday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const zodiacSign = getZodiacSign(birth.getMonth() + 1, birth.getDate());
  const dayOfBirth = daysOfWeek[birth.getDay()];
  const lifePercentage = Math.min((years / 80) * 100, 100);
  const season = seasons[birth.getMonth()];
  const chineseZodiac = getChineseZodiac(birth.getFullYear());
  const birthstone = birthstones[birth.getMonth()];

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
    totalSeconds,
    nextBirthday,
    daysUntilBirthday,
    zodiacSign,
    dayOfBirth,
    lifePercentage,
    season,
    chineseZodiac,
    birthstone,
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
  const totalSeconds = totalMinutes * 60;

  // Calculate next birthday in BS
  let nextBirthdayYear = todayYear;
  if (birthMonth < todayMonth || (birthMonth === todayMonth && birthDay <= todayDay)) {
    nextBirthdayYear = todayYear + 1;
  }
  const nextBirthdayAD = bsToAD(nextBirthdayYear, birthMonth, birthDay);
  const daysUntilBirthday = Math.ceil((nextBirthdayAD.getTime() - todayAD.getTime()) / (1000 * 60 * 60 * 24));

  const zodiacSign = getZodiacSign(birthAD.getMonth() + 1, birthAD.getDate());
  const dayOfBirth = daysOfWeek[birthAD.getDay()];
  const lifePercentage = Math.min((years / 80) * 100, 100);
  const season = seasons[birthAD.getMonth()];
  const chineseZodiac = getChineseZodiac(birthAD.getFullYear());
  const birthstone = birthstones[birthAD.getMonth()];

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
    totalSeconds,
    nextBirthday: nextBirthdayAD,
    daysUntilBirthday: daysUntilBirthday > 0 ? daysUntilBirthday : 365 + daysUntilBirthday,
    zodiacSign,
    dayOfBirth,
    lifePercentage,
    season,
    chineseZodiac,
    birthstone,
  };
}

// BS Calendar Picker Component
function BSCalendarPicker({ 
  selectedYear, 
  selectedMonth, 
  selectedDay, 
  onSelect,
  onClose 
}: {
  selectedYear: number;
  selectedMonth: number;
  selectedDay: number;
  onSelect: (year: number, month: number, day: number) => void;
  onClose: () => void;
}) {
  const availableYears = useMemo(() => getAvailableBSYears(), []);
  const todayBS = useMemo(() => adToBS(new Date()), []);
  
  const [viewYear, setViewYear] = useState(selectedYear || todayBS.year);
  const [viewMonth, setViewMonth] = useState(selectedMonth || todayBS.month);

  const daysInMonth = getDaysInBSMonth(viewYear, viewMonth);
  const firstDayOfMonth = useMemo(() => {
    const adDate = bsToAD(viewYear, viewMonth, 1);
    return adDate.getDay();
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      if (viewYear > availableYears[0]) {
        setViewYear(viewYear - 1);
        setViewMonth(12);
      }
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      if (viewYear < availableYears[availableYears.length - 1]) {
        setViewYear(viewYear + 1);
        setViewMonth(1);
      }
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayClick = (day: number) => {
    // Check if date is in future
    if (viewYear > todayBS.year || 
        (viewYear === todayBS.year && viewMonth > todayBS.month) ||
        (viewYear === todayBS.year && viewMonth === todayBS.month && day > todayBS.day)) {
      return;
    }
    onSelect(viewYear, viewMonth, day);
    onClose();
  };

  const isToday = (day: number) => 
    viewYear === todayBS.year && viewMonth === todayBS.month && day === todayBS.day;

  const isSelected = (day: number) => 
    viewYear === selectedYear && viewMonth === selectedMonth && day === selectedDay;

  const isFuture = (day: number) =>
    viewYear > todayBS.year || 
    (viewYear === todayBS.year && viewMonth > todayBS.month) ||
    (viewYear === todayBS.year && viewMonth === todayBS.month && day > todayBS.day);

  return (
    <div className="p-3 pointer-events-auto">
      {/* Header with year/month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Select value={viewMonth.toString()} onValueChange={(v) => setViewMonth(parseInt(v))}>
            <SelectTrigger className="w-[100px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {nepaliMonths.map((month, idx) => (
                <SelectItem key={idx} value={(idx + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={viewYear.toString()} onValueChange={(v) => setViewYear(parseInt(v))}>
            <SelectTrigger className="w-[80px] h-8 text-sm">
              <SelectValue />
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
        
        <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before first day of month */}
        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-8" />
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const future = isFuture(day);
          return (
            <Button
              key={day}
              variant="ghost"
              size="sm"
              disabled={future}
              onClick={() => handleDayClick(day)}
              className={cn(
                "h-8 w-8 p-0 font-normal",
                isToday(day) && "bg-accent text-accent-foreground",
                isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                future && "text-muted-foreground/30 cursor-not-allowed"
              )}
            >
              {day}
            </Button>
          );
        })}
      </div>

      {/* Today button */}
      <Button 
        variant="outline" 
        className="w-full mt-3 h-8 text-sm"
        onClick={() => {
          setViewYear(todayBS.year);
          setViewMonth(todayBS.month);
        }}
      >
        Today: {todayBS.year}/{todayBS.month}/{todayBS.day}
      </Button>
    </div>
  );
}

export function AgeCalculator() {
  const [calendarType, setCalendarType] = useState<"ad" | "bs">("ad");
  const [inputMode, setInputMode] = useState<"picker" | "manual">("picker");
  
  // AD state
  const [adDate, setAdDate] = useState<Date | undefined>();
  const [adManualDate, setAdManualDate] = useState("");
  
  // BS state
  const [bsYear, setBsYear] = useState<number | null>(null);
  const [bsMonth, setBsMonth] = useState<number | null>(null);
  const [bsDay, setBsDay] = useState<number | null>(null);
  const [bsManualYear, setBsManualYear] = useState("");
  const [bsManualMonth, setBsManualMonth] = useState("");
  const [bsManualDay, setBsManualDay] = useState("");
  
  const [result, setResult] = useState<AgeResult | null>(null);
  const [convertedDate, setConvertedDate] = useState<string>("");
  const [error, setError] = useState("");
  const [bsCalendarOpen, setBsCalendarOpen] = useState(false);

  const availableYears = useMemo(() => getAvailableBSYears(), []);

  const handleCalculateAD = () => {
    setError("");
    setResult(null);
    setConvertedDate("");

    let birthDate: Date;

    if (inputMode === "picker") {
      if (!adDate) {
        setError("Please select your birth date");
        return;
      }
      birthDate = adDate;
    } else {
      if (!adManualDate) {
        setError("Please enter your birth date (YYYY-MM-DD)");
        return;
      }
      const parsed = new Date(adManualDate);
      if (isNaN(parsed.getTime())) {
        setError("Invalid date format. Use YYYY-MM-DD");
        return;
      }
      birthDate = parsed;
    }

    const today = new Date();
    if (birthDate > today) {
      setError("Birth date cannot be in the future");
      return;
    }

    const age = calculateAge(birthDate);
    setResult(age);

    // Convert to BS
    const bsDate = adToBS(birthDate);
    setConvertedDate(`${bsDate.year} ${nepaliMonths[bsDate.month - 1]} ${bsDate.day} (${nepaliMonthsNp[bsDate.month - 1]})`);
  };

  const handleCalculateBS = () => {
    setError("");
    setResult(null);
    setConvertedDate("");

    let year: number, month: number, day: number;

    if (inputMode === "picker") {
      if (!bsYear || !bsMonth || !bsDay) {
        setError("Please select your birth date");
        return;
      }
      year = bsYear;
      month = bsMonth;
      day = bsDay;
    } else {
      if (!bsManualYear || !bsManualMonth || !bsManualDay) {
        setError("Please enter all date fields");
        return;
      }
      year = parseInt(bsManualYear);
      month = parseInt(bsManualMonth);
      day = parseInt(bsManualDay);

      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        setError("Invalid date values");
        return;
      }
    }

    if (!isValidBSDate(year, month, day)) {
      setError(`Invalid BS date. ${nepaliMonths[month - 1]} ${year} has ${getDaysInBSMonth(year, month)} days.`);
      return;
    }

    const todayBS = adToBS(new Date());
    
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
    setConvertedDate(format(adDate, "MMMM d, yyyy (EEEE)"));
  };

  const handleReset = () => {
    setAdDate(undefined);
    setAdManualDate("");
    setBsYear(null);
    setBsMonth(null);
    setBsDay(null);
    setBsManualYear("");
    setBsManualMonth("");
    setBsManualDay("");
    setResult(null);
    setConvertedDate("");
    setError("");
  };

  const handleBSSelect = (year: number, month: number, day: number) => {
    setBsYear(year);
    setBsMonth(month);
    setBsDay(day);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Type Selection */}
      <Tabs value={calendarType} onValueChange={(v) => { setCalendarType(v as "ad" | "bs"); handleReset(); }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ad" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            AD (English)
          </TabsTrigger>
          <TabsTrigger value="bs" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            BS (नेपाली)
          </TabsTrigger>
        </TabsList>

        {/* Input Mode Toggle */}
        <div className="flex justify-center mt-4">
          <div className="inline-flex items-center rounded-lg bg-muted p-1">
            <Button
              variant={inputMode === "picker" ? "default" : "ghost"}
              size="sm"
              onClick={() => setInputMode("picker")}
              className="h-8 px-3 gap-1.5"
            >
              <CalendarRange className="w-4 h-4" />
              Calendar
            </Button>
            <Button
              variant={inputMode === "manual" ? "default" : "ghost"}
              size="sm"
              onClick={() => setInputMode("manual")}
              className="h-8 px-3 gap-1.5"
            >
              <Keyboard className="w-4 h-4" />
              Type
            </Button>
          </div>
        </div>

        <TabsContent value="ad" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {inputMode === "picker" ? (
                <div className="space-y-2">
                  <Label>Birth Date (AD)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal",
                          !adDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {adDate ? format(adDate, "PPP") : "Select your birth date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={adDate}
                        onSelect={setAdDate}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="ad-manual">Birth Date (YYYY-MM-DD)</Label>
                  <Input
                    id="ad-manual"
                    type="date"
                    value={adManualDate}
                    onChange={(e) => setAdManualDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="h-12"
                    placeholder="1990-01-15"
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleCalculateAD} className="flex-1 h-12 gap-2">
                  <Sparkles className="w-4 h-4" />
                  Calculate Age
                </Button>
                <Button variant="outline" onClick={handleReset} className="h-12 px-4">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bs" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {inputMode === "picker" ? (
                <div className="space-y-2">
                  <Label>Birth Date (BS)</Label>
                  <Popover open={bsCalendarOpen} onOpenChange={setBsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal",
                          !bsYear && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {bsYear && bsMonth && bsDay 
                          ? `${bsYear} ${nepaliMonths[bsMonth - 1]} ${bsDay} (${nepaliMonthsNp[bsMonth - 1]})`
                          : "Select your birth date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <BSCalendarPicker
                        selectedYear={bsYear || 2050}
                        selectedMonth={bsMonth || 1}
                        selectedDay={bsDay || 1}
                        onSelect={handleBSSelect}
                        onClose={() => setBsCalendarOpen(false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Birth Date (Year / Month / Day)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Year (2050)"
                      value={bsManualYear}
                      onChange={(e) => setBsManualYear(e.target.value)}
                      min={availableYears[0]}
                      max={availableYears[availableYears.length - 1]}
                      className="h-12 text-center"
                    />
                    <Input
                      type="number"
                      placeholder="Month (1-12)"
                      value={bsManualMonth}
                      onChange={(e) => setBsManualMonth(e.target.value)}
                      min={1}
                      max={12}
                      className="h-12 text-center"
                    />
                    <Input
                      type="number"
                      placeholder="Day (1-32)"
                      value={bsManualDay}
                      onChange={(e) => setBsManualDay(e.target.value)}
                      min={1}
                      max={32}
                      className="h-12 text-center"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Months: 1=Baisakh, 2=Jestha, ... 12=Chaitra
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleCalculateBS} className="flex-1 h-12 gap-2">
                  <Sparkles className="w-4 h-4" />
                  Calculate Age
                </Button>
                <Button variant="outline" onClick={handleReset} className="h-12 px-4">
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
          <CardContent className="py-3 text-center text-destructive text-sm">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Main Age Display */}
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardContent className="pt-6 relative">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">🎂 Your Age</p>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-primary">{result.years}</p>
                    <p className="text-xs text-muted-foreground mt-1">Years</p>
                  </div>
                  <div className="text-center">
                    <p className="text-5xl font-bold text-primary">{result.months}</p>
                    <p className="text-xs text-muted-foreground mt-1">Months</p>
                  </div>
                  <div className="text-center">
                    <p className="text-5xl font-bold text-primary">{result.days}</p>
                    <p className="text-xs text-muted-foreground mt-1">Days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Conversion */}
          {convertedDate && (
            <Card className="bg-accent/30">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {calendarType === "ad" ? "📅 Birth Date in BS" : "📅 Birth Date in AD"}
                    </p>
                    <p className="font-semibold truncate">{convertedDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Birthday & Zodiac Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Cake className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Next Birthday</p>
                    <p className="font-bold text-lg text-pink-500">{result.daysUntilBirthday}</p>
                    <p className="text-[10px] text-muted-foreground">days to go!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-purple-500" />
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
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-orange-500" />
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
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <span className="text-lg">🐲</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Chinese Zodiac</p>
                    <p className="font-semibold text-sm">{result.chineseZodiac}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Life Statistics */}
          <Card>
            <CardContent className="py-4">
              <p className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Life Statistics
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Days</p>
                  <p className="font-bold text-lg">{result.totalDays.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Weeks</p>
                  <p className="font-bold text-lg">{result.totalWeeks.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Months</p>
                  <p className="font-bold text-lg">{result.totalMonths.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Hours</p>
                  <p className="font-bold text-lg">{result.totalHours.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Minutes</p>
                  <p className="font-bold text-lg">{result.totalMinutes.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Seconds</p>
                  <p className="font-bold text-lg">{result.totalSeconds.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fun Facts */}
          <Card>
            <CardContent className="py-4">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Fun Facts
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Birth Season</span>
                  <span className="font-medium">{result.season}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Birthstone</span>
                  <span className="font-medium">💎 {result.birthstone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Life Journey</span>
                  <span className="font-medium">{result.lifePercentage.toFixed(1)}% (of 80 years)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
