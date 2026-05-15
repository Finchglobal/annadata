import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        protocol: "Protocol",
        validator: "Validator Node",
        app: "Launch App",
      },
      hero: {
        headline: "Honoring the Provider. Measuring the Unseen.",
        subhead: "Bridging the value gap for the 16%. Turning social and environmental labor into absolute rewards for smallholders.",
        farmer: "Join the Index",
        partner: "Invest in Impact",
        valueMeasured: "Unrecognized Impact Measured:",
      },
      dashboard: {
        compass: "Financial Compass",
        yield: "Yearly Yield",
        area: "Farm Area",
        ndvi: "NDVI Score",
        social: "Social Impact Profile",
        total: "Total Realized Value",
        marketShare: "Current Market Share",
        target: "Target Value",
        family: "Total Family",
        female: "Female Members",
        unmarried: "Unmarried Girls"
      }
    }
  },
  hi: {
    translation: {
      nav: {
        protocol: "प्रोटोकॉल",
        validator: "सत्यापनकर्ता",
        app: "ऐप खोलें",
      },
      hero: {
        headline: "अन्नदाता का सम्मान। अनदेखी मेहनत की माप।",
        subhead: "16% के मूल्य अंतर को पाटना। छोटे किसानों के सामाजिक और पर्यावरणीय श्रम को सीधे इनाम में बदलना।",
        farmer: "इंडेक्स से जुड़ें",
        partner: "प्रभाव में निवेश करें",
        valueMeasured: "अज्ञात प्रभाव मापा गया:",
      },
      dashboard: {
        compass: "वित्तीय कंपास",
        yield: "वार्षिक उपज",
        area: "खेत का क्षेत्रफल",
        ndvi: "एनडीवीआई स्कोर",
        social: "सामाजिक प्रभाव प्रोफ़ाइल",
        total: "कुल प्राप्त मूल्य",
        marketShare: "वर्तमान बाजार हिस्सेदारी",
        target: "लक्ष्य मूल्य",
        family: "कुल परिवार",
        female: "महिला सदस्य",
        unmarried: "अविवाहित लड़कियां"
      }
    }
  },
  bn: {
    translation: {
      nav: {
        protocol: "প্রোটোকল",
        validator: "যাচাইকারী",
        app: "অ্যাপ চালু করুন",
      },
      hero: {
        headline: "অন্নদাতার সম্মান। অদেখা পরিশ্রমের পরিমাপ।",
        subhead: "16% এর মূল্যের ব্যবধান কমানো। ছোট কৃষকদের সামাজিক ও পরিবেশগত শ্রমকে সরাসরি পুরস্কারে রূপান্তর করা।",
        farmer: "ইনডেক্সে যোগ দিন",
        partner: "প্রভাবে বিনিয়োগ করুন",
        valueMeasured: "অস্বীকৃত প্রভাব পরিমাপ করা হয়েছে:",
      },
      dashboard: {
        compass: "আর্থিক কম্পাস",
        yield: "বার্ষিক ফলন",
        area: "খামারের এলাকা",
        ndvi: "এনডিভিআই স্কোর",
        social: "সামাজিক প্রভাব প্রোফাইল",
        total: "মোট অর্জিত মূল্য",
        marketShare: "বর্তমান বাজার শেয়ার",
        target: "লক্ষ্য মূল্য",
        family: "মোট পরিবার",
        female: "মহিলা সদস্য",
        unmarried: "অবিবাহিত মেয়ে"
      }
    }
  },
  kn: {
    translation: {
      nav: {
        protocol: "ಶಿಷ್ಟಾಚಾರ",
        validator: "ಪರಿಶೀಲಕ",
        app: "ಅಪ್ಲಿಕೇಶನ್ ಪ್ರಾರಂಭಿಸಿ",
      },
      hero: {
        headline: "ಅನ್ನದಾತನಿಗೆ ಗೌರವ. ಕಾಣದ ಶ್ರಮದ ಮಾಪನ.",
        subhead: "16% ಮೌಲ್ಯದ ಅಂತರವನ್ನು ಕಡಿಮೆ ಮಾಡುವುದು. ಸಣ್ಣ ರೈತರ ಸಾಮಾಜಿಕ ಮತ್ತು ಪರಿಸರ ಶ್ರಮವನ್ನು ನೇರ ಬಹುಮಾನವಾಗಿ ಪರಿವರ್ತಿಸುವುದು.",
        farmer: "ಸೂಚ್ಯಂಕಕ್ಕೆ ಸೇರಿ",
        partner: "ಪ್ರಭಾವದಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಿ",
        valueMeasured: "ಗುರುತಿಸದ ಪ್ರಭಾವವನ್ನು ಅಳೆಯಲಾಗಿದೆ:",
      },
      dashboard: {
        compass: "ಹಣಕಾಸು ದಿಕ್ಸೂಚಿ",
        yield: "ವಾರ್ಷಿಕ ಇಳುವರಿ",
        area: "ಕೃಷಿ ಪ್ರದೇಶ",
        ndvi: "ಎನ್‌ಡಿವಿಐ ಸ್ಕೋರ್",
        social: "ಸಾಮಾಜಿಕ ಪ್ರಭಾವ ಪ್ರೊಫೈಲ್",
        total: "ಒಟ್ಟು ಸಾಧಿಸಿದ ಮೌಲ್ಯ",
        marketShare: "ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಪಾಲು",
        target: "ಗುರಿ ಮೌಲ್ಯ",
        family: "ಒಟ್ಟು ಕುಟುಂಬ",
        female: "ಮಹಿಳಾ ಸದಸ್ಯರು",
        unmarried: "ಅವಿವಾಹಿತ ಹುಡುಗಿಯರು"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
