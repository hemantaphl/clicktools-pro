interface FlagIconProps {
  countryCode: string;
  size?: number;
  className?: string;
}
/**
 * Image-based flag icon using flagcdn.com
 * Works on all platforms including Capacitor/Android where emoji flags don't render.
 */
export function FlagIcon({ countryCode, size = 20, className = "" }: FlagIconProps) {
  const code = countryCode.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={`${countryCode} flag`}
      className={`inline-block object-cover rounded-sm ${className}`}
      loading="lazy"
      onError={(e) => {
        // Fallback: hide broken image
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}
// Map currency codes to country codes for flagcdn
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: "us", EUR: "eu", GBP: "gb", JPY: "jp", AUD: "au", CAD: "ca",
  CHF: "ch", CNY: "cn", INR: "in", NPR: "np", KRW: "kr", SGD: "sg",
  HKD: "hk", SEK: "se", NOK: "no", DKK: "dk", NZD: "nz", ZAR: "za",
  BRL: "br", MXN: "mx", THB: "th", MYR: "my", IDR: "id", PHP: "ph",
  TWD: "tw", PKR: "pk", BDT: "bd", LKR: "lk", AED: "ae", SAR: "sa",
  QAR: "qa", KWD: "kw", BHD: "bh", OMR: "om", TRY: "tr", RUB: "ru",
  PLN: "pl", CZK: "cz", HUF: "hu", ILS: "il", EGP: "eg", NGN: "ng",
  KES: "ke", GHS: "gh", VND: "vn", MMK: "mm", CLP: "cl", COP: "co",
  ARS: "ar", PEN: "pe",
};
export function CurrencyFlag({ currencyCode, size = 20, className = "" }: { currencyCode: string; size?: number; className?: string }) {
  const countryCode = CURRENCY_TO_COUNTRY[currencyCode];
  if (!countryCode) return <span className="inline-block" style={{ width: size }}>{currencyCode}</span>;
  return <FlagIcon countryCode={countryCode} size={size} className={className} />;
}