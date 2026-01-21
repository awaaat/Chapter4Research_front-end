import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import styles from './MessagingPage.module.css';
type NodeJSTimeout = ReturnType<typeof setTimeout>;

interface Conversation {
    conversation_id: string;
    project: { title: string; project_id: string };
    other_user: { username: string; avatar?: string; online: boolean };
    last_message: string;
    unread_count: number;
    updated_at: string;
}

interface Message {
    message_id: string;
    sender: 'CLIENT' | 'TUTOR';
    message_content: string;
    timestamp: string;
    attachment?: string;
    attachment_url?: string;
    attachment_type?: string;
    filename?: string;
    isMine: boolean;
    status?: 'sent' | 'delivered' | 'read';
}

const MessagingPage = () => {
    const { conversationId: paramId } = useParams<{ conversationId?: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<any | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAttachPopup, setShowAttachPopup] = useState(false);
    const [attachFile, setAttachFile] = useState<File | null>(null);
    const [attachType, setAttachType] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJSTimeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const attachPopupRef = useRef<HTMLDivElement>(null);
    const hasFetchedConvs = useRef(false);

    // Auth check
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (!token || !storedUser) {
            navigate('/login');
            return;
        }
        try {
            const u = JSON.parse(storedUser);
            setUser(u);
        } catch {
            localStorage.clear();
            navigate('/login');
        }
    }, [navigate]);

    // Fetch conversations
    const fetchConvs = useCallback(async () => {
        if (hasFetchedConvs.current || !user) return;
        hasFetchedConvs.current = true;

        try {
            const res = await apiClient.get('/conversations/');

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('No conversations found');
                }
                throw new Error(`Failed to fetch conversations (status: ${res.status})`);
            }

            const data = await res.json();
            const convs = (data.results || []).map((c: any) => ({
                ...c,
                other_user: {
                    username: user.role === 'client' ? c.tutor.username : c.client.username,
                    avatar: '',
                    online: Math.random() > 0.5,
                },
                last_message: c.last_message?.content || 'No messages yet',
            }));
            setConversations(convs);
            const preSelect = convs.find((c: Conversation) => c.conversation_id === paramId);
            if (preSelect) setSelectedConv(preSelect);
        } catch (err: any) {
            console.error('❌ Fetch conversations error:', err);
            setError(err.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }, [user, paramId]);

    useEffect(() => {
        if (user) {
            fetchConvs();
        }
    }, [user, fetchConvs]);

    // Setup WS for selected conv
    useEffect(() => {
        if (!selectedConv || !user) return;
        const token = localStorage.getItem('access_token');
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(`${wsProtocol}//${window.location.host}/ws/chat/${selectedConv.conversation_id}/?token=${token}`);
        socket.onopen = () => console.log('✅ Chat WS connected');
        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'typing') {
                setIsTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
            } else if (data.type === 'read') {
                setMessages((prev) => prev.map(m => m.message_id === data.message_id ? { ...m, status: 'read' } : m));
            } else {
                const newMsg: Message = {
                    message_id: data.message_id || Date.now().toString(),
                    sender: data.sender,
                    message_content: data.message,
                    timestamp: data.timestamp || new Date().toISOString(),
                    attachment_url: data.attachment_url,
                    filename: data.filename,
                    attachment_type: data.attachment_type,
                    isMine: (user.role === 'client' && data.sender === 'CLIENT') || (user.role === 'tutor' && data.sender === 'TUTOR'),
                    status: 'delivered',
                };
                setMessages((prev) => [...prev, newMsg]);
                socket.send(JSON.stringify({ type: 'read', message_id: newMsg.message_id }));

                // Mark as read in conversations list
                setConversations(prevConvs => prevConvs.map(conv =>
                    conv.conversation_id === selectedConv.conversation_id && !newMsg.isMine
                        ? { ...conv, unread_count: 0 }
                        : conv
                ));
            }
        };
        socket.onclose = () => console.log('Chat WS closed');
        socket.onerror = (err) => console.error('Chat WS error:', err);
        setWs(socket);
        return () => {
            socket.close();
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [selectedConv, user]);

    // Fetch messages for selected conv
    useEffect(() => {
        if (!selectedConv) return;

        const fetchMsgs = async () => {
            try {
                const res = await apiClient.get(`/conversations/${selectedConv.conversation_id}/messages/`);

                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('No messages in this conversation yet');
                    }
                    throw new Error(`Failed to fetch messages (status: ${res.status})`);
                }

                const data = await res.json();
                const msgs = (data.results || []).map((msg: any) => ({
                    ...msg,
                    isMine: (user.role === 'client' && msg.sender === 'CLIENT') || (user.role === 'tutor' && msg.sender === 'TUTOR'),
                    status: msg.isMine ? (msg.read ? 'read' : 'delivered') : undefined,
                }));
                setMessages(msgs);

                // Mark conversation as read when opening
                setConversations(prevConvs => prevConvs.map(conv =>
                    conv.conversation_id === selectedConv.conversation_id
                        ? { ...conv, unread_count: 0 }
                        : conv
                ));
            } catch (err: any) {
                console.error('❌ Fetch messages error:', err);
                setError(err.message || 'Failed to load messages');
            }
        };
        fetchMsgs();
    }, [selectedConv, user]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Typing handler
    const handleTyping = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'typing' }));
        }
    };

    // Close popups on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
            if (showAttachPopup && attachPopupRef.current && !attachPopupRef.current.contains(event.target as Node)) {
                setShowAttachPopup(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker, showAttachPopup]);

    const sendMessage = async () => {
        if (!selectedConv || (!newMessage.trim() && !attachFile)) return;

        // Optimistic update
        const tempId = Date.now().toString();
        const optimisticMsg: Message = {
            message_id: tempId,
            sender: user.role.toUpperCase(),
            message_content: newMessage,
            timestamp: new Date().toISOString(),
            attachment_url: attachFile ? URL.createObjectURL(attachFile) : undefined,
            attachment_type: attachType,
            filename: attachFile ? attachFile.name : undefined,
            isMine: true,
            status: 'sent',
        };
        setMessages((prev) => [...prev, optimisticMsg]);
        setNewMessage('');
        setAttachFile(null);
        setAttachType('');
        setShowAttachPopup(false);

        let res;
        try {
            if (attachFile) {
                const formData = new FormData();
                formData.append('message_content', newMessage);
                formData.append('sender', user.role.toUpperCase());
                formData.append('attachment', attachFile);
                if (user.role === 'tutor') formData.append('attachment_type', attachType || 'draft');

                res = await apiClient.post(`/conversations/${selectedConv.conversation_id}/messages/`, formData);
            } else {
                res = await apiClient.post(`/conversations/${selectedConv.conversation_id}/messages/`, {
                    message_content: newMessage,
                    sender: user.role.toUpperCase(),
                });
            }

            if (!res.ok) throw new Error(`Failed to send message (status: ${res.status})`);
            const data = await res.json();
            setMessages((prev) => prev.map(m => m.message_id === tempId ? {
                ...m,
                message_id: data.message_id,
                status: 'delivered',
                attachment_url: data.attachment_url,
                filename: data.filename,
                attachment_type: data.attachment_type
            } : m));

            if (selectedConv.other_user.online) {
                setTimeout(() => {
                    setMessages((prev) => prev.map(m => m.message_id === data.message_id ? { ...m, status: 'read' } : m));
                }, 2000);
            }
        } catch (err: any) {
            console.error('❌ Send message error:', err);
            setError(err.message || 'Failed to send message');
            setMessages((prev) => prev.filter(m => m.message_id !== tempId));
        }
    };

    const addEmoji = (emoji: any) => {
        setNewMessage((prev) => prev + emoji.native);
        setShowEmojiPicker(false);
    };

    const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setAttachFile(e.target.files[0]);
    };

    const groupMessagesByDate = (msgs: Message[]) => {
        const groups: { [date: string]: Message[] } = {};
        msgs.forEach((msg) => {
            const date = new Date(msg.timestamp).toDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    const messageGroups = groupMessagesByDate(messages);

    const filteredConversations = conversations.filter(conv =>
        conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className={styles.loading}>Loading conversations...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.page}>
            <div className={styles.sidebar}>
                <input
                    type="text"
                    placeholder="Search conversations..."
                    className={styles.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className={styles.convList}>
                    {filteredConversations.length === 0 ? (
                        <div className={styles.noChat}>No conversations found</div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <div
                                key={conv.conversation_id}
                                className={`${styles.convCard} ${selectedConv?.conversation_id === conv.conversation_id ? styles.active : ''}`}
                                onClick={() => setSelectedConv(conv)}
                            >
                                <div className={styles.avatar} data-status={conv.other_user.online ? 'Online' : 'Offline'}>
                                    {conv.other_user.avatar ? <img src={conv.other_user.avatar} alt="" /> : conv.other_user.username[0]}
                                    <span className={conv.other_user.online ? styles.online : styles.offline}></span>
                                </div>
                                <div className={styles.convInfo}>
                                    <h4>{conv.other_user.username}</h4>
                                    <p>{conv.project.title}</p>
                                    <small>{conv.last_message}</small>
                                </div>
                                <div className={styles.convMeta}>
                                    <small>{new Date(conv.updated_at).toLocaleTimeString()}</small>
                                    {conv.unread_count > 0 && <span className={styles.unread}>{conv.unread_count}</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className={styles.chatContainer}>
                {selectedConv ? (
                    <>
                        <div className={styles.chatHeader}>
                            <div className={styles.avatar} data-status={selectedConv.other_user.online ? 'Online' : 'Offline'}>
                                {selectedConv.other_user.avatar ? <img src={selectedConv.other_user.avatar} alt="" /> : selectedConv.other_user.username[0]}
                                <span className={selectedConv.other_user.online ? styles.online : styles.offline}></span>
                            </div>
                            <div>
                                <h3>{selectedConv.other_user.username}</h3>
                                <p>{selectedConv.project.title}</p>
                            </div>
                            <button onClick={() => navigate(
                                user.role === 'client'
                                    ? `/client/projects/${selectedConv.project.project_id}`
                                    : `/tutor/projects/${selectedConv.project.project_id}`
                            )}>View Project</button>
                        </div>
                        <div className={styles.messages}>
                            {Object.entries(messageGroups).map(([date, msgs]) => (
                                <div key={date}>
                                    <div className={styles.dateSeparator}>{date === new Date().toDateString() ? 'Today' : date}</div>
                                    {msgs.map((msg) => (
                                        <div key={msg.message_id} className={`${styles.message} ${msg.isMine ? styles.mine : ''}`}>
                                            {!msg.isMine && <div className={styles.avatar}>{selectedConv.other_user.username[0]}</div>}
                                            <div className={styles.bubble}>
                                                {msg.attachment_url ? (
                                                    <a
                                                        href={msg.attachment_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className={styles.fileLink}
                                                    >
                                                        <div className={styles.fileCard}>
                                                            <span className={styles.fileIcon}>📎</span>
                                                            <span className={styles.fileName}>
                                                                {msg.filename || 'Download File'} {msg.attachment_type ? `(${msg.attachment_type})` : ''}
                                                            </span>
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <p>{msg.message_content}</p>
                                                )}
                                                <small>
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                    {msg.isMine && msg.status && (
                                                        <span className={`${styles.ticks} ${msg.status === 'sent' ? styles.single : msg.status === 'delivered' ? styles.double : ''}`}>✓✓</span>
                                                    )}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            {isTyping && (
                                <div className={styles.typingIndicator}>
                                    Typing<span></span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className={styles.inputBar}>
                            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
                            <button onClick={() => setShowAttachPopup(true)}>📎</button>
                            <textarea
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                }}
                                placeholder="Type a message..."
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                        {showEmojiPicker && (
                            <div className={styles.emojiPicker} ref={emojiPickerRef}>
                                <Picker data={data} onEmojiSelect={addEmoji} />
                                <button onClick={() => setShowEmojiPicker(false)}>Close</button>
                            </div>
                        )}
                        {showAttachPopup && (
                            <div className={styles.attachPopup} ref={attachPopupRef}>
                                <input type="file" ref={fileInputRef} onChange={handleAttach} />
                                {user.role === 'tutor' && (
                                    <select value={attachType} onChange={(e) => setAttachType(e.target.value)}>
                                        <option value="">Select type</option>
                                        <option value="draft">Draft</option>
                                        <option value="final">Final</option>
                                        <option value="revision">Revision</option>
                                        <option value="additional">Additional</option>
                                    </select>
                                )}
                                <button onClick={sendMessage}>Upload & Send</button>
                                <button onClick={() => setShowAttachPopup(false)}>Cancel</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.noChat}>Select a conversation to start chatting</div>
                )}
            </div>
        </div>
    );
};

export default MessagingPage;