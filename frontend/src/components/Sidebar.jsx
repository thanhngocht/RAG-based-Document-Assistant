import PropTypes from "prop-types";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

/*Component*/
import Logo from "./Logo";
import { ExtendedFab } from "./Button";
import ConversationList from "./ConversationList";
import { fetchConversations, deleteConversation } from "../actions/conversationActions";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const scrollContainerRef = useRef(null);
    
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20;

    // Load conversations on mount and when location changes (new conversation created)
    useEffect(() => {
        loadConversations(true); // true = reset
    }, [location.pathname]);

    // Update active conversation based on URL
    useEffect(() => {
        const match = location.pathname.match(/\/conversation\/([^/]+)/);
        if (match) {
            setActiveConversationId(match[1]);
        } else {
            setActiveConversationId(null);
        }
    }, [location.pathname]);

    // Infinite scroll detection
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            // Check if scrolled to bottom (with 10px threshold)
            if (scrollHeight - scrollTop <= clientHeight + 10) {
                if (hasMore && !loadingMore && !loading) {
                    loadMoreConversations();
                }
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [hasMore, loadingMore, loading, offset]);

    const loadConversations = async (reset = false) => {
        try {
            setLoading(true);
            const data = await fetchConversations(LIMIT, 0, 'active');
            setConversations(data.items || []);
            setOffset(LIMIT);
            setHasMore(data.total > LIMIT);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreConversations = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);
            const data = await fetchConversations(LIMIT, offset, 'active');
            
            // Append new conversations
            setConversations(prev => [...prev, ...(data.items || [])]);
            setOffset(prev => prev + LIMIT);
            
            // Check if there are more
            setHasMore(data.total > offset + data.items.length);
        } catch (error) {
            console.error('Error loading more conversations:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleNewChat = () => {
        setActiveConversationId(null);
        navigate('/');
        if (toggleSidebar) toggleSidebar();
    };

    const handleSelectConversation = (conversationId) => {
        setActiveConversationId(conversationId);
        navigate(`/conversation/${conversationId}`);
        if (toggleSidebar) toggleSidebar();
    };

    const handleDeleteConversation = async (conversationId) => {
        try {
            await deleteConversation(conversationId);
            
            // Remove from list
            setConversations(prev => prev.filter(c => c.id !== conversationId));
            
            // If deleted conversation was active, go to home
            if (activeConversationId === conversationId) {
                setActiveConversationId(null);
                navigate('/');
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            alert('Không thể xóa cuộc hội thoại. Vui lòng thử lại.');
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`sidebar ${isSidebarOpen ? 'active' : ''}`}
            >
                <div className="sidebar-inner">
                    <div className="h-16 grid items-center px-4 mb-4">
                        {/*Logo*/}
                        <Logo />
                    </div>

                    {/* New Chat Button */}
                    <ExtendedFab 
                        text="Đoạn chat mới"
                        classes=""
                        onClick={handleNewChat}
                    />

                    {/* Conversations List with Infinite Scroll */}
                    <div 
                        className="overflow-y-auto -me-2 pe-1" 
                        ref={scrollContainerRef}
                    >
                        <p className="text-titleSmall h-9 grid items-center px-4">
                            Gần đây
                        </p>
                        
                        <ConversationList
                            conversations={conversations}
                            activeConversationId={activeConversationId}
                            onSelectConversation={handleSelectConversation}
                            onDeleteConversation={handleDeleteConversation}
                            loading={loading}
                        />

                        {/* Loading More Indicator */}
                        {loadingMore && (
                            <div className="text-center py-4 px-4">
                                <p className="text-bodySmall text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                                    Đang tải thêm...
                                </p>
                            </div>
                        )}

                        {/* End of List */}
                        {!hasMore && conversations.length > 0 && (
                            <div className="text-center py-4 px-4">
                                <p className="text-bodySmall text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                                    Đã hiển thị tất cả {conversations.length} đoạn chat
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <div 
                className={`overlay ${isSidebarOpen ? 'active' : ''}`}
                onClick={toggleSidebar}
            ></div>
        </>
    );
};

Sidebar.propTypes = {
    isSidebarOpen: PropTypes.bool,
    toggleSidebar: PropTypes.func,
};

export default Sidebar;