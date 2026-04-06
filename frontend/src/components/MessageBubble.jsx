import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

/**
 * MessageBubble Component
 * Displays an individual message (user or assistant) with sources
 */
const MessageBubble = ({ message }) => {
  const { role, content, sources, created_at } = message;
  const [expandedSources, setExpandedSources] = useState({});
  
  const formatTimestamp = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm', { locale: vi });
    } catch (error) {
      return '';
    }
  };

  // Get user info for avatar
  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.username || user.full_name || 'User';
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
    return 'User';
  };

  const isUser = role === 'user';
  const isAssistant = role === 'assistant';
  const userName = getUserInfo();

  const toggleSource = (index) => {
    setExpandedSources(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

 const handleDownload = async (docId, filename) => {
  try {
    const response = await api.get(
      `/chat/documents/${docId}/download`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  } catch (error) {
    console.error("Download error:", error);
  }
};

  return (
    <div className={`message-bubble ${role}`}>
      <div className="message-content">
        {/* Avatar */}
        <div className="message-avatar">
          {isUser ? (
            <img 
              alt={userName}
              width="48" 
              height="48" 
              className="avatar user-avatar rounded-full"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=128`}
            />
          ) : (
            <img 
              alt="AI Assistant" 
              width="48" 
              height="48" 
              className="avatar assistant-avatar object-contain"
              src="/logo.png"
            />
          )}
        </div>

        {/* Content */}
        <div className="message-body">
          {/* <div className="message-header">
            <span className="message-role">
              {isUser ? 'Bạn' : 'Trợ lý AI'}
            </span>
            <span className="message-time">
              {formatTimestamp(created_at)}
            </span>
          </div> */}

          <div className="message-text prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                // Customize markdown elements
                p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-light-onSurface dark:text-dark-onSurface" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
                code: ({node, inline, ...props}) => 
                  inline ? (
                    <code className="bg-light-surfaceVariant dark:bg-dark-surfaceVariant px-1 py-0.5 rounded text-sm" {...props} />
                  ) : (
                    <code className="block bg-light-surfaceVariant dark:bg-dark-surfaceVariant p-2 rounded text-sm overflow-x-auto" {...props} />
                  ),
                h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-bold mb-1" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

       
          {/* {isAssistant && sources && sources.length > 0 && (
            <div className="message-sources">
              <div className="sources-header">
                <span className="sources-icon">📄</span>
                <span className="sources-title">Nguồn tham khảo</span>
              </div>
              
              <div className="sources-list">
                {sources.map((source, index) => (
                  <div key={index} className="source-accordion">
                    <button
                      className="source-accordion-button"
                      onClick={() => toggleSource(index)}
                    >
                      <div className="source-accordion-header">
                        <div className="source-info">
                          <span className="source-filename" title={source.filename}>
                            {source.filename}
                          </span>
                          <span className="source-page">
                            Trang {source.page}
                          </span>
                        </div>
                        <svg
                          className={`source-chevron ${expandedSources[index] ? 'expanded' : ''}`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {expandedSources[index] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="source-accordion-content"
                        >
                          {source.content_preview && (
                            <div className="source-preview">
                              "{source.content_preview}"
                            </div>
                          )}
                          
                          {source.document_id && (
                            <button
                              className="source-download-btn"
                              onClick={() => handleDownload(source.document_id, source.filename)}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 12L3 7h3V1h4v6h3l-5 5z"/>
                                <path d="M14 13v2H2v-2H0v2a2 2 0 002 2h12a2 2 0 002-2v-2h-2z"/>
                              </svg>
                              Tải xuống văn bản
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
