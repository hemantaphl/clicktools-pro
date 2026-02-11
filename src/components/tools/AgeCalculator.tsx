import { useState, useMemo, useCallback } from "react";
import { CalendarDays, Cake, Clock, Heart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getBsYears,
  getBsDaysInMonth,
  getAdDaysInMonth,
  bsToAd,
  adToBs,
  BS_MONTHS,
  AD_MONTHS,
  getAdYearRange,
} from "@/lib/bs-date-utils";

type CalendarType = "AD" | "BS";

export function AgeCalculator() {
  const [calendarType, setCalendarType] = useState<CalendarType>("AD");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const years = useMemo(() => {
    if (calendarType === "BS") {
      return getBsYears();
    }
    const range = getAdYearRange();
    const arr: number[] = [];
    for (let y = range.max; y >= range.min; y--) arr.push(y);
    return arr;
  }, [calendarType]);

  const months = useMemo(() => {
    return calendarType === "BS" ? BS_MONTHS : AD_MONTHS;
  }, [calendarType]);

  const daysInMonth = useMemo(() => {
    if (!selectedYear || !selectedMonth) return 30;
    const y = parseInt(selectedYear);
    const m = parseInt(selectedMonth);
    if (calendarType === "BS") {
      return getBsDaysInMonth(y, m);
    }
    return getAdDaysInMonth(y, m);
  }, [selectedYear, selectedMonth, calendarType]);

  // Reset day if it exceeds max
  const effectiveDay = useMemo(() => {
    if (!selectedDay) return "";
    if (parseInt(selectedDay) > daysInMonth) return "";
    return selectedDay;
  }, [selectedDay, daysInMonth]);

  const result = useMemo(() => {
    if (!selectedYear || !selectedMonth || !effectiveDay) return null;

    const y = parseInt(selectedYear);
    const m = parseInt(selectedMonth);
    const d = parseInt(effectiveDay);

    let birthAdDate: Date;
    let birthBs: { year: number; month: number; day: number } | null = null;

    if (calendarType === "BS") {
      const converted = bsToAd(y, m, d);
      if (!converted) return null;
      // We normalize the converted date to midday
      birthAdDate = new Date(converted.getFullYear(), converted.getMonth(), converted.getDate(), 12, 0, 0);
      birthBs = { year: y, month: m, day: d };
    } else {
      /**
       * FIX: We set the time to 12:00:00. 
       * Creating a date at 00:00:00 often causes the conversion library 
       * to return the previous day due to local timezone offsets.
       */
      birthAdDate = new Date(y, m - 1, d, 12, 0, 0);
      birthBs = adToBs(birthAdDate);
    }

    const now = new Date();
    // Use a normalized 'now' for comparison to avoid time-of-day bugs
    if (birthAdDate > now || isNaN(birthAdDate.getTime())) return null;

    // Calculate age in AD
    let years = now.getFullYear() - birthAdDate.getFullYear();
    let months = now.getMonth() - birthAdDate.getMonth();
    let days = now.getDate() - birthAdDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const diffMs = now.getTime() - birthAdDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

    const nextBirthday = new Date(now.getFullYear(), birthAdDate.getMonth(), birthAdDate.getDate(), 12, 0, 0);
    if (nextBirthday <= now) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.ceil(
      (nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const dayOfWeek = birthAdDate.toLocaleDateString("en-US", { weekday: "long" });

    // BS display info
    const bsDisplay = birthBs
      ? `${birthBs.year} ${BS_MONTHS[birthBs.month - 1]} ${birthBs.day}`
      : null;
    const adDisplay = birthAdDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      totalHours,
      daysUntilBirthday,
      dayOfWeek,
      bsDisplay,
      adDisplay,
    };
  }, [selectedYear, selectedMonth, effectiveDay, calendarType]);

  const handleCalendarSwitch = useCallback((type: CalendarType) => {
    setCalendarType(type);
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDay("");
  }, []);

  return (
    <div className="space-y-4">
      {/* Calendar Type Toggle */}
      <div className="bg-card rounded-lg p-4">
        <div className="flex rounded-lg bg-muted p-1">
          {(["AD", "BS"] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleCalendarSwitch(type)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                calendarType === type
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "AD" ? "AD (English)" : "BS (Nepali)"}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selectors */}
      <div className="bg-card rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Select Your Birth Date ({calendarType})
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {/* Year */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-popover">
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-popover">
                {months.map((name, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Day */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Day</label>
            <Select value={effectiveDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-popover">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Age Display */}
          <div className="bg-primary/10 rounded-lg p-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Your Age</p>
            <p className="text-2xl font-bold text-primary">
              {result.years} Years, {result.months} Months, {result.days} Days
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Born on a {result.dayOfWeek}
            </p>
          </div>

          {/* Converted Date */}
          <div className="bg-card rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">AD Date</span>
              <span className="text-sm font-medium text-foreground">{result.adDisplay}</span>
            </div>
            {result.bsDisplay && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">BS Date</span>
                <span className="text-sm font-medium text-foreground">{result.bsDisplay}</span>
              </div>
            )}
          </div>

          {/* Next Birthday */}
          <div className="bg-card rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cake className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Next Birthday</p>
              <p className="text-xs text-muted-foreground">
                {result.daysUntilBirthday === 365 || result.daysUntilBirthday === 366
                  ? "🎉 Happy Birthday! It's today!"
                  : `${result.daysUntilBirthday} days to go`}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-card rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Detailed Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Months", value: result.totalMonths.toLocaleString(), icon: CalendarDays },
                { label: "Total Weeks", value: result.totalWeeks.toLocaleString(), icon: Clock },
                { label: "Total Days", value: result.totalDays.toLocaleString(), icon: CalendarDays },
                { label: "Total Hours", value: result.totalHours.toLocaleString(), icon: Clock },
              ].map((item) => (
                <div key={item.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <item.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-3 p-3 bg-muted/50 rounded-lg">
              <Heart className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your heart has beaten approximately{" "}
                <span className="font-medium text-foreground">
                  {(result.totalDays * 100000).toLocaleString()}
                </span>{" "}
                times!
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}