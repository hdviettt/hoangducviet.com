// DataForSEO location and language mappings
// Location codes follow pattern: 2 + ISO country numeric code
// Based on DataForSEO documentation and common usage patterns

export interface Country {
  name: string;
  code: string; // ISO 2-letter code
  locationCode: number; // DataForSEO location code
}

export interface Language {
  name: string;
  code: string; // ISO 639-1 language code
}

// Common countries with their DataForSEO location codes
export const countries: Country[] = [
  { name: "United States", code: "US", locationCode: 2840 },
  { name: "United Kingdom", code: "GB", locationCode: 2826 },
  { name: "Canada", code: "CA", locationCode: 2124 },
  { name: "Australia", code: "AU", locationCode: 2036 },
  { name: "Germany", code: "DE", locationCode: 2276 },
  { name: "France", code: "FR", locationCode: 2250 },
  { name: "Spain", code: "ES", locationCode: 2724 },
  { name: "Italy", code: "IT", locationCode: 2380 },
  { name: "Netherlands", code: "NL", locationCode: 2528 },
  { name: "Sweden", code: "SE", locationCode: 2752 },
  { name: "Norway", code: "NO", locationCode: 2578 },
  { name: "Denmark", code: "DK", locationCode: 2208 },
  { name: "Finland", code: "FI", locationCode: 2246 },
  { name: "Japan", code: "JP", locationCode: 2392 },
  { name: "South Korea", code: "KR", locationCode: 2410 },
  { name: "China", code: "CN", locationCode: 2156 },
  { name: "India", code: "IN", locationCode: 2356 },
  { name: "Brazil", code: "BR", locationCode: 2076 },
  { name: "Mexico", code: "MX", locationCode: 2484 },
  { name: "Argentina", code: "AR", locationCode: 2032 },
  { name: "Vietnam", code: "VN", locationCode: 2704 },
  { name: "Thailand", code: "TH", locationCode: 2764 },
  { name: "Singapore", code: "SG", locationCode: 2702 },
  { name: "Malaysia", code: "MY", locationCode: 2458 },
  { name: "Indonesia", code: "ID", locationCode: 2360 },
  { name: "Philippines", code: "PH", locationCode: 2608 },
  { name: "South Africa", code: "ZA", locationCode: 2710 },
  { name: "Egypt", code: "EG", locationCode: 2818 },
  { name: "Israel", code: "IL", locationCode: 2376 },
  { name: "Turkey", code: "TR", locationCode: 2792 },
  { name: "Poland", code: "PL", locationCode: 2616 },
  { name: "Czech Republic", code: "CZ", locationCode: 2203 },
  { name: "Hungary", code: "HU", locationCode: 2348 },
  { name: "Romania", code: "RO", locationCode: 2642 },
  { name: "Bulgaria", code: "BG", locationCode: 2100 },
  { name: "Greece", code: "GR", locationCode: 2300 },
  { name: "Portugal", code: "PT", locationCode: 2620 },
  { name: "Ireland", code: "IE", locationCode: 2372 },
  { name: "Belgium", code: "BE", locationCode: 2056 },
  { name: "Switzerland", code: "CH", locationCode: 2756 },
  { name: "Austria", code: "AT", locationCode: 2040 },
];

// Common languages with their ISO 639-1 codes
export const languages: Language[] = [
  { name: "English", code: "en" },
  { name: "Spanish", code: "es" },
  { name: "French", code: "fr" },
  { name: "German", code: "de" },
  { name: "Italian", code: "it" },
  { name: "Portuguese", code: "pt" },
  { name: "Dutch", code: "nl" },
  { name: "Russian", code: "ru" },
  { name: "Chinese (Simplified)", code: "zh-cn" },
  { name: "Chinese (Traditional)", code: "zh-tw" },
  { name: "Japanese", code: "ja" },
  { name: "Korean", code: "ko" },
  { name: "Arabic", code: "ar" },
  { name: "Hindi", code: "hi" },
  { name: "Vietnamese", code: "vi" },
  { name: "Thai", code: "th" },
  { name: "Indonesian", code: "id" },
  { name: "Malay", code: "ms" },
  { name: "Filipino", code: "tl" },
  { name: "Swedish", code: "sv" },
  { name: "Norwegian", code: "no" },
  { name: "Danish", code: "da" },
  { name: "Finnish", code: "fi" },
  { name: "Polish", code: "pl" },
  { name: "Czech", code: "cs" },
  { name: "Hungarian", code: "hu" },
  { name: "Romanian", code: "ro" },
  { name: "Bulgarian", code: "bg" },
  { name: "Greek", code: "el" },
  { name: "Turkish", code: "tr" },
  { name: "Hebrew", code: "he" },
  { name: "Ukrainian", code: "uk" },
  { name: "Croatian", code: "hr" },
  { name: "Serbian", code: "sr" },
  { name: "Slovak", code: "sk" },
  { name: "Slovenian", code: "sl" },
  { name: "Estonian", code: "et" },
  { name: "Latvian", code: "lv" },
  { name: "Lithuanian", code: "lt" },
  { name: "Catalan", code: "ca" },
];

// Helper functions
export const getCountryByName = (name: string): Country | undefined => {
  return countries.find(country => country.name.toLowerCase() === name.toLowerCase());
};

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code.toLowerCase() === code.toLowerCase());
};

export const getLanguageByName = (name: string): Language | undefined => {
  return languages.find(language => language.name.toLowerCase() === name.toLowerCase());
};

export const getLanguageByCode = (code: string): Language | undefined => {
  return languages.find(language => language.code.toLowerCase() === code.toLowerCase());
};

// Default values
export const DEFAULT_COUNTRY = countries.find(c => c.code === "VN") || countries[0];
export const DEFAULT_LANGUAGE = languages.find(l => l.code === "vi") || languages[0];