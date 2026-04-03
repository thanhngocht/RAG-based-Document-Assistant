# RAG-based Document Assistant

Hệ thống Trợ lý Ảo tra cứu văn bản hành chính Việt Nam sử dụng công nghệ RAG (Retrieval-Augmented Generation) với LLM và Vector Database.

## Tổng quan

Ứng dụng này cung cấp một giải pháp thông minh để tra cứu và hỏi đáp về các văn bản hành chính, luật pháp và tài liệu chính thức bằng tiếng Việt. Hệ thống sử dụng mô hình AI để tìm kiếm thông tin chính xác từ tài liệu đã được upload và trả lời câu hỏi dựa trên ngữ cảnh.

### Tính năng chính

- 🤖 **Chatbot AI thông minh**: Trả lời câu hỏi dựa trên nội dung văn bản hành chính
- 📄 **Hỗ trợ nhiều định dạng**: Upload và xử lý file PDF, DOCX
- 🔍 **RAG Technology**: Tìm kiếm ngữ cảnh chính xác với Milvus Vector Database
- 💬 **Quản lý hội thoại**: Lưu trữ và theo dõi lịch sử chat
- 🔐 **Xác thực người dùng**: JWT Authentication
- 📱 **Giao diện hiện đại**: React UI với Tailwind CSS
- 🌐 **API RESTful**: FastAPI backend với documentation tự động

## Kiến trúc hệ thống

### Tech Stack

**Backend:**
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (dữ liệu người dùng & metadata)
- **Vector Database**: Milvus (vector embeddings)
- **LLM Framework**: LangChain
- **AI Models**: 
  - Ollama với Qwen 2.5:7b (generation)
  - nomic-embed-text-v2-moe (embeddings)
- **Document Processing**: Docling, Unstructured, PDFPlumber
- **Authentication**: JWT, Argon2 password hashing

**Frontend:**
- **Framework**: React 19
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Animations**: Motion
- **HTTP Client**: Axios
- **Build Tool**: Vite

**Infrastructure:**
- **Containerization**: Docker Compose
- **Services**: MongoDB, Milvus, MinIO, etcd, Mongo Express



## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

- **Python**: 3.10+
- **Node.js**: 18+
- **Docker & Docker Compose**: Latest version
- **Ollama**: Cài đặt và chạy local

### 1. Clone repository

```bash
git clone <repository-url>
cd RAG-based-Document-Assistant
```

### 2. Cài đặt Ollama và models

```bash
# Cài đặt Ollama (https://ollama.ai)
# MacOS/Linux:
curl -fsSL https://ollama.com/install.sh | sh

# Pull models cần thiết
ollama pull qwen2.5:7b
ollama pull nomic-embed-text-v2-moe
```

### 3. Khởi động Docker services

```bash
# Khởi động MongoDB, Milvus và các services liên quan
docker-compose up -d

# Kiểm tra các container đang chạy
docker-compose ps
```

**Services được khởi động:**
- MongoDB: `localhost:27017`
- Mongo Express: `http://localhost:8081`
- Milvus: `localhost:19530`
- MinIO: `localhost:9000` (Console: `localhost:9001`)

### 4. Cấu hình Backend

```bash
cd backend

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # MacOS/Linux
# hoặc: venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env từ template (nếu có) hoặc tự tạo
cat > .env << EOF
APP_NAME=RAG Document Assistant
API_PREFIX=/api/v1

# MongoDB
MONGO_URI=mongodb://root:example@localhost:27017
MONGO_DB=admin_chatbot
USERS_COLLECTION=users
DOCUMENTS_COLLECTION=documents
CONVERSATIONS_COLLECTION=conversations
MESSAGES_COLLECTION=messages

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_ALGORITHM=HS256
TOKEN_EXPIRE_MINUTES=120

# Milvus
MILVUS_ENDPOINT=http://localhost:19530
COLLECTION_NAME=admin_documents

# AI Models
EMBEDDING_MODEL=nomic-embed-text-v2-moe
MODEL_NAME=qwen2.5:7b

# Upload
UPLOAD_DIR=./uploads
EOF

# Chạy backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend sẽ chạy tại: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### 5. Cấu hình Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env (nếu cần)
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8000/api/v1
EOF

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 📖 Hướng dẫn sử dụng

### 1. Đăng ký tài khoản

- Truy cập `http://localhost:5173/register`
- Điền thông tin: email, username, password
- Đăng nhập với tài khoản vừa tạo

### 2. Upload tài liệu

- Sau khi đăng nhập, vào trang Admin (nếu có quyền admin)
- Upload các file PDF hoặc DOCX chứa văn bản hành chính
- Hệ thống sẽ xử lý và lưu trữ vector embeddings vào Milvus

### 3. Hỏi đáp với chatbot

- Vào trang Conversation
- Gõ câu hỏi về nội dung văn bản đã upload
- Chatbot sẽ tìm kiếm thông tin liên quan và trả lời dựa trên ngữ cảnh

### 4. Xem lịch sử

- Tất cả hội thoại được lưu trữ
- Có thể xem lại các cuộc trò chuyện trước đó

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký tài khoản mới
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/logout` - Đăng xuất

### Chat
- `POST /api/v1/chat/ask` - Gửi câu hỏi
- `GET /api/v1/chat/history` - Lấy lịch sử chat
- `GET /api/v1/chat/documents/{document_id}/download` - Download tài liệu

### Conversations
- `GET /api/v1/conversations` - Danh sách hội thoại
- `GET /api/v1/conversations/{conversation_id}` - Chi tiết hội thoại
- `DELETE /api/v1/conversations/{conversation_id}` - Xóa hội thoại

### Admin (yêu cầu quyền admin)
- `POST /api/v1/admin/documents` - Upload tài liệu
- `GET /api/v1/admin/documents` - Danh sách tài liệu
- `DELETE /api/v1/admin/documents/{document_id}` - Xóa tài liệu

## 🔐 Bảo mật

- **Password Hashing**: Argon2 algorithm
- **JWT Tokens**: 120 phút expiration (có thể cấu hình)
- **CORS**: Chỉ cho phép origins từ localhost trong development
- **Environment Variables**: Sensitive data được lưu trong `.env`

## 🛠️ Development

### Backend Development

```bash
cd backend

# Chạy với auto-reload
uvicorn app.main:app --reload

# Chạy với log level debug
uvicorn app.main:app --reload --log-level debug

# Reset Milvus collection (nếu cần)
python reset_milvus_now.py
```

### Frontend Development

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Docker Management

```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes (reset data)
docker-compose down -v

# Xem logs
docker-compose logs -f [service_name]

# Restart một service
docker-compose restart [service_name]
```

## 📊 Database Schema

### MongoDB Collections

**users**
- `_id`: ObjectId
- `email`: String (unique)
- `username`: String (unique)
- `password_hash`: String
- `role`: String (user/admin)
- `created_at`: DateTime

**documents**
- `_id`: ObjectId
- `filename`: String
- `file_path`: String
- `file_size`: Number
- `uploaded_at`: DateTime
- `uploaded_by`: String (user_id)
- `status`: String
- `document_id`: String (unique)

**conversations**
- `_id`: ObjectId
- `conversation_id`: String (unique)
- `user_id`: String
- `title`: String
- `created_at`: DateTime
- `updated_at`: DateTime

**messages**
- `_id`: ObjectId
- `conversation_id`: String
- `role`: String (user/assistant)
- `content`: String
- `sources`: Array
- `timestamp`: DateTime

### Milvus Collection

**admin_documents**
- `id`: Primary key
- `vector`: Float vector (embedding)
- `text`: String (chunk content)
- `source`: String
- `filename`: String
- `page`: Integer
- `document_id`: String

## 🐛 Troubleshooting

### Backend không kết nối được MongoDB
```bash
# Kiểm tra MongoDB đang chạy
docker-compose ps mongo

# Kiểm tra logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

### Milvus connection error
```bash
# Kiểm tra Milvus services
docker-compose ps standalone etcd minio

# Reset Milvus data
docker-compose down
rm -rf volumes/milvus volumes/etcd volumes/minio
docker-compose up -d
```

### Ollama model không load được
```bash
# Kiểm tra Ollama đang chạy
ollama list

# Pull lại models
ollama pull qwen2.5:7b
ollama pull nomic-embed-text-v2-moe
```

### Frontend không gọi được API
- Kiểm tra CORS settings trong `backend/app/main.py`
- Kiểm tra `VITE_API_BASE_URL` trong frontend `.env`
- Kiểm tra backend đang chạy tại port 8000

## TODO / Roadmap

- [ ] Hỗ trợ thêm định dạng file (TXT, Excel)
- [ ] Cải thiện OCR cho văn bản scan
- [ ] Multi-language support
- [ ] Export chat history
- [ ] Advanced search & filters
- [ ] Real-time chat updates với WebSocket
- [ ] Docker image cho production deployment
- [ ] Unit tests & Integration tests

## Acknowledgments

- LangChain - Framework for LLM applications
- Milvus - Vector database
- Ollama - Local LLM runtime
- FastAPI - Modern Python web framework
- React - UI library


