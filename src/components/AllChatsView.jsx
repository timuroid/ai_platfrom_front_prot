import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Calendar } from 'lucide-react';
import './AllChatsView.css';

export default function AllChatsView({ chats, onChatSelect, onNewChat, onDeleteChat }) {
  const [filteredChats, setFilteredChats] = useState([]);

  useEffect(() => {
    setFilteredChats(chats);
  }, [chats]);

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

  const handleDelete = (e, chatId) => {
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить этот чат?')) {
      onDeleteChat(chatId);
    }
  };

  return (
    <div className="all-chats-view">
      <div className="all-chats-view-header">
        <h1 className="all-chats-view-title">Все чаты</h1>
      </div>

      <div className="all-chats-view-content">
        <div className="all-chats-view-content-inner">
        {filteredChats.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={64} />
            <h3>Нет чатов</h3>
            <p>Начните новый чат, чтобы он появился здесь</p>
            <button
              type="button"
              className="primary-button"
              onClick={onNewChat}
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
                onClick={() => onChatSelect(chat)}
              >
                <div className="chat-card-header">
                  <div className="chat-card-icon">
                    <MessageSquare size={20} />
                  </div>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={(e) => handleDelete(e, chat.id)}
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
                    <span>{formatDate(chat.updatedAt || chat.createdAt || new Date().toISOString())}</span>
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
    </div>
  );
}
