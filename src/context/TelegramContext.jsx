import React, { createContext, useContext, useEffect, useState } from 'react';

// Создаём контекст
const TelegramWebAppContext = createContext(null);

// Провайдер контекста
export const TelegramWebAppProvider = ({ children }) => {
  const [telegram, setTelegram] = useState(null);

  useEffect(() => {
    if (window.Telegram) {
      setTelegram(window.Telegram.WebApp);
    }
  }, []);

  return (
    <TelegramWebAppContext.Provider value={telegram}>
      {children}
    </TelegramWebAppContext.Provider>
  );
};

// Хук для использования контекста
export const useTelegramWebApp = () => useContext(TelegramWebAppContext);
