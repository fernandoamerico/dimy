import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './pt-BR.json';
import enUS from './en-US.json';

const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18nextLng') || 'pt-BR';
  }
  return 'pt-BR';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
