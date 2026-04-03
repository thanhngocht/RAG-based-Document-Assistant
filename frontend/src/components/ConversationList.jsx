import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * ConversationList Component
 * Displays a list of conversations in the sidebar
 */
const ConversationList = ({ 
  conversations = [], 
  activeConversationId = null,
  onSelectConversation,
  onDeleteConversation,
  loading = false 
}) => {
  
  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: vi 
      });
    } catch (error) {
      return '';
    }
  };

  const handleDelete = (e, conversationId) => {
    e.stopPropagation(); // Prevent triggering onSelectConversation
    if (window.confirm('Bạn có chắc muốn xóa cuộc hội thoại này?')) {
      onDeleteConversation(conversationId);
    }
  };

  if (loading) {
    return (
      <div className="conversation-list loading">
        <div className="loading-skeleton">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-item"></div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conversation-list empty">
        <p className="empty-message">Chưa có cuộc hội thoại nào</p>
      </div>
    );
  }

  return (
  <nav className="conversation-list">
    {conversations.map((conversation) => (
      <div
        key={conversation.id}
        className="relative group"
      >
        <div 
          className={`nav-link ${
            activeConversationId === conversation.id ? "active" : ""
          } ${conversation.status === "archived" ? "archived" : ""}`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          
          {/* Icon */}
          <span className="material-symbols-rounded icon-small">
            chat_bubble
          </span>

          {/* Title */}
          <span
            className="truncate conversation-title"
            title={conversation.title}
          >
            {conversation.title}
          </span>

          {/* State layer */}
          <div className="state-layer"></div>

        </div>

        {/* Delete button - outside nav-link to avoid triggering navigation */}
        <button
          className="icon-btn delete-btn absolute top-1/2 right-1.5 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hidden lg:grid"
          onClick={(e) => handleDelete(e, conversation.id)}
          aria-label="Xóa cuộc hội thoại"
        >
          <span className="material-symbols-rounded">
            delete
          </span>
        </button>
      </div>
    ))}
  </nav>
  );
};

export default ConversationList;
