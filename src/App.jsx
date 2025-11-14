import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Send,
  Paperclip,
  Mic,
  User,
  Moon,
  Sun,
  MessageSquare,
  Search,
  Image,
  Check,
  Settings,
  Shield,
  X,
  Copy,
  FileDown,
  FileText,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import TeachingCards from './components/TeachingCards.jsx';
import AllChatsView from './components/AllChatsView.jsx';
import './App.css';

const MODELS = [
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5', name: 'GPT-3.5 Turbo' },
  { id: 'claude-3', name: 'Claude 3' },
  { id: 'gemini', name: 'Gemini Pro' }
];

const VOICE_BAR_DELAYS = [0, 120, 240, 360, 480];

const WEB_REFERENCE_LINKS = [
  {
    title: 'Годовой отчёт «УралСталь»',
    url: 'https://example.com/uralsteel-report',
    description: 'Ключевые метрики за 2024 год и сценарии по CAPEX.'
  },
  {
    title: 'Новости отрасли',
    url: 'https://news.example.com/metals-insights',
    description: 'Аналитика рынка проката и прогноз цен на сталь.'
  },
  {
    title: 'Практики энергоэффективности',
    url: 'https://blog.example.com/efficiency',
    description: 'Кейсы внедрения ИИ-ассистентов в производственных командах.'
  }
];

const buildWebSearchReferences = () =>
  WEB_REFERENCE_LINKS.map((link, index) => ({
    ...link,
    id: `${link.url}-${index}`
  }));

const UI_TEXT = {
  placeholder: 'Введите сообщение...',
  voiceRecording: 'Идёт запись',
  voiceProcessing: 'Обрабатываем речь...',
  webSearch: 'Веб-поиск',
  imageGen: 'Генерация изображений',
  attachment: 'Прикрепить файл'
};

const formatDuration = (totalSeconds = 0) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const buildMockResponse = () => ({
  text: `# Пример ответа HelloM

Спасибо за ваше сообщение! Вот пример форматированного ответа с **markdown**.

## Основные возможности

Я могу помочь вам с:

* Написанием кода
* Объяснением концепций
* Решением задач
* Анализом данных

### Пример кода

Вот простой пример на Python:

\`\`\`python
def hello_world():
    print("Hello, World!")
    return True

# Вызов функции
hello_world()
\`\`\`

Также я могу работать с \`inline code\` и другими элементами форматирования.

**Важно:** Это демонстрационный ответ с markdown-разметкой.`,
  thinking: `Сначала я проанализировал запрос пользователя и определил его намерение.

Затем я решил структурировать ответ в виде:
1. Приветствие и подтверждение
2. Основные возможности в виде списка
3. Практический пример кода
4. Заключительное примечание

Я выбрал Python для примера, так как это популярный и легко читаемый язык программирования. Функция hello_world() демонстрирует базовый синтаксис.`
});

const parseMarkdown = (text) => {
  if (!text) return '';
  let html = text.replace(/\r\n/g, '\n');

  const codeBlocks = [];
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang = 'code', code) => {
    const token = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push({
      token,
      lang: (lang || 'code').toLowerCase(),
      code: code.replace(/^\n+|\n+$/g, '')
    });
    return token;
  });

  html = html.replace(/^### (.*)$/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gim, '<h1>$1</h1>');

  html = html.replace(/(^|\n)(\* .+(?:\n\* .+)*)/g, (match, newline, items) => {
    const listItems = items
      .split('\n')
      .map((item) => item.replace(/^\* (.*)/, '<li>$1</li>'))
      .join('');
    return `${newline}<ul>${listItems}</ul>`;
  });

  html = html.replace(
    /(^|\n)(\d+\. .+(?:\n\d+\. .+)*)/g,
    (match, newline, items) => {
      const listItems = items
        .split('\n')
        .map((item) => item.replace(/^\d+\. (.*)/, '<li>$1</li>'))
        .join('');
      return `${newline}<ol>${listItems}</ol>`;
    }
  );

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  html = html.replace(
    /(^|[\s>])\*([^*\n]+)\*(?=[\s<.,;!?]|$)/g,
    (match, prefix, content) => {
      return `${prefix}<em>${content}</em>`;
    }
  );

  const sanitizeForCopy = (code) =>
    code
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$')
      .trim();

  const replaceCodeTokens = (block) => {
    let processed = block;
    codeBlocks.forEach(({ token, lang, code }) => {
      if (!processed.includes(token)) return;

      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const codeHtml = `<div class="code-block-wrapper"><div class="code-block-header"><span class="code-lang">${lang}</span><button class="copy-btn" onclick="navigator.clipboard.writeText(\`${sanitizeForCopy(code)}\`)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button></div><pre><code>${escapedCode}</code></pre></div>`;

      processed = processed.split(token).join(codeHtml);
    });
    return processed;
  };

  const blocks = html
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const processedBlock = replaceCodeTokens(block);

      if (
        processedBlock.startsWith('<h1') ||
        processedBlock.startsWith('<h2') ||
        processedBlock.startsWith('<h3') ||
        processedBlock.startsWith('<div class="code-block-wrapper"') ||
        processedBlock.startsWith('<ul') ||
        processedBlock.startsWith('<ol')
      ) {
        return processedBlock;
      }

      return `<p>${processedBlock}</p>`;
    });

  return blocks.join('');
};

export default function LLMChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([{ id: 1, title: 'Новый чат', messages: [] }]);
  const [activeChat, setActiveChat] = useState(1);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showTools, setShowTools] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [imageGen, setImageGen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportingMessageId, setExportingMessageId] = useState(null);
  const [expandedThinking, setExpandedThinking] = useState({});
  const [streamingMessages, setStreamingMessages] = useState(new Map());
  const [showTeachingCards, setShowTeachingCards] = useState(false);
  const [showAllChats, setShowAllChats] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const streamingIntervalsRef = useRef(new Map());
  const toolsMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const recordTimerRef = useRef(null);
  const recordStartRef = useRef(0);
  const voiceProcessingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!showTools) return;

    const handleClickOutside = (event) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target)) {
        setShowTools(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTools]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-ds-version', 'v1.2');
  }, [theme]);

  useEffect(() => {
    // Проверяем, является ли пользователь новым (не проходил обучение)
    const onboardingCompleted = localStorage.getItem('user_onboarding_completed');
    if (!onboardingCompleted) {
      setShowTeachingCards(true);
    }
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const scrollOptions =
      typeof container.scrollTo === 'function'
        ? { top: container.scrollHeight, behavior: messages.length > 1 ? 'smooth' : 'auto' }
        : null;

    if (scrollOptions) {
      container.scrollTo(scrollOptions);
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'Новый чат',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setMessages([]);
    setShowAllChats(false);
  };

  const handleChatSelect = (chat) => {
    setActiveChat(chat.id);
    setMessages(chat.messages || []);
    setShowAllChats(false);
  };

  const handleDeleteChat = (chatId) => {
    setChats((prev) => prev.filter(chat => chat.id !== chatId));
    if (activeChat === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        handleChatSelect(remainingChats[0]);
      } else {
        createNewChat();
      }
    }
  };

  const handleViewAllChats = () => {
    setShowAllChats(true);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const clearRecordTimer = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearRecordTimer();
      if (voiceProcessingTimeoutRef.current) {
        clearTimeout(voiceProcessingTimeoutRef.current);
        voiceProcessingTimeoutRef.current = null;
      }
      // Clear all streaming intervals
      streamingIntervalsRef.current.forEach((intervalId) => {
        clearInterval(intervalId);
      });
      streamingIntervalsRef.current.clear();
    };
  }, []);

  const toggleVoiceInput = () => {
    if (isProcessingVoice) return;

    if (!isRecording) {
      if (voiceProcessingTimeoutRef.current) {
        clearTimeout(voiceProcessingTimeoutRef.current);
        voiceProcessingTimeoutRef.current = null;
      }
      recordStartRef.current = Date.now();
      setRecordDuration(0);
      setIsRecording(true);
      setMessage('');
      clearRecordTimer();
      recordTimerRef.current = window.setInterval(() => {
        setRecordDuration(Math.max(0, Math.floor((Date.now() - recordStartRef.current) / 1000)));
      }, 250);
      return;
    }

    clearRecordTimer();
    const totalSeconds = Math.max(1, Math.floor((Date.now() - recordStartRef.current) / 1000));
    setRecordDuration(totalSeconds);
    setIsRecording(false);
    setIsProcessingVoice(true);
    voiceProcessingTimeoutRef.current = window.setTimeout(() => {
      setIsProcessingVoice(false);
      setMessage(`Голосовой ввод (${totalSeconds} сек): краткий конспект встречи.`);
      voiceProcessingTimeoutRef.current = null;
    }, 1800);
  };

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const handleCopyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleExport = (messageText, format) => {
    const blob = new Blob([messageText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `message-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    setExportingMessageId(null);
  };

  const toggleThinking = (messageId) => {
    setExpandedThinking((prev) => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const simulateStreaming = (messageId, fullText, thinkingText, metadata) => {
    // First, stream thinking content
    const thinkingChars = thinkingText.split('');
    let thinkingIndex = 0;

    const thinkingIntervalId = setInterval(() => {
      if (thinkingIndex < thinkingChars.length) {
        const thinkingChunk = thinkingChars.slice(0, thinkingIndex + 1).join('');
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId
              ? { ...msg, metadata: { ...msg.metadata, thinking: thinkingChunk, streamingThinking: true } }
              : msg
          )
        );
        setChats((chatList) =>
          chatList.map((chat) =>
            chat.id === activeChat
              ? {
                  ...chat,
                  messages: (chat.messages || []).map((msg) =>
                    msg.id === messageId
                      ? { ...msg, metadata: { ...msg.metadata, thinking: thinkingChunk, streamingThinking: true } }
                      : msg
                  )
                }
              : chat
          )
        );
        thinkingIndex++;
      } else {
        clearInterval(thinkingIntervalId);
        // Mark thinking as complete
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId
              ? { ...msg, metadata: { ...msg.metadata, streamingThinking: false } }
              : msg
          )
        );

        // Start streaming main text after a short delay
        setTimeout(() => {
          const words = fullText.split(/(\s+)/);
          let currentIndex = 0;

          const textIntervalId = setInterval(() => {
            if (currentIndex < words.length) {
              const chunk = words.slice(0, currentIndex + 1).join('');
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === messageId ? { ...msg, text: chunk } : msg
                )
              );
              setChats((chatList) =>
                chatList.map((chat) =>
                  chat.id === activeChat
                    ? {
                        ...chat,
                        messages: (chat.messages || []).map((msg) =>
                          msg.id === messageId ? { ...msg, text: chunk } : msg
                        )
                      }
                    : chat
                )
              );
              currentIndex++;
            } else {
              clearInterval(textIntervalId);
              streamingIntervalsRef.current.delete(messageId);
              setStreamingMessages((prev) => {
                const newMap = new Map(prev);
                newMap.delete(messageId);
                return newMap;
              });
              // Add full metadata after streaming is complete
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === messageId ? { ...msg, metadata } : msg
                )
              );
              setChats((chatList) =>
                chatList.map((chat) =>
                  chat.id === activeChat
                    ? {
                        ...chat,
                        messages: (chat.messages || []).map((msg) =>
                          msg.id === messageId ? { ...msg, metadata } : msg
                        )
                      }
                    : chat
                )
              );
            }
          }, 50);

          streamingIntervalsRef.current.set(messageId + '_text', textIntervalId);
        }, 200);
      }
    }, 15);

    streamingIntervalsRef.current.set(messageId + '_thinking', thinkingIntervalId);
    setStreamingMessages((prev) => new Map(prev).set(messageId, true));
  };

  const sendMessage = () => {
    if (isRecording || isProcessingVoice || (!message.trim() && attachedFiles.length === 0)) return;

    const chatId = activeChat;
    const originalMessage = message;
    const toolSnapshot = { webSearch, imageGen };
    const isFirstMessage = messages.length === 0;
    const filesSnapshot = [...attachedFiles];

    const userMessage = {
      id: Date.now(),
      text: originalMessage,
      sender: 'user',
      timestamp: new Date(),
      files: filesSnapshot.length > 0 ? filesSnapshot : undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setChats((chatList) =>
      chatList.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...(chat.messages || []), userMessage] }
          : chat
      )
    );
    setMessage('');
    setAttachedFiles([]);

    setTimeout(() => {
      const responseId = Date.now();
      const mockResponse = buildMockResponse();
      const referenceLinks = toolSnapshot.webSearch ? buildWebSearchReferences() : null;

      const aiResponse = {
        id: responseId,
        text: '',
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          thinking: '',
          streamingThinking: true,
          webSearch: toolSnapshot.webSearch,
          imageGen: toolSnapshot.imageGen,
          links: referenceLinks
        }
      };

      const finalMetadata = {
        thinking: mockResponse.thinking,
        webSearch: toolSnapshot.webSearch,
        imageGen: toolSnapshot.imageGen,
        links: referenceLinks
      };

      // Add empty message first
      setMessages((prev) => [...prev, aiResponse]);
      setChats((chatList) =>
        chatList.map((chat) => {
          if (chat.id !== chatId) {
            return chat;
          }

          const updatedChat = {
            ...chat,
            messages: [...(chat.messages || []), aiResponse]
          };

          if (isFirstMessage) {
            updatedChat.title =
              originalMessage.slice(0, 30) +
              (originalMessage.length > 30 ? '...' : '');
          }

          return updatedChat;
        })
      );

      // Start streaming animation (thinking first, then text)
      simulateStreaming(responseId, mockResponse.text, mockResponse.thinking, finalMetadata);
    }, 800);
  };

  const sidebarWidth = sidebarOpen ? 280 : 88;

  return (
    <div
      className="app-shell"
      style={{
        '--sidebar-current-width': `${sidebarWidth}px`
      }}
    >
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar
        mode="chat"
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={createNewChat}
        onShowSettings={() => setShowSettings(true)}
        onViewAllChats={handleViewAllChats}
      />

      <style>{`
        @media (max-width: 960px) {
          .mobile-menu-button {
            display: flex;
          }
        }
        @media (min-width: 961px) {
          .mobile-menu-button {
            display: none;
          }
        }
      `}</style>

      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Меню"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <main className="app-main">
        {showAllChats ? (
          <AllChatsView
            chats={chats}
            onChatSelect={handleChatSelect}
            onNewChat={createNewChat}
            onDeleteChat={handleDeleteChat}
          />
        ) : (
          <>
            <section className="messages-area">
              <div className="model-dock" role="region" aria-label="Выбор модели">
                <div className="model-selector">
                  <button
                    type="button"
                    className={`model-button ${showModelDropdown ? 'is-open' : ''}`}
                    onClick={() => setShowModelDropdown((prev) => !prev)}
                  >
                    <span>{MODELS.find((model) => model.id === selectedModel)?.name}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M19 9l-7 7-7-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {showModelDropdown && (
                    <div className="model-dropdown">
                      {MODELS.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          className={`model-option ${selectedModel === model.id ? 'is-active' : ''}`}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setShowModelDropdown(false);
                          }}
                        >
                          {model.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="messages-layout">
                <div className="messages-column">
                  <div ref={messagesContainerRef} className="messages-viewport">
                    <div className="messages-scroll">
                      <div className="messages-stack">
                        {messages.length === 0 ? (
                          <div className="welcome-screen">
                            <div className="welcome-header">
                              <h1 className="welcome-title">Добро пожаловать!</h1>
                              <p className="welcome-subtitle">
                                Я ваш AI-ассистент. Готов помочь с любыми вопросами и задачами.
                              </p>
                            </div>

                <div className="welcome-features">
                  <div className="feature-card">
                    <div className="feature-icon">
                      <MessageSquare size={24} />
                    </div>
                    <h3 className="feature-title">Текстовые сообщения</h3>
                    <p className="feature-description">
                      Пишите вопросы и получайте развернутые ответы с примерами кода
                    </p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">
                      <Mic size={24} />
                    </div>
                    <h3 className="feature-title">Голосовой ввод</h3>
                    <p className="feature-description">
                      Записывайте голосовые сообщения для быстрого общения
                    </p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">
                      <Search size={24} />
                    </div>
                    <h3 className="feature-title">Веб-поиск</h3>
                    <p className="feature-description">
                      Используйте актуальные данные из интернета для точных ответов
                    </p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-icon">
                      <Image size={24} />
                    </div>
                    <h3 className="feature-title">Генерация изображений</h3>
                    <p className="feature-description">
                      Создавайте изображения по текстовому описанию
                    </p>
                  </div>
                </div>

                <div className="welcome-actions">
                  <h3 className="actions-title">Быстрый старт</h3>
                  <div className="quick-actions">
                    <button
                      type="button"
                      className="quick-action-btn"
                      onClick={() => setMessage('Расскажи о возможностях AI-ассистента')}
                    >
                      <MessageSquare size={18} />
                      <span>Узнать больше о возможностях</span>
                    </button>
                    <button
                      type="button"
                      className="quick-action-btn"
                      onClick={() => window.open('https://docs.example.com/tutorials', '_blank')}
                    >
                      <FileText size={18} />
                      <span>Образовательные материалы</span>
                    </button>
                    <button
                      type="button"
                      className="quick-action-btn"
                      onClick={() => setMessage('Как начать работу с AI-ассистентом?')}
                    >
                      <Settings size={18} />
                      <span>Руководство по началу работы</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) =>
                msg.sender === 'user' ? (
                  <div key={msg.id} className="message-user">
                    <div className="user-bubble">
                      {msg.files && msg.files.length > 0 && (
                        <div className="message-files">
                          {msg.files.map((file) => (
                            <div key={file.id} className="message-file-item">
                              <FileText size={16} />
                              <span className="message-file-name">{file.name}</span>
                              <span className="message-file-size">{formatFileSize(file.size)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.text && <div className="user-message-text">{msg.text}</div>}
                    </div>
                    <div className="message-user-footer">
                      <button
                        type="button"
                        className="action-button"
                        onClick={() => handleCopyMessage(msg.text)}
                        title="Копировать сообщение"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="message-ai">
                    <div className="ai-card">
                      {msg.metadata?.thinking && (
                        <div className="thinking-section">
                          <button
                            type="button"
                            className="thinking-toggle"
                            onClick={() => toggleThinking(msg.id)}
                          >
                            {expandedThinking[msg.id] ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                            <span className="thinking-label">
                              {expandedThinking[msg.id] ? 'Скрыть' : 'Размышления'}
                            </span>
                          </button>
                          {expandedThinking[msg.id] && (
                            <div className="thinking-content">
                              {msg.metadata.thinking}
                              {msg.metadata.streamingThinking && (
                                <span className="streaming-cursor" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="markdown-content">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: parseMarkdown(msg.text)
                          }}
                        />
                        {streamingMessages.has(msg.id) && !msg.metadata?.streamingThinking && (
                          <span className="streaming-cursor" />
                        )}
                      </div>
                      
                      {msg.metadata?.links && !streamingMessages.has(msg.id) && (
                        <div className="link-inline-group" role="list">
                          {msg.metadata.links.map((link) => (
                            <a
                              key={link.id}
                              className="link-pill link-pill-visible"
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              role="listitem"
                            >
                              <span className="link-pill-title">{link.title}</span>
                              <span className="link-pill-meta">{link.description}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      
                      {!streamingMessages.has(msg.id) && (
                        <div className="message-footer">
                          <div className="message-actions">
                            <button
                              type="button"
                              className="action-button"
                              onClick={() => handleCopyMessage(msg.text)}
                              title="Копировать сообщение"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              type="button"
                              className="action-button"
                              onClick={() => {
                                setExportingMessageId(msg.id);
                                setShowExportModal(true);
                              }}
                              title="Экспортировать сообщение"
                            >
                              <FileDown size={16} />
                            </button>
                          </div>
                          <div className="message-reactions">
                            <button
                              type="button"
                              className="reaction-button"
                              title="Нравится"
                            >
                              <ThumbsUp size={16} />
                            </button>
                            <button
                              type="button"
                              className="reaction-button"
                              title="Не нравится"
                            >
                              <ThumbsDown size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )
            )}
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>

        {attachedFiles.length > 0 && (
          <div className="attached-files-area">
            <div className="attached-files-container">
              {attachedFiles.map((file) => (
                <div key={file.id} className="attached-file-item">
                  <div className="attached-file-icon">
                    <FileText size={20} />
                  </div>
                  <div className="attached-file-info">
                    <div className="attached-file-name">{file.name}</div>
                    <div className="attached-file-size">{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    className="attached-file-remove"
                    onClick={() => handleRemoveFile(file.id)}
                    aria-label="Удалить файл"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="composer-shell">
          <div className="composer">
            <div className="composer-inner">
              <div className="tools-anchor" ref={toolsMenuRef}>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShowTools((prev) => !prev)}
                  aria-label="Инструменты"
                >
                  <Plus size={20} />
                </button>

                {showTools && (
                  <div className="tools-popover">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip size={18} />
                      <span>Прикрепить файл</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWebSearch((prev) => !prev)}
                    >
                      <Search size={18} />
                      <span>Веб-поиск</span>
                      {webSearch && <Check size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageGen((prev) => !prev)}
                    >
                      <Image size={18} />
                      <span>Генерация картинок</span>
                      {imageGen && <Check size={16} />}
                    </button>
                  </div>
                )}
              </div>

              <div className="composer-input-wrapper">
                {isRecording ? (
                  <div className="voice-visualizer" role="status" aria-live="polite">
                    <div className="voice-visualizer-head">
                      <span className="voice-dot" />
                      <span>{UI_TEXT.voiceRecording}</span>
                      <span className="voice-timer">{formatDuration(recordDuration)}</span>
                    </div>
                    <div className="voice-bars" aria-hidden="true">
                      {VOICE_BAR_DELAYS.map((delay) => (
                        <span
                          key={`bar-${delay}`}
                          className="voice-bar"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : isProcessingVoice ? (
                  <div className="voice-loader" role="status" aria-live="polite">
                    <span className="voice-loader-spinner" aria-hidden="true" />
                    <span>{UI_TEXT.voiceProcessing}</span>
                  </div>
                ) : (
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={UI_TEXT.placeholder}
                    className="composer-input"
                    rows={1}
                  />
                )}
              </div>

              <button
                type="button"
                className={`icon-button ${isRecording ? 'danger' : ''}`}
                onClick={toggleVoiceInput}
                aria-pressed={isRecording}
                disabled={isProcessingVoice}
                aria-label={isRecording ? 'Остановить запись' : 'Начать запись'}
              >
                <Mic size={20} />
              </button>

              <button
                type="button"
                className="icon-button primary"
                onClick={sendMessage}
                disabled={isRecording || isProcessingVoice || !message.trim()}
                aria-label="Отправить сообщение"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
          </>
        )}
      </main>

      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Настройки</h2>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowSettings(false)}
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div>
                <h3 className="section-heading">Тема оформления</h3>
                <div className="theme-grid">
                  <button
                    type="button"
                    className={`theme-button ${theme === 'light' ? 'is-active' : ''}`}
                    onClick={() => {
                      toggleTheme('light');
                      setShowSettings(false);
                    }}
                  >
                    <Sun size={20} />
                    <span>Светлая</span>
                  </button>
                  <button
                    type="button"
                    className={`theme-button ${theme === 'dark' ? 'is-active' : ''}`}
                    onClick={() => {
                      toggleTheme('dark');
                      setShowSettings(false);
                    }}
                  >
                    <Moon size={20} />
                    <span>Тёмная</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdminPanel && (
        <div className="modal-backdrop">
          <div className="modal-panel wide">
            <div className="modal-header">
              <div className="modal-heading">
                <Shield size={24} />
                <h2 className="modal-title">Админ панель</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowAdminPanel(false)}
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p className="admin-placeholder">
                Функции админ панели будут добавлены здесь.
              </p>
            </div>
          </div>
        </div>
      )}

      {showExportModal && exportingMessageId && (
        <div className="modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="modal-panel export-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Экспорт сообщения</h2>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowExportModal(false)}
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>
                Выберите формат для экспорта:
              </p>
              <div className="export-buttons">
                <button
                  type="button"
                  className="export-format-button"
                  onClick={() => {
                    const msg = messages.find((m) => m.id === exportingMessageId);
                    if (msg) handleExport(msg.text, 'pdf');
                  }}
                >
                  <FileText size={24} />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  className="export-format-button"
                  onClick={() => {
                    const msg = messages.find((m) => m.id === exportingMessageId);
                    if (msg) handleExport(msg.text, 'docx');
                  }}
                >
                  <FileText size={24} />
                  <span>DOCX</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={handleFileSelect}
      />

      {showTeachingCards && (
        <TeachingCards
          onComplete={() => setShowTeachingCards(false)}
        />
      )}
    </div>
  );
}
