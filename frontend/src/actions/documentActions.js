import api from '../lib/api';

/**
 * Lấy danh sách documents (Admin only)
 * @returns {Promise} Response với danh sách documents
 */
export const getDocuments = async () => {
  try {
    const response = await api.get('/admin/documents');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload document(s) (Admin only)
 * @param {FormData} formData - FormData chứa file(s)
 * @returns {Promise} Response với document(s) được upload
 */
export const uploadDocument = async (formData) => {
  try {
    const response = await api.post('/admin/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Download document (Admin only)
 * @param {string} documentId - ID của document
 * @returns {Promise} Response với file
 */
export const downloadDocument = async (documentId) => {
  try {
    const response = await api.get(`/admin/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa document (Admin only)
 * @param {string} documentId - ID của document
 * @returns {Promise} Response với message
 */
export const deleteDocument = async (documentId) => {
  try {
    const response = await api.delete(`/admin/documents/${documentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật ngày hiệu lực/ngày hết hạn của document (Admin only)
 * @param {string} documentId - ID của document
 * @param {{ effective_day: string, expired_day: string }} payload
 * @returns {Promise} Response với document đã cập nhật
 */
export const updateDocumentDates = async (documentId, payload) => {
  try {
    const response = await api.patch(`/admin/documents/${documentId}/dates`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
