import api from '../lib/api';

/**
 * Conversation API Actions
 * Handles all conversation-related API calls
 */

/**
 * Fetch list of conversations for the current user
 * @param {number} limit - Number of conversations to fetch (default: 20)
 * @param {number} offset - Pagination offset (default: 0)
 * @param {string|null} status - Filter by status: "active" or "archived"
 * @returns {Promise<{total: number, limit: number, offset: number, items: Array}>}
 */
export const fetchConversations = async (limit = 20, offset = 0, status = null) => {
  try {
    const params = { limit, offset };
    if (status) {
      params.status = status;
    }

    const response = await api.get('/conversations', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Create a new conversation
 * @param {string} title - Conversation title
 * @param {string|null} description - Optional description
 * @returns {Promise<Object>} Created conversation object
 */
export const createConversation = async (title, description = null) => {
  try {
    const payload = { title };
    if (description) {
      payload.description = description;
    }

    const response = await api.post('/conversations', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Get a conversation with all its messages
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Conversation with messages array
 */
export const getConversationMessages = async (conversationId) => {
  try {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw error;
  }
};

/**
 * Send a message (ask a question)
 * @param {string} question - User's question
 * @param {string|null} conversationId - Optional conversation ID (creates new if omitted)
 * @returns {Promise<Object>} Response with answer, sources, and conversation_id
 */
export const sendMessage = async (question, conversationId = null) => {
  try {
    const payload = { question };
    if (conversationId) {
      payload.conversation_id = conversationId;
    }

    const response = await api.post('/chat/ask', payload);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    console.error('Error details:', error.response?.data || error.message);
    
    // Throw user-friendly error message
    if (error.response) {
      // Server responded with error
      throw error.response.data?.detail || 'Lỗi từ server';
    } else if (error.request) {
      // Request made but no response
      throw 'Không thể kết nối đến server';
    } else {
      // Something else happened
      throw error.message || 'Có lỗi xảy ra';
    }
  }
};

/**
 * Update conversation title and/or description
 * @param {string} conversationId - Conversation ID
 * @param {string} title - New title
 * @param {string|null} description - New description (optional)
 * @returns {Promise<Object>} Updated conversation object
 */
export const updateConversationTitle = async (conversationId, title, description = null) => {
  try {
    const payload = { title };
    if (description !== null) {
      payload.description = description;
    }

    const response = await api.put(`/conversations/${conversationId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

/**
 * Delete a conversation and all its messages
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteConversation = async (conversationId) => {
  try {
    await api.delete(`/conversations/${conversationId}`);
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

/**
 * Archive or unarchive a conversation
 * @param {string} conversationId - Conversation ID
 * @param {boolean} archived - True to archive, false to unarchive
 * @returns {Promise<Object>} Updated conversation object
 */
export const archiveConversation = async (conversationId, archived = true) => {
  try {
    const response = await api.patch(`/conversations/${conversationId}/archive`, null, {
      params: { archived }
    });
    return response.data;
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
};

/**
 * Get old chat history (backward compatibility)
 * @param {number} limit - Number of history items to fetch
 * @returns {Promise<Array>} Array of chat history items
 */
export const getChatHistory = async (limit = 20) => {
  try {
    const response = await api.get('/chat/history', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};
