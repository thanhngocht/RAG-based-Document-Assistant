
import { Outlet, useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToggle } from './hooks/useToggle';
import { useState, useRef, useCallback } from 'react';

import PageTitle from "./components/PageTitle";
import TopAppBar from "./components/TopAppBar";
import Sidebar from "./components/Sidebar";
import Greetings from "./pages/Greetings";
import PromptField from './components/PromptField';
import { sendMessage } from './actions/conversationActions';


const App = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, toggleSidebar] = useToggle();
  const [sending, setSending] = useState(false);
  const promptHandlerRef = useRef(null);

  const handleSendMessage = useCallback(async (question) => {
    if (!question.trim() || sending) return;

    setSending(true);
    try {
      // If we're in a conversation, use the conversation's handler
      if (params.conversationId && promptHandlerRef.current) {
        await promptHandlerRef.current(question);
      } else {
        // Home page - create new conversation
        const response = await sendMessage(question);
        if (response.conversation_id) {
          navigate(`/conversation/${response.conversation_id}`);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  }, [sending, params.conversationId, navigate]);

  const registerPromptHandler = useCallback((handler) => {
    promptHandlerRef.current = handler;
  }, []);

  return (
    <div>
      <PageTitle title="Trợ lí ảo - hỗ trợ tra cứu văn bản hành chính" />
      
    

      <div className="lg:grid lg:grid-cols-[320px,1fr]">
        <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}/>
        <div className='h-dvh grid grid-rows-[max-content,minmax(0,1fr),max-content]'>
          <TopAppBar toggleSidebar={toggleSidebar} />

          <div className='px-5 pb-5 flex flex-col overflow-y-auto'>
            <div className="max-w-[840px] w-full mx-auto grow">
              {params.conversationId ? (
                <Outlet context={{ registerPromptHandler }} />
              ):(   <Greetings/>
              )}
            </div>
          </div>

          {/* Input area - always at bottom */}
          <div className='bg-light-background dark:bg-dark-background'>
            <div className='max-w-[870px] px-5 w-full mx-auto'>
              <PromptField 
                onSubmit={handleSendMessage}
                disabled={sending}
                placeholder={sending ? 'Đang gửi...' : 'Nhập câu hỏi của bạn...'}
              />
              {!params.conversationId && (
                <motion.p
                  initial={{ opacity:0, translateY:'-4px'}}
                  animate={{ opacity:1, translateY: 0}}
                  transition={{ duaration: 0.2, delay: 0.8, ease: 'easeOut'}}
                  className='text-bodySmall text-center
                  text-light-onSurfaceVariant
                  dark:text-dark-onSurfaceVariant p-3'
                >
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit sit obcaecati fugit, earum minima doloremque quidem est, consectetur assumenda mollitia, odit quod quisquam omnis perferendis natus nulla odio facilis rerum.
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App
