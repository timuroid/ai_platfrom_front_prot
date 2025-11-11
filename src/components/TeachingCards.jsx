import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, MessageSquare, Plus, Search, Image, Mic, Settings } from 'lucide-react';
import './TeachingCards.css';

const TEACHING_CARDS = [
  {
    id: 1,
    title: 'Добро пожаловать! 👋',
    description: 'Это ваш первый вход в систему. Давайте быстро познакомимся с основными возможностями.',
    icon: MessageSquare,
    highlight: null
  },
  {
    id: 2,
    title: 'Создание нового чата',
    description: 'Нажмите кнопку "Новый чат" в боковой панели, чтобы начать новый диалог с AI-ассистентом.',
    icon: Plus,
    highlight: 'sidebar-new-chat'
  },
  {
    id: 3,
    title: 'Отправка сообщений',
    description: 'Введите ваш вопрос в поле ввода внизу экрана и нажмите Enter или кнопку отправки.',
    icon: MessageSquare,
    highlight: 'composer-input'
  },
  {
    id: 4,
    title: 'Инструменты и функции',
    description: 'Используйте кнопку "+" для доступа к дополнительным инструментам: веб-поиск, генерация изображений и прикрепление файлов.',
    icon: Search,
    highlight: 'tools-button'
  },
  {
    id: 5,
    title: 'Голосовой ввод',
    description: 'Нажмите на иконку микрофона, чтобы записать голосовое сообщение вместо текстового.',
    icon: Mic,
    highlight: 'voice-button'
  },
  {
    id: 6,
    title: 'Настройки',
    description: 'Вы можете изменить тему оформления и другие параметры через меню пользователя в боковой панели.',
    icon: Settings,
    highlight: 'user-button'
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

