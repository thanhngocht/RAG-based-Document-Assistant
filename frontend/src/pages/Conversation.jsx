import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import MessageBubble from '../components/MessageBubble';
import {
  getConversationMessages,
  sendMessage,
  deleteConversation
} from '../actions/conversationActions';

const Conversation = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { registerPromptHandler } = useOutletContext();
  
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversation and messages
  useEffect(() => {
    if (conversationId) {
      loadConversation();
    }
  }, [conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      setLoading(true);
      const data = await getConversationMessages(conversationId);
      setConversation(data);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading conversation:', error);
      // If conversation not found, redirect to home
      if (error.includes('not found') || error.includes('404')) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = useCallback(async (question) => {
    if (!question.trim()) return;

    // Add temporary user message with placeholder
    const tempUserMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: question,
      created_at: new Date().toISOString() // Will be replaced
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      // Send to API
      const response = await sendMessage(question, conversationId);

      // Remove temporary message and add both messages with correct timestamps
      setMessages(prev => {
        // Remove temp message
        const filtered = prev.filter(m => m.id !== tempUserMessage.id);
        
        // Add user message with server timestamp
        const userMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: question,
          created_at: response.user_message_created_at || response.created_at // Use server time
        };
        
        // Add assistant message
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
          created_at: response.created_at
        };
        
        return [...filtered, userMessage, assistantMessage];
      });

      // Update conversation metadata
      setConversation(prev => prev ? ({
        ...prev,
        message_count: prev.message_count + 2,
        last_message_at: response.created_at
      }) : null);

      // If no conversationId, navigate to the new conversation
      if (!conversationId && response.conversation_id) {
        navigate(`/conversation/${response.conversation_id}`);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.');
      
      // Remove temp user message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
    }
  }, [conversationId, navigate]);

  // Register prompt handler with parent App
  useEffect(() => {
    if (registerPromptHandler) {
      registerPromptHandler(handleSendMessage);
    }
  }, [registerPromptHandler, handleSendMessage]);

  const handleDeleteConversation = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa cuộc hội thoại này?')) return;

    try {
      await deleteConversation(conversationId);
      navigate('/');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Có lỗi xảy ra khi xóa cuộc hội thoại.');
    }
  };

  return (
    <>
      {conversation && (
        <PageTitle title={conversation.title} />
      )}

      {/* Messages Area */}
      {loading ? (
        <div className="loading-messages">
          <p>Đang tải tin nhắn...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="empty-messages">
          <p>Chưa có tin nhắn. Hãy bắt đầu cuộc hội thoại!</p>
        </div>
      ) : (
        <div className="messages-list">
          {messages.map((message, index) => (
            <MessageBubble key={message.id || index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </>
  );
};

export default Conversation;
