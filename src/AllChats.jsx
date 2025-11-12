import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Search, Plus, Trash2, Calendar } from 'lucide-react';
import './AllChats.css';

export default function AllChats() {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);

  useEffect(() => {
    // Загружаем чаты из localStorage или используем моковые данные
    const savedChatsData = localStorage.getItem('chat_history');
    let loadedChats = [];

    if (savedChatsData) {
      try {
        loadedChats = JSON.parse(savedChatsData);
      } catch (e) {
        console.error('Failed to parse chats:', e);
      }
    }

    // Если нет сохраненных чатов, создаем моковые данные
    if (loadedChats.length === 0) {
      loadedChats = [
        {
          id: 1,
          title: 'Новый чат',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    // Добавляем дату создания и обновления, если их нет
    loadedChats = loadedChats.map(chat => ({
      ...chat,
      createdAt: chat.createdAt || new Date().toISOString(),
      updatedAt: chat.updatedAt || new Date().toISOString()
    }));

    setChats(loadedChats);
    setFilteredChats(loadedChats);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = chats.filter(chat =>
        chat.title.toLowerCase().includes(query) ||
        chat.messages.some(msg => msg.text?.toLowerCase().includes(query))
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  const handleBackToChat = () => {
    window.location.hash = '/';
  };

  const handleChatClick = (chatId) => {
    localStorage.setItem('active_chat_id', chatId.toString());
    window.location.hash = '/';
  };

  const handleNewChat = () => {
    window.location.hash = '/';
    // Триггерим событие для создания нового чата
    window.dispatchEvent(new CustomEvent('create-new-chat'));
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить этот чат?')) {
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      localStorage.setItem('chat_history', JSON.stringify(updatedChats));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Сегодня';
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getMessagePreview = (messages) => {
    if (!messages || messages.length === 0) {
      return 'Нет сообщений';
    }
    const lastMessage = messages[messages.length - 1];
    const text = lastMessage.text || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div className="all-chats-container">
      <header className="all-chats-header">
        <div className="all-chats-header-content">
          <button
            type="button"
            className="back-button"
            onClick={handleBackToChat}
            title="Назад к чату"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="all-chats-title">Все чаты</h1>

          <button
            type="button"
            className="new-chat-button"
            onClick={handleNewChat}
            title="Новый чат"
          >
            <Plus size={20} />
            <span>Новый чат</span>
          </button>
        </div>

        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Поиск по чатам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="all-chats-content">
        {filteredChats.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={64} />
            <h2>Нет чатов</h2>
            <p>
              {searchQuery.trim() !== ''
                ? 'По вашему запросу ничего не найдено'
                : 'Начните новый чат, чтобы он появился здесь'}
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={handleNewChat}
            >
              <Plus size={18} />
              Создать чат
            </button>
          </div>
        ) : (
          <div className="chats-grid">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="chat-card"
                onClick={() => handleChatClick(chat.id)}
              >
                <div className="chat-card-header">
                  <div className="chat-card-icon">
                    <MessageSquare size={20} />
                  </div>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    title="Удалить чат"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="chat-card-content">
                  <h3 className="chat-card-title">{chat.title}</h3>
                  <p className="chat-card-preview">
                    {getMessagePreview(chat.messages)}
                  </p>
                </div>

                <div className="chat-card-footer">
                  <div className="chat-card-meta">
                    <Calendar size={14} />
                    <span>{formatDate(chat.updatedAt)}</span>
                  </div>
                  <div className="chat-card-count">
                    {chat.messages.length}{' '}
                    {chat.messages.length === 1
                      ? 'сообщение'
                      : chat.messages.length < 5
                      ? 'сообщения'
                      : 'сообщений'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
