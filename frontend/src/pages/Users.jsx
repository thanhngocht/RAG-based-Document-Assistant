import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

// components
import PageTitle from "../components/PageTitle";
import TextField from "../components/TextField";
import { Button } from "../components/Button";
import { CircularProgress } from "../components/Progress";

// hooks
import { useSnackbar } from "../hooks/useSnackbar";

// actions
import { getUsers, createUser, updateUser, deleteUser } from "../actions/userActions";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUsers, setEditedUsers] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "user"
  });

  const { showSnackbar } = useSnackbar();

  // Load users khi component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage = typeof err === 'string' 
        ? err 
        : (err?.response?.data?.detail || 'Không thể tải danh sách users');
      
      showSnackbar({ 
        message: errorMessage, 
        type: 'error', 
        timeOut: 5000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (userId) => {
    setEditingUserId(userId);
    const user = users.find(u => u.id === userId);
    setEditedUsers({
      ...editedUsers,
      [userId]: {
        full_name: user.full_name || "",
        role: user.role,
        is_active: user.is_active
      }
    });
  };

  const handleCancelEdit = (userId) => {
    setEditingUserId(null);
    const newEditedUsers = { ...editedUsers };
    delete newEditedUsers[userId];
    setEditedUsers(newEditedUsers);
  };

  const handleInputChange = (userId, field, value) => {
    setEditedUsers({
      ...editedUsers,
      [userId]: {
        ...editedUsers[userId],
        [field]: value
      }
    });
  };

  const handleSave = async (userId) => {
    try {
      const updateData = editedUsers[userId];
      await updateUser(userId, updateData);
      
      showSnackbar({ 
        message: 'Cập nhật user thành công', 
        type: 'success', 
        timeOut: 3000 
      });
      
      setEditingUserId(null);
      loadUsers();
    } catch (err) {
      const errorMessage = typeof err === 'string' 
        ? err 
        : (err?.response?.data?.detail || 'Không thể cập nhật user');
      
      showSnackbar({ 
        message: errorMessage, 
        type: 'error', 
        timeOut: 5000 
      });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      return;
    }

    try {
      await deleteUser(userId);
      
      showSnackbar({ 
        message: 'Xóa user thành công', 
        type: 'success', 
        timeOut: 3000 
      });
      
      loadUsers();
    } catch (err) {
      const errorMessage = typeof err === 'string' 
        ? err 
        : (err?.response?.data?.detail || 'Không thể xóa user');
      
      showSnackbar({ 
        message: errorMessage, 
        type: 'error', 
        timeOut: 5000 
      });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.email || !newUser.password) {
      showSnackbar({ 
        message: 'Vui lòng điền đầy đủ thông tin', 
        type: 'error', 
        timeOut: 3000 
      });
      return;
    }

    try {
      await createUser(newUser);
      
      showSnackbar({ 
        message: 'Tạo user thành công', 
        type: 'success', 
        timeOut: 3000 
      });
      
      setIsCreating(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        full_name: "",
        role: "user"
      });
      loadUsers();
    } catch (err) {
      const errorMessage = typeof err === 'string' 
        ? err 
        : (err?.response?.data?.detail || 'Không thể tạo user');
      
      showSnackbar({ 
        message: errorMessage, 
        type: 'error', 
        timeOut: 5000 
      });
    }
  };

  return (
    <>
      <PageTitle title="Quản lý người dùng" />
      
      <div className="min-h-screen bg-light-surfaceContainerLowest dark:bg-dark-surfaceContainerLowest p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-light-onBackground dark:text-dark-onBackground">
              Quản lý người dùng
            </h1>
            <Button 
              onClick={() => setIsCreating(!isCreating)}
              variant="filled"
            >
              {isCreating ? "Hủy" : "Thêm User"}
            </Button>
          </div>

          {/* Form tạo user mới */}
          <AnimatePresence>
            {isCreating && (
              <div className="glass rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-light-onBackground dark:text-dark-onBackground">
                  Tạo user mới
                </h2>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Username"
                    name="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    required
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                  <TextField
                    label="Họ tên"
                    name="full_name"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2 text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                      Role
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface border border-light-outline dark:border-dark-outline"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" variant="filled">
                      Tạo User
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </AnimatePresence>

          {/* Table users */}
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
                      <th className="text-left p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Username</th>
                      <th className="text-left p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Email</th>
                      <th className="text-left p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Họ tên</th>
                      <th className="text-left p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Role</th>
                      <th className="text-left p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Trạng thái</th>
                      <th className="text-right p-4 text-light-onSurface dark:text-dark-onSurface font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr 
                        key={user.id} 
                        className="border-b border-light-outlineVariant dark:border-dark-outlineVariant hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors"
                      >
                        <td className="p-4 text-light-onSurface dark:text-dark-onSurface">
                          {user.username}
                        </td>
                        <td className="p-4 text-light-onSurface dark:text-dark-onSurface">
                          {user.email}
                        </td>
                        <td className="p-4">
                          {editingUserId === user.id ? (
                            <input
                              type="text"
                              value={editedUsers[user.id]?.full_name || ""}
                              onChange={(e) => handleInputChange(user.id, 'full_name', e.target.value)}
                              className="w-full px-2 py-1 rounded bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface border border-light-outline dark:border-dark-outline"
                            />
                          ) : (
                            <span className="text-light-onSurface dark:text-dark-onSurface">
                              {user.full_name || "-"}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editingUserId === user.id ? (
                            <select
                              value={editedUsers[user.id]?.role || user.role}
                              onChange={(e) => handleInputChange(user.id, 'role', e.target.value)}
                              className="px-2 py-1 rounded bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface border border-light-outline dark:border-dark-outline"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'admin' 
                                ? 'bg-light-errorContainer dark:bg-dark-errorContainer text-light-onErrorContainer dark:text-dark-onErrorContainer' 
                                : 'bg-light-primaryContainer dark:bg-dark-primaryContainer text-light-onPrimaryContainer dark:text-dark-onPrimaryContainer'
                            }`}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editingUserId === user.id ? (
                            <select
                              value={editedUsers[user.id]?.is_active ? "true" : "false"}
                              onChange={(e) => handleInputChange(user.id, 'is_active', e.target.value === "true")}
                              className="px-2 py-1 rounded bg-light-surfaceContainerHighest dark:bg-dark-surfaceContainerHighest text-light-onSurface dark:text-dark-onSurface border border-light-outline dark:border-dark-outline"
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.is_active 
                                ? 'bg-light-tertiaryContainer dark:bg-dark-tertiaryContainer text-light-onTertiaryContainer dark:text-dark-onTertiaryContainer' 
                                : 'bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant'
                            }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            {editingUserId === user.id ? (
                              <>
                                <button
                                  onClick={() => handleSave(user.id)}
                                  className="px-3 py-1 text-sm rounded bg-light-primary dark:bg-dark-primary text-light-onPrimary dark:text-dark-onPrimary hover:bg-light-primaryContainer dark:hover:bg-dark-primaryContainer transition-colors"
                                >
                                  Lưu
                                </button>
                                <button
                                  onClick={() => handleCancelEdit(user.id)}
                                  className="px-3 py-1 text-sm rounded bg-light-surfaceContainerHigh dark:bg-dark-surfaceContainerHigh text-light-onSurface dark:text-dark-onSurface hover:bg-light-surfaceContainerHighest dark:hover:bg-dark-surfaceContainerHighest transition-colors"
                                >
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(user.id)}
                                  className="px-3 py-1 text-sm rounded bg-light-primary dark:bg-dark-primary text-light-onPrimary dark:text-dark-onPrimary hover:bg-light-primaryContainer dark:hover:bg-dark-primaryContainer transition-colors"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id)}
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
                
                {users.length === 0 && (
                  <div className="text-center py-12 text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                    Chưa có user nào
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

export default Users;
