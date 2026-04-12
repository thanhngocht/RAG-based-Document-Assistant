import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

// components
import PageTitle from "../components/PageTitle";
import { Button } from "../components/Button";
import { CircularProgress } from "../components/Progress";

// hooks
import { useSnackbar } from "../hooks/useSnackbar";

// actions
import { getDocuments, uploadDocument, deleteDocument, updateDocumentDates } from "../actions/documentActions";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [effectiveDay, setEffectiveDay] = useState("");
  const [expiredDay, setExpiredDay] = useState("");
  const [editingDocumentId, setEditingDocumentId] = useState(null);
  const [editingEffectiveDay, setEditingEffectiveDay] = useState("");
  const [editingExpiredDay, setEditingExpiredDay] = useState("");
  const [isUpdatingDates, setIsUpdatingDates] = useState(false);

  const { showSnackbar } = useSnackbar();

  // Load documents khi component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      const errorMessage = typeof err === 'string' 
        ? err 
        : (err?.response?.data?.detail || 'Không thể tải danh sách documents');
      
      showSnackbar({ 
        message: errorMessage, 
        type: 'error', 
        timeOut: 5000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validate file types
    const validTypes = ['.pdf', '.txt', '.doc', '.docx'];
    const invalidFiles = files.filter(file => {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return !validTypes.includes(fileExtension);
    });
    
    if (invalidFiles.length > 0) {
      showSnackbar({ 
        message: 'Chỉ hỗ trợ file PDF, TXT, DOC, DOCX', 
        type: 'error', 
        timeOut: 3000 
      });
      return;
    }
    
    setSelectedFiles(files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      showSnackbar({ 
        message: 'Vui lòng chọn file để upload', 
        type: 'error', 
        timeOut: 3000 
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      if (effectiveDay) {
        formData.append('effective_day', effectiveDay);
      }
      if (expiredDay) {
        formData.append('expired_day', expiredDay);
      }
      
      await uploadDocument(formData);
      
      showSnackbar({ 
        message: `Upload ${selectedFiles.length} document(s) thành công`, 
        type: 'success', 
        timeOut: 3000 
      });
      
      setSelectedFiles([]);
      setEffectiveDay("");
      setExpiredDay("");
      // Reset input file
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      setIsUploading(false);
      loadDocuments();
    } catch (err) {
      const errorMessage = typeof err === 'string' 
        ? err 
        : (err?.response?.data?.detail || 'Không thể upload document');
      
      showSnackbar({ 
        message: errorMessage, 
        type: 'error', 
        timeOut: 5000 
      });
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa document này?')) {
      return;
    }

    try {
      await deleteDocument(documentId);
      
      showSnackbar({ 
        message: 'Xóa document thành công', 
        type: 'success', 
        timeOut: 3000 
      });
      
      loadDocuments();
    } catch (err) {
      const errorMessage = typeof err === 'string' 
        ? err 
        : (err?.response?.data?.detail || 'Không thể xóa document');
      
      showSnackbar({ 
        message: errorMessage, 
        type: 'error', 
        timeOut: 5000 
      });
    }
  };

  const handleStartEditDates = (doc) => {
    setEditingDocumentId(doc.id);
    setEditingEffectiveDay(doc.effective_day || "");
    setEditingExpiredDay(doc.expired_day || "");
  };

  const handleCancelEditDates = () => {
    setEditingDocumentId(null);
    setEditingEffectiveDay("");
    setEditingExpiredDay("");
  };

  const handleSaveEditDates = async (documentId) => {
    if (editingEffectiveDay && editingExpiredDay && editingEffectiveDay > editingExpiredDay) {
      showSnackbar({
        message: "Ngày hiệu lực phải nhỏ hơn hoặc bằng ngày hết hạn",
        type: "error",
        timeOut: 4000,
      });
      return;
    }

    setIsUpdatingDates(true);
    try {
      await updateDocumentDates(documentId, {
        effective_day: editingEffectiveDay,
        expired_day: editingExpiredDay,
      });

      showSnackbar({
        message: "Cập nhật ngày hiệu lực/hết hạn thành công",
        type: "success",
        timeOut: 3000,
      });

      handleCancelEditDates();
      loadDocuments();
    } catch (err) {
      const errorMessage = typeof err === "string"
        ? err
        : (err?.response?.data?.detail || "Không thể cập nhật ngày hiệu lực/hết hạn");

      showSnackbar({
        message: errorMessage,
        type: "error",
        timeOut: 5000,
      });
    } finally {
      setIsUpdatingDates(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <PageTitle title="Quản lý tài liệu" />
      
      <div className="min-h-screen bg-light-surfaceContainerLowest dark:bg-dark-surfaceContainerLowest p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-light-onBackground dark:text-dark-onBackground">
              Quản lý tài liệu
            </h1>
          </div>

          {/* Form upload document */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-light-onBackground dark:text-dark-onBackground">
              Tải tài liệu mới
            </h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                  Chọn tệp (PDF, DOCX)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.doc,.docx"
                  multiple
                  className="w-full px-4 py-2 rounded-lg bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface border border-light-outline dark:border-dark-outline file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-light-primary dark:file:bg-dark-primary file:text-light-onPrimary dark:file:text-dark-onPrimary hover:file:bg-light-primaryContainer dark:hover:file:bg-dark-primaryContainer cursor-pointer"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                    <p className="font-semibold mb-1">Đã chọn {selectedFiles.length} tệp:</p>
                    <ul className="list-disc list-inside">
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file.name} ({formatFileSize(file.size)})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                  Ngày hiệu lực
                </label>
                <input
                  type="date"
                  value={effectiveDay}
                  onChange={(e) => setEffectiveDay(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface border border-light-outline dark:border-dark-outline"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                  Ngày hết hạn
                </label>
                <input
                  type="date"
                  value={expiredDay}
                  onChange={(e) => setExpiredDay(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface border border-light-outline dark:border-dark-outline"
                />
              </div>
              <div>
                <Button 
                  type="submit" 
                  variant="filled"
                  disabled={isUploading || selectedFiles.length === 0}
                >
                  {isUploading ? 'Đang tải...' : 'Tải lên'}
                </Button>
              </div>
            </form>
          </div>

          {/* Table documents */}
          <div className="glass rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <CircularProgress size="large" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-light-primary dark:bg-dark-primary">
                    <tr>
                      <th className="text-left p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Tên tệp</th>
                      <th className="text-left p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Người upload</th>
                      <th className="text-left p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Ngày tải lên</th>
                      <th className="text-left p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Ngày hiệu lực</th>
                      <th className="text-left p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Ngày hết hạn</th>
                      <th className="text-left p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Trạng thái</th>
                      <th className="text-right p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr 
                        key={doc.id} 
                        className="border-b border-light-outlineVariant dark:border-dark-outlineVariant hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors"
                      >
                        <td className="p-4 text-light-onSurface dark:text-dark-onSurface">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-rounded text-light-primary dark:text-dark-primary">
                              description
                            </span>
                            {doc.filename}
                          </div>
                        </td>
                        <td className="p-4 text-light-onSurface dark:text-dark-onSurface">
                          {doc.uploaded_by || 'N/A'}
                        </td>
                        <td className="p-4 text-light-onSurface dark:text-dark-onSurface">
                          {formatDate(doc.created_at)}
                        </td>
                        <td className="p-4 text-light-onSurface dark:text-dark-onSurface">
                          {editingDocumentId === doc.id ? (
                            <input
                              type="date"
                              value={editingEffectiveDay}
                              onChange={(e) => setEditingEffectiveDay(e.target.value)}
                              className="w-full min-w-[150px] px-3 py-1.5 rounded-lg bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface border border-light-outline dark:border-dark-outline"
                            />
                          ) : (
                            doc.effective_day || 'N/A'
                          )}
                        </td>
                        <td className="p-4 text-light-onSurface dark:text-dark-onSurface">
                          {editingDocumentId === doc.id ? (
                            <input
                              type="date"
                              value={editingExpiredDay}
                              onChange={(e) => setEditingExpiredDay(e.target.value)}
                              className="w-full min-w-[150px] px-3 py-1.5 rounded-lg bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface border border-light-outline dark:border-dark-outline"
                            />
                          ) : (
                            doc.expired_day || 'N/A'
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            doc.status === 'done' 
                              ? 'bg-light-tertiaryContainer dark:bg-dark-tertiaryContainer text-light-onTertiaryContainer dark:text-dark-onTertiaryContainer' 
                              : doc.status === 'processing' 
                              ? 'bg-light-primaryContainer dark:bg-dark-primaryContainer text-light-onPrimaryContainer dark:text-dark-onPrimaryContainer'
                              : 'bg-light-errorContainer dark:bg-dark-errorContainer text-light-onErrorContainer dark:text-dark-onErrorContainer'
                          }`}>
                            {doc.status === 'done' 
                              ? 'Đã xử lý' 
                              : doc.status === 'processing' 
                              ? 'Đang xử lý' 
                              : 'Lỗi'}
                     
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            {editingDocumentId === doc.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEditDates(doc.id)}
                                  disabled={isUpdatingDates}
                                  className="px-3 py-1 text-sm rounded bg-light-primary dark:bg-dark-primary text-light-onPrimary dark:text-dark-onPrimary hover:bg-light-primaryContainer dark:hover:bg-dark-primaryContainer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {isUpdatingDates ? 'Đang lưu...' : 'Lưu'}
                                </button>
                                <button
                                  onClick={handleCancelEditDates}
                                  disabled={isUpdatingDates}
                                  className="px-3 py-1 text-sm rounded bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface hover:bg-light-surfaceContainerHigh dark:hover:bg-dark-surfaceContainerHigh transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEditDates(doc)}
                                  className="px-3 py-1 text-sm rounded bg-light-secondaryContainer dark:bg-dark-secondaryContainer text-light-onSecondaryContainer dark:text-dark-onSecondaryContainer hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors"
                                >
                                  Sửa ngày
                                </button>
                                <button
                                  onClick={() => handleDelete(doc.id)}
                                  className="px-3 py-1 text-sm rounded bg-light-error dark:bg-dark-error text-light-onError dark:text-dark-onError hover:bg-light-errorContainer dark:hover:bg-dark-errorContainer transition-colors"
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {documents.length === 0 && (
                  <div className="text-center py-12 text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                    Chưa có tài liệu nào
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Documents;
