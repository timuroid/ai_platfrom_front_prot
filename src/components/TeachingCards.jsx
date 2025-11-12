import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, MessageSquare, Plus, Search, Image, Mic, Settings } from 'lucide-react';
import './TeachingCards.css';

const TEACHING_CARDS = [
  {
    id: 1,
    title: 'Добро пожаловать! 👋',
    description: 'Спасибо, что выбрали наш AI-ассистент! Давайте быстро познакомимся с основными возможностями платформы. Это займет всего минуту.',
    icon: MessageSquare,
    highlight: null
  },
  {
    id: 2,
    title: 'Работа с чатами',
    description: 'Нажмите "Новый чат" для создания нового диалога. Используйте "Смотреть все чаты" для просмотра истории всех ваших бесед с AI-ассистентом.',
    icon: Plus,
    highlight: 'sidebar-new-chat'
  },
  {
    id: 3,
    title: 'Отправка сообщений',
    description: 'Введите ваш вопрос в поле ввода внизу экрана. Нажмите Enter или кнопку отправки. AI-ассистент поддерживает развернутые ответы с примерами кода.',
    icon: MessageSquare,
    highlight: 'composer-input'
  },
  {
    id: 4,
    title: 'Дополнительные инструменты',
    description: 'Нажмите кнопку "+" рядом с полем ввода для доступа к инструментам: веб-поиск для актуальной информации, генерация изображений по описанию, прикрепление файлов.',
    icon: Search,
    highlight: 'tools-button'
  },
  {
    id: 5,
    title: 'Голосовой ввод',
    description: 'Нажмите иконку микрофона для записи голосового сообщения. Это удобно, когда нужно быстро продиктовать вопрос или длинный текст.',
    icon: Mic,
    highlight: 'voice-button'
  },
  {
    id: 6,
    title: 'Выбор модели AI',
    description: 'В верхней части экрана вы можете выбрать модель AI (GPT-4, Claude, Gemini и др.). Разные модели имеют разные преимущества.',
    icon: Settings,
    highlight: 'model-selector'
  },
  {
    id: 7,
    title: 'Светлая и темная темы',
    description: 'Переключайте тему оформления с помощью иконки солнца/луны в правом верхнем углу. Выберите комфортный для вас режим отображения.',
    icon: Settings,
    highlight: 'theme-toggle'
  },
  {
    id: 8,
    title: 'Готово! 🎉',
    description: 'Теперь вы знаете основы работы с платформой. Начните с вопроса или воспользуйтесь быстрыми действиями на стартовом экране. Удачи!',
    icon: MessageSquare,
    highlight: null
  }
];

const STORAGE_KEY = 'user_onboarding_completed';

export default function TeachingCards({ onComplete }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяем, является ли пользователь новым
    const onboardingCompleted = localStorage.getItem(STORAGE_KEY);
    
    if (!onboardingCompleted) {
      // Небольшая задержка для плавного появления
      setTimeout(() => {
        setIsVisible(true);
      }, 500);
    }
  }, []);

  const handleNext = () => {
    if (currentCardIndex < TEACHING_CARDS.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Сохраняем информацию о том, что пользователь прошел обучение
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    
    // Вызываем callback, если он передан
    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 300);
    }
  };

  if (!isVisible) {
    return null;
  }

  const currentCard = TEACHING_CARDS[currentCardIndex];
  const Icon = currentCard.icon;
  const isFirstCard = currentCardIndex === 0;
  const isLastCard = currentCardIndex === TEACHING_CARDS.length - 1;

  return (
    <div className="teaching-overlay">
      <div className="teaching-backdrop" onClick={handleSkip} />
      <div className="teaching-card-container">
        <div className="teaching-card">
          <div className="teaching-card-header">
            <div className="teaching-card-icon">
              <Icon size={32} />
            </div>
            <button
              type="button"
              className="teaching-card-close"
              onClick={handleSkip}
              aria-label="Пропустить обучение"
            >
              <X size={20} />
            </button>
          </div>

          <div className="teaching-card-content">
            <h2 className="teaching-card-title">{currentCard.title}</h2>
            <p className="teaching-card-description">{currentCard.description}</p>
          </div>

          <div className="teaching-card-footer">
            <div className="teaching-card-progress">
              {TEACHING_CARDS.map((_, index) => (
                <div
                  key={index}
                  className={`teaching-progress-dot ${
                    index === currentCardIndex ? 'is-active' : ''
                  } ${index < currentCardIndex ? 'is-completed' : ''}`}
                />
              ))}
            </div>

            <div className="teaching-card-actions">
              {!isFirstCard && (
                <button
                  type="button"
                  className="teaching-button teaching-button-secondary"
                  onClick={handlePrevious}
                >
                  <ChevronLeft size={18} />
                  Назад
                </button>
              )}
              
              <button
                type="button"
                className="teaching-button teaching-button-primary"
                onClick={handleNext}
              >
                {isLastCard ? 'Начать' : 'Далее'}
                {!isLastCard && <ChevronRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

