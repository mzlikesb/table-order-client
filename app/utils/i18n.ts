export type Language = 'ko' | 'en' | 'ja' | 'zh';

export interface Translations {
  // Header
  restaurantName: string;
  tableNumber: string;
  
  // Categories
  all: string;
  main: string;
  side: string;
  drink: string;
  dessert: string;
  
  // Menu
  addToCart: string;
  noMenuInCategory: string;
  loadingMenu: string;
  menuLoadError: string;
  
  // Cart
  cart: string;
  cartEmpty: string;
  cartEmptyMessage: string;
  totalAmount: string;
  checkout: string;
  remove: string;
  
  // Call
  call: string;
  callService: string;
  selectCallType: string;
  water: string;
  plate: string;
  staffCall: string;
  other: string;
  waterDescription: string;
  plateDescription: string;
  staffCallDescription: string;
  otherDescription: string;
  callSuccess: string;
  callSuccessMessage: string;
  cancel: string;
  
  // Language
  languageSelection: string;
  selectLanguage: string;
  close: string;
  
  // Theme
  themeToggle: string;
}

// 번역 데이터를 JSON 파일에서 불러오기
import translationsData from '../locales/translations.json';

const translations: Record<Language, Translations> = translationsData;

let currentLanguage: Language = 'ko';

export const i18n = {
  setLanguage: (lang: Language) => {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
  },
  
  getLanguage: (): Language => {
    return currentLanguage;
  },
  
  t: (key: keyof Translations): string => {
    return translations[currentLanguage]?.[key] || translations.ko[key] || key;
  },
  
  getTranslations: (): Translations => {
    return translations[currentLanguage] || translations.ko;
  }
};

// 초기 언어 설정
export const initializeLanguage = () => {
  const savedLanguage = localStorage.getItem('language') as Language;
  if (savedLanguage && translations[savedLanguage]) {
    currentLanguage = savedLanguage;
  } else {
    // 브라우저 언어 감지
    const browserLang = navigator.language.split('-')[0] as Language;
    if (translations[browserLang]) {
      currentLanguage = browserLang;
    }
  }
}; 