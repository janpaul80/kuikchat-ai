
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AuthDebugger from './components/AuthDebugger';
import type { Chat as GeminiChat } from '@google/genai';
import type { Chat as ChatType, GroupChat, Message, User, UserStatus, StatusItem, Media, Community, CalendarEvent, RepeatInterval, TextEffect } from './types';
import { useAuth } from './contexts/AuthContext';
import { signOut } from './services/supabase';
import ContactList from './components/ContactList';
import ChatWindow from './components/ChatWindow';
import AppSidebar from './components/AppSidebar';
import StatusList from './components/StatusList';
import StatusPlaceholder from './components/StatusPlaceholder';
import StatusViewer from './components/StatusViewer';
import StatusCreator from './components/StatusCreator';
import SettingsView from './components/SettingsView';
import AddContactView from './components/AddContactView';
import NewChatView from './components/NewChatView';
import CreateGroupView from './components/CreateGroupView';
import VideoCallView from './components/VideoCallView';
import GroupInfoView from './components/GroupInfoView';
import CommunitiesView from './components/CommunitiesView';
import CommunityPlaceholder from './components/CommunityPlaceholder';
import ChannelsList from './components/ChannelsList';
import ChannelsPlaceholder from './components/ChannelsPlaceholder';
import ForwardModal from './components/ForwardModal';
import EventCreator from './components/EventCreator';
import DocumentScanner from './components/DocumentScanner';
import ScheduleMessageModal from './components/ScheduleMessageModal';
import { createBotChatSession, sendMessageToBot, generateImageFromPrompt, generateAudioTranscript } from './services/geminiService';
import { useLanguage } from './contexts/LanguageContext';
import PasswordPromptModal from './components/PasswordPromptModal';
import Home from './pages/Home';

const botAvatar = "data:image/svg+xml,%3csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z' fill='%23075E54'/%3e%3cpath d='M16.5 12C16.5 13.38 15.38 14.5 14 14.5C12.62 14.5 11.5 13.38 11.5 12C11.5 10.62 12.62 9.5 14 9.5C15.38 9.5 16.5 10.62 16.5 12Z' fill='%23128C7E'/%3e%3cpath d='M10 12C10 13.38 8.88 14.5 7.5 14.5C6.12 14.5 5 13.38 5 12C5 10.62 6.12 9.5 7.5 9.5C8.88 9.5 10 10.62 10 12Z' fill='%23128C7E'/%3e%3cpath d='M16 17.01C16 17.11 15.96 17.21 15.88 17.28L15.2 17.96C15.12 18.04 15.02 18.08 14.92 18.08H9.08C8.98 18.08 8.88 18.04 8.8 17.96L8.12 17.28C8.04 17.21 8 17.11 8 17.01V16H16V17.01Z' fill='%23075E54'/%3e%3c/svg%3e";
const kuikBot: User = { id: 'kuik-bot', name: 'KuikChat Bot', username: '@kuikbot', avatar: botAvatar, isBot: true };

const initialCurrentUser: User = {
  id: 'user-1',
  name: 'You',
  username: '@you',
  avatar: 'https://i.pravatar.cc/150?u=user-1',
  about: 'Hello KuikChat!',
  profileColor: '#3b82f6'
};

const dana: User = { id: 'user-2', name: 'Dana', username: '@dana', avatar: 'https://i.pravatar.cc/150?u=user-2', isVerified: true, about: 'Busy at work 💻' };
const alex: User = { id: 'user-3', name: 'Alex', username: '@alex', avatar: 'https://i.pravatar.cc/150?u=user-3', about: 'Available' };
const ryan: User = { id: 'user-4', name: 'Ryan', username: '@ryan', avatar: 'https://i.pravatar.cc/150?u=user-4' };

const initialChats: ChatType[] = [
    {
        id: 'chat-1',
        type: 'individual',
        user: kuikBot,
        messages: [
            { id: 'msg-bot-1', text: btoa(unescape(encodeURIComponent("Hello! I'm your KuikChat assistant, powered by Gemini. How can I help you today?"))), timestamp: '10:00 AM', senderId: 'kuik-bot', isBot: true, sentAt: Date.now() - 100000, type: 'user' },
        ],
        disappearingMessagesTimer: 0,
    },
    {
        id: 'chat-2',
        type: 'individual',
        user: dana,
        messages: [
            { id: 'msg-dana-1', text: btoa(unescape(encodeURIComponent("Hey, are we still on for lunch?"))), timestamp: '10:05 AM', senderId: 'user-2', status: 'read', sentAt: Date.now() - 90000, type: 'user' },
            { id: 'msg-dana-2', text: btoa(unescape(encodeURIComponent("Absolutely! See you at 1."))), timestamp: '10:06 AM', senderId: 'user-1', status: 'read', sentAt: Date.now() - 80000, type: 'user' },
        ],
        disappearingMessagesTimer: 0,
    },
    {
        id: 'chat-3',
        type: 'group',
        name: 'Project Team',
        avatar: 'https://i.pravatar.cc/150?u=group-1',
        participants: [initialCurrentUser, dana, alex],
        admins: ['user-1'],
        permissions: { sendMessages: 'all', editInfo: 'all' },
        messages: [
            { id: 'msg-group-1', text: btoa(unescape(encodeURIComponent("Let's review the new mockups."))), timestamp: 'Yesterday', senderId: 'user-3', status: 'read', sentAt: Date.now() - 200000, type: 'user' },
        ],
    }
];


type ModalView = 'none' | 'settings' | 'add_contact' | 'new_chat' | 'create_group' | 'forward_message' | 'create_event' | 'scan_document' | 'schedule_message';
type ActiveView = 'chats' | 'status' | 'communities';
type PasswordPromptMode = 'none' | 'set' | 'enter' | 'change';

const App: React.FC = () => {
    // Auth state from context
    const { user, session, isLoading: isAuthLoading, isAuthenticated } = useAuth();

    // Landing Page State - Show landing page when not authenticated
    const [showLanding, setShowLanding] = useState(!isAuthenticated);

    // Data state
    const [currentUser, setCurrentUser] = useState<User>(initialCurrentUser);
    const [chats, setChats] = useState<ChatType[]>(initialChats);
    const [statuses, setStatuses] = useState<UserStatus[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [allContactUsers, setAllContactUsers] = useState<User[]>([dana, alex, ryan]);
    const [chatWallpaper, setChatWallpaper] = useState<string>('');

    // UI State
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [botChatSession, setBotChatSession] = useState<GeminiChat | null>(null);
    const [typingIndicators, setTypingIndicators] = useState<Record<string, boolean>>({});
    const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
    const [activeView, setActiveView] = useState<ActiveView>('chats');
    const [viewingStatus, setViewingStatus] = useState<UserStatus | null>(null);
    const [isCreatingStatus, setIsCreatingStatus] = useState(false);
    const [lastBackupTimestamp, setLastBackupTimestamp] = useState<string | null>(null);
    const [modalView, setModalView] = useState<ModalView>('none');
    const [activeCall, setActiveCall] = useState<{ chatId: string; participants: User[] } | null>(null);
    const [viewingGroupInfoId, setViewingGroupInfoId] = useState<string | null>(null);
    const [hiddenChatsPassword, setHiddenChatsPassword] = useState<string | null>(null);
    const [isHiddenChatsLocked, setIsHiddenChatsLocked] = useState(true);
    const [passwordPrompt, setPasswordPrompt] = useState<{ mode: PasswordPromptMode; chatIdToHide?: string; error?: string }>({ mode: 'none' });
    const [defaultDisappearingTimer, setDefaultDisappearingTimer] = useState<number>(0);
    const [messageToForward, setMessageToForward] = useState<Message | null>(null);

    const { t } = useLanguage();

    // Initialize App State
    useEffect(() => {
        const savedProfile = localStorage.getItem('kuikchat_profile');
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                setCurrentUser({ ...initialCurrentUser, ...profile });
            } catch (e) {
                // Error parsing
            }
        }
        
        const savedWallpaper = localStorage.getItem('kuikchat_wallpaper');
        if (savedWallpaper) setChatWallpaper(savedWallpaper);

        const savedTimer = localStorage.getItem('kuikchat_default_timer');
        if (savedTimer) setDefaultDisappearingTimer(parseInt(savedTimer, 10));

        const timestamp = localStorage.getItem('kuikchat_backup_timestamp');
        if (timestamp) setLastBackupTimestamp(timestamp);
        
        const savedPassword = localStorage.getItem('kuikchat_hidden_password');
        if (savedPassword) setHiddenChatsPassword(savedPassword);

        try {
            const session = createBotChatSession();
            setBotChatSession(session);
        } catch (error) {
            console.error("Failed to initialize bot session:", error);
        }
    }, []);

    const handleLogin = () => {
        localStorage.setItem('kuikchat_profile', JSON.stringify(initialCurrentUser));
        setCurrentUser(initialCurrentUser);
        setShowLanding(false);
    };

    // Redirect to landing if not authenticated and auth has loaded
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            setShowLanding(true);
        }
    }, [isAuthLoading, isAuthenticated]);

    const allUsersForProps = useMemo(() => {
        const users = new Map<string, User>();
        users.set(currentUser.id, currentUser);
        allContactUsers.forEach(u => users.set(u.id, u));
        chats.forEach(chat => {
            if (chat.type === 'individual') {
                if (!users.has(chat.user.id)) users.set(chat.user.id, chat.user);
            } else if (chat.type === 'group') {
                chat.participants.forEach(p => {
                    if (!users.has(p.id)) users.set(p.id, p);
                });
            }
        });
        if (!users.has(kuikBot.id)) {
            users.set(kuikBot.id, kuikBot);
        }
        return Array.from(users.values());
    }, [currentUser, chats, allContactUsers]);

    // REAL SCREENSHOT DETECTION LOGIC (Desktop via PrintScreen Key)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'PrintScreen') {
                if (activeChatId) {
                    const activeChat = chats.find(c => c.id === activeChatId);
                    if (activeChat && activeChat.isVanishMode) {
                        // Trigger screenshot notification
                        handleScreenshot(activeChatId);
                    }
                }
            }
        };

        window.addEventListener('keyup', handleKeyDown);
        return () => {
            window.removeEventListener('keyup', handleKeyDown);
        };
    }, [activeChatId, chats]);

    // Simulate message status updates (Sent -> Delivered -> Read)
    useEffect(() => {
        const statusInterval = setInterval(() => {
            const now = Date.now();
            setChats(prevChats => {
                let chatsChanged = false;
                const newChats = prevChats.map(chat => {
                    // Skip if chat is empty or purely system/bot
                    if (chat.messages.length === 0) return chat;

                    let messagesChanged = false;
                    const newMessages = chat.messages.map(msg => {
                        if (msg.senderId === currentUser.id && !msg.isBot && msg.type !== 'system') {
                            const timeSinceSent = now - msg.sentAt;
                            
                            // Sent -> Delivered (after 1.5s)
                            if (msg.status === 'sent' && timeSinceSent > 1500) {
                                messagesChanged = true;
                                return { ...msg, status: 'delivered' as const };
                            }
                            
                            // Delivered -> Read (after 3.5s)
                            if (msg.status === 'delivered' && timeSinceSent > 3500) {
                                messagesChanged = true;
                                return { ...msg, status: 'read' as const };
                            }
                        }
                        return msg;
                    });

                    if (messagesChanged) {
                        chatsChanged = true;
                        return { ...chat, messages: newMessages };
                    }
                    return chat;
                });

                return chatsChanged ? newChats : prevChats;
            });
        }, 1000);

        return () => clearInterval(statusInterval);
    }, [currentUser.id]);

    // Effect to clean up disappearing messages and check scheduled messages
    useEffect(() => {
      const intervalId = setInterval(() => {
        const now = Date.now();
        setChats(prevChats => {
            let hasChanges = false;
            const updatedChats = prevChats.map(chat => {
                let chatChanged = false;
                let newMessages = [...chat.messages];
                let newScheduledMessages = chat.scheduledMessages ? [...chat.scheduledMessages] : [];

                // Disappearing messages logic
                const filteredMessages = newMessages.filter(msg => !msg.disappearsAt || msg.disappearsAt > now);
                if (filteredMessages.length !== newMessages.length) {
                    newMessages = filteredMessages;
                    chatChanged = true;
                }

                // Scheduled messages logic
                if (newScheduledMessages.length > 0) {
                    const messagesToSend: Message[] = [];
                    const remainingScheduled: Message[] = [];

                    newScheduledMessages.forEach(msg => {
                        if (msg.scheduledFor && msg.scheduledFor <= now) {
                            // It's time to send!
                            const messageToSend = { ...msg, scheduledFor: undefined, sentAt: now, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
                            messagesToSend.push(messageToSend);

                            // Repeating logic
                            if (msg.repeatInterval && msg.repeatInterval !== 'none') {
                                let nextScheduledTime = now;
                                switch(msg.repeatInterval) {
                                    case 'daily': nextScheduledTime += 24 * 60 * 60 * 1000; break;
                                    case 'weekly': nextScheduledTime += 7 * 24 * 60 * 60 * 1000; break;
                                    case 'monthly': 
                                        const d = new Date(now);
                                        d.setMonth(d.getMonth() + 1);
                                        nextScheduledTime = d.getTime();
                                        break;
                                }
                                const nextMsg = { ...msg, id: self.crypto.randomUUID(), scheduledFor: nextScheduledTime };
                                remainingScheduled.push(nextMsg);
                            }
                        } else {
                            remainingScheduled.push(msg);
                        }
                    });

                    if (messagesToSend.length > 0) {
                        newMessages = [...newMessages, ...messagesToSend];
                        newScheduledMessages = remainingScheduled;
                        chatChanged = true;
                    }
                }

                if (chatChanged) {
                    hasChanges = true;
                    return { ...chat, messages: newMessages, scheduledMessages: newScheduledMessages };
                }
                return chat;
            });

            return hasChanges ? updatedChats : prevChats;
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }, []);
    
    const handleSelectChat = useCallback((id: string) => {
        setActiveChatId(id);
        setActiveView('chats');
        setViewingGroupInfoId(null);
        setReplyToMessage(null);
    }, []);

    const handleCancelReply = useCallback(() => setReplyToMessage(null), []);
    
    const handleSendMessage = useCallback(async (chatId: string, text: string, effect?: TextEffect) => {
        const targetChat = chats.find(c => c.id === chatId);
        if (!targetChat) return;

        const now = Date.now();
        const newMessage: Message = {
            id: self.crypto.randomUUID(),
            text: btoa(unescape(encodeURIComponent(text))),
            textEffect: effect,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderId: currentUser.id,
            status: 'sent',
            sentAt: now,
            type: 'user',
            disappearsAt: targetChat.disappearingMessagesTimer ? now + targetChat.disappearingMessagesTimer : undefined,
            replyTo: replyToMessage ? { 
                messageId: replyToMessage.id, 
                senderName: allUsersForProps.find(u => u.id === replyToMessage.senderId)?.name || '', 
                text: replyToMessage.text ? btoa(unescape(encodeURIComponent(replyToMessage.text))) : undefined, 
                media: replyToMessage.media 
            } : undefined,
            isVanish: targetChat.isVanishMode
        };

        setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, newMessage] } : c));
        handleCancelReply();

        // Handle bot response if applicable
        if (targetChat.type === 'individual' && targetChat.user.isBot && botChatSession) {
            setTypingIndicators(prev => ({ ...prev, [chatId]: true }));
            try {
                const botResponse = await sendMessageToBot(botChatSession, text);
                setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, botResponse] } : c));
            } finally {
                setTypingIndicators(prev => ({ ...prev, [chatId]: false }));
            }
        }
    }, [currentUser.id, currentUser.name, chats, replyToMessage, botChatSession, allUsersForProps, handleCancelReply]);

    const handleScheduleMessage = useCallback((chatId: string, text: string, scheduledFor: number, repeatInterval: RepeatInterval) => {
        const newMessage: Message = {
            id: self.crypto.randomUUID(),
            text: btoa(unescape(encodeURIComponent(text))),
            timestamp: '', // Set when sent
            senderId: currentUser.id,
            status: 'sent',
            sentAt: 0, // Set when sent
            type: 'user',
            scheduledFor,
            repeatInterval
        };

        setChats(prev => prev.map(c => {
            if (c.id === chatId) {
                return {
                    ...c,
                    scheduledMessages: [...(c.scheduledMessages || []), newMessage]
                };
            }
            return c;
        }));
        alert("Message scheduled!");
    }, [currentUser.id]);

    const handleSendMedia = useCallback((chatId: string, media: Media) => {
        const targetChat = chats.find(c => c.id === chatId);
        if (!targetChat) return;

        const now = Date.now();
        const newMessage: Message = {
            id: self.crypto.randomUUID(),
            text: "",
            media,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderId: currentUser.id,
            status: 'sent',
            sentAt: now,
            type: 'user',
            disappearsAt: targetChat.disappearingMessagesTimer ? now + targetChat.disappearingMessagesTimer : undefined,
             replyTo: replyToMessage ? { 
                messageId: replyToMessage.id, 
                senderName: allUsersForProps.find(u => u.id === replyToMessage.senderId)?.name || '', 
                text: replyToMessage.text ? btoa(unescape(encodeURIComponent(replyToMessage.text))) : undefined, 
                media: replyToMessage.media 
            } : undefined,
            isVanish: targetChat.isVanishMode
        };
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, newMessage] } : c));
        handleCancelReply();
    }, [currentUser.id, chats, replyToMessage, allUsersForProps, handleCancelReply]);

    const handleSendEvent = useCallback((chatId: string, event: CalendarEvent) => {
        const targetChat = chats.find(c => c.id === chatId);
        if (!targetChat) return;

        const now = Date.now();
        const newMessage: Message = {
            id: self.crypto.randomUUID(),
            event,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderId: currentUser.id,
            status: 'sent',
            sentAt: now,
            type: 'user',
             disappearsAt: targetChat.disappearingMessagesTimer ? now + targetChat.disappearingMessagesTimer : undefined,
             isVanish: targetChat.isVanishMode
        };
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, newMessage] } : c));
    }, [currentUser.id, chats]);

    const handleAiGenerate = useCallback(async (chatId: string, prompt: string, mode: 'ask' | 'art') => {
        setTypingIndicators(prev => ({ ...prev, [chatId]: true }));
        try {
            if (mode === 'ask' && botChatSession) {
                const botResponse = await sendMessageToBot(botChatSession, prompt);
                setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, botResponse] } : c));
            } else if (mode === 'art') {
                const base64Image = await generateImageFromPrompt(prompt);
                if (base64Image) {
                    handleSendMedia(chatId, { type: 'image', url: `data:image/png;base64,${base64Image}` });
                } else {
                    throw new Error("Image generation returned null.");
                }
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
            const errorMessage: Message = {
                id: self.crypto.randomUUID(),
                text: btoa(unescape(encodeURIComponent("Sorry, I couldn't generate that. Please try again."))),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                senderId: 'kuik-bot',
                isBot: true,
                sentAt: Date.now(),
                type: 'user',
            };
            setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, errorMessage] } : c));
        } finally {
            setTypingIndicators(prev => ({ ...prev, [chatId]: false }));
        }
    }, [botChatSession, handleSendMedia]);

    const handleTranscribeAudio = useCallback(async (chatId: string, message: Message) => {
        if (!message.media || message.media.type !== 'audio' || !message.media.url) return;
        
        try {
            const response = await fetch(message.media.url);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = (reader.result as string).split(',')[1];
                const transcript = await generateAudioTranscript(base64data);
                
                setChats(prev => prev.map(chat => {
                    if (chat.id === chatId) {
                        return {
                            ...chat,
                            messages: chat.messages.map(m => {
                                if (m.id === message.id) {
                                    return { ...m, transcript };
                                }
                                return m;
                            })
                        };
                    }
                    return chat;
                }));
            };
        } catch (error) {
            console.error("Transcription failed:", error);
            alert("Failed to transcribe audio.");
        }
    }, []);

    const handleDeleteMessage = useCallback((chatId: string, messageId: string) => {
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: c.messages.filter(m => m.id !== messageId) } : c));
    }, []);
    
    const handleUpdateProfile = useCallback((newName: string, newAvatar: string, about: string, aboutDuration: number, profileColor: string) => {
        const aboutExpiresAt = aboutDuration > 0 ? Date.now() + aboutDuration : undefined;
        const updatedUser = { 
            ...currentUser, 
            name: newName, 
            avatar: newAvatar,
            about,
            aboutExpiresAt,
            profileColor
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('kuikchat_profile', JSON.stringify(updatedUser));
    }, [currentUser]);

    const handleReaction = useCallback((chatId: string, messageId: string, emoji: string) => {
      setChats(prevChats => 
          prevChats.map(chat => {
              if (chat.id === chatId) {
                  return {
                      ...chat,
                      messages: chat.messages.map(message => {
                          if (message.id === messageId) {
                              const newReactions = { ...(message.reactions || {}) };
                              const usersForEmoji = newReactions[emoji] || [];
                              if (usersForEmoji.includes(currentUser.id)) {
                                  newReactions[emoji] = usersForEmoji.filter(id => id !== currentUser.id);
                                  if (newReactions[emoji].length === 0) {
                                      delete newReactions[emoji];
                                  }
                              } else {
                                  newReactions[emoji] = [...usersForEmoji, currentUser.id];
                              }
                              return { ...message, reactions: newReactions };
                          }
                          return message;
                      })
                  };
              }
              return chat;
          })
      );
    }, [currentUser.id]);

    const handleCreateGroup = useCallback((participants: User[], groupName: string) => {
        const newGroupChat: GroupChat = {
            id: self.crypto.randomUUID(),
            type: 'group',
            name: groupName,
            avatar: `https://i.pravatar.cc/150?u=${self.crypto.randomUUID()}`,
            participants: [currentUser, ...participants],
            admins: [currentUser.id],
            permissions: { sendMessages: 'all', editInfo: 'all' },
            messages: [{
                id: self.crypto.randomUUID(),
                type: 'system',
                text: btoa(unescape(encodeURIComponent(`${currentUser.name} created the group "${groupName}"`))),
                senderId: 'system',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sentAt: Date.now()
            }],
        };
        setChats(prev => [newGroupChat, ...prev]);
        setModalView('none');
        setActiveChatId(newGroupChat.id);
    }, [currentUser]);

    const handleStartCall = useCallback((chatId: string, type: 'voice' | 'video') => {
        const targetChat = chats.find(c => c.id === chatId);
        if (!targetChat) return;

        const callMessage: Message = {
            id: self.crypto.randomUUID(),
            type: 'system',
            text: btoa(unescape(encodeURIComponent(`${type === 'video' ? 'Video call started' : 'Voice call started'}`))),
            senderId: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sentAt: Date.now()
        };
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, callMessage] } : c));
        
        const participants = targetChat.type === 'individual' ? [currentUser, targetChat.user] : (targetChat as GroupChat).participants;
        setActiveCall({ chatId, participants });
    }, [chats, currentUser]);

    const handleVerifyContact = useCallback((userId: string) => {
      setAllContactUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
      setChats(prev => prev.map(c => {
        if (c.type === 'individual' && c.user.id === userId) {
          return { ...c, user: { ...c.user, isVerified: true } };
        }
        return c;
      }));
      alert(t('app.contactVerifiedAlert'));
    }, [t]);

    const handleForwardMessage = useCallback((message: Message) => {
        setMessageToForward(message);
        setModalView('forward_message');
    }, []);

    const completeForward = useCallback((targetChatId: string) => {
        if (!messageToForward) return;

        if (messageToForward.text) {
             handleSendMessage(targetChatId, messageToForward.text);
        }
        
        if (messageToForward.media) {
            handleSendMedia(targetChatId, messageToForward.media);
        }

        setMessageToForward(null);
        setModalView('none');
        setActiveChatId(targetChatId);
    }, [messageToForward, handleSendMessage, handleSendMedia]);

    const handlePinMessage = useCallback((chatId: string, messageId: string) => {
        setChats(prev => prev.map(c => {
            if (c.id === chatId) {
                const currentPins = c.pinnedMessages || [];
                if (currentPins.length >= 3) {
                    alert("You can only pin up to 3 messages.");
                    return c;
                }
                if (!currentPins.includes(messageId)) {
                    return { ...c, pinnedMessages: [...currentPins, messageId] };
                }
            }
            return c;
        }));
    }, []);

    const handleUnpinMessage = useCallback((chatId: string, messageId: string) => {
        setChats(prev => prev.map(c => {
            if (c.id === chatId && c.pinnedMessages) {
                return { ...c, pinnedMessages: c.pinnedMessages.filter(id => id !== messageId) };
            }
            return c;
        }));
    }, []);

    const handleToggleVanishMode = useCallback((chatId: string) => {
        setChats(prev => prev.map(c => {
            if (c.id === chatId) {
                if (c.isVanishMode) {
                    return {
                        ...c,
                        isVanishMode: false,
                        messages: c.messages.filter(m => !m.isVanish)
                    };
                }
                return { ...c, isVanishMode: true };
            }
            return c;
        }));
    }, []);

    const handleChangeTheme = useCallback((chatId: string, theme: string) => {
        setChats(prev => prev.map(c => {
            if (c.id === chatId) {
                return { ...c, theme };
            }
            return c;
        }));
    }, []);

    const handleScreenshot = useCallback((chatId: string) => {
        const systemMsg: Message = {
            id: self.crypto.randomUUID(),
            type: 'system',
            text: btoa(unescape(encodeURIComponent(t('chatWindow.screenshotDetected', { user: currentUser.name })))),
            senderId: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sentAt: Date.now(),
            isVanish: true 
        };
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, systemMsg] } : c));
    }, [currentUser.name, t]);

    // --- SETTINGS ACTIONS IMPLEMENTATION ---

    const handleBackup = useCallback(() => {
        try {
            const data = JSON.stringify(chats);
            localStorage.setItem('kuikchat_backup', data);
            const timestamp = new Date().toISOString();
            localStorage.setItem('kuikchat_backup_timestamp', timestamp);
            setLastBackupTimestamp(timestamp);
            alert(t('settings.backupSuccess'));
        } catch (e) {
            console.error(e);
            alert(t('settings.backupFail'));
        }
    }, [chats, t]);

    const handleRestore = useCallback(() => {
        if (window.confirm(t('settings.restoreConfirm'))) {
            try {
                const data = localStorage.getItem('kuikchat_backup');
                if (data) {
                    setChats(JSON.parse(data));
                    alert(t('settings.restoreSuccess'));
                } else {
                    alert(t('settings.restoreNoBackup'));
                }
            } catch (e) {
                console.error(e);
                alert(t('settings.restoreFail'));
            }
        }
    }, [t]);

    const handleResetHiddenChats = useCallback(() => {
        if (window.confirm(t('hiddenChats.resetWarning'))) {
            setChats(prev => prev.map(c => ({ ...c, isHidden: false })));
            setHiddenChatsPassword(null);
            localStorage.removeItem('kuikchat_hidden_password');
            alert("Hidden chats reset and visible.");
        }
    }, [t]);

    const handleSetDefaultTimer = useCallback((duration: number) => {
        setDefaultDisappearingTimer(duration);
        localStorage.setItem('kuikchat_default_timer', duration.toString());
    }, []);
    
    const handleSetWallpaper = useCallback((url: string) => {
        setChatWallpaper(url);
        localStorage.setItem('kuikchat_wallpaper', url);
    }, []);

    if (showLanding) {
        return <Home onLogin={handleLogin} />;
    }

    const activeChat = chats.find(c => c.id === activeChatId);
    const viewingGroupInfo = chats.find(c => c.id === viewingGroupInfoId) as GroupChat | undefined;
    const isTyping = activeChat ? typingIndicators[activeChat.id] || false : false;

    if (!currentUser) {
        return <div className="flex items-center justify-center h-screen w-screen bg-gray-100 dark:bg-kuik-dark-bg">Could not load user data.</div>;
    }

    return (
        <>
            {/* Outer Background - Standard Web App Feel with Landing Page Gradient */}
            <div className="h-[100dvh] w-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] flex flex-col md:items-center md:justify-center md:p-4 overflow-hidden">
                
                {/* Main App Container - Glassmorphism Applied */}
                <div className="w-full h-full md:h-[95vh] md:max-h-[95vh] md:max-w-[1600px] md:mx-auto bg-white/60 dark:bg-[#1e293b]/60 backdrop-blur-2xl md:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-white/30 dark:border-slate-700/50">
                    
                    {/* Sidebar (Icons Rail) - Mobile: Bottom, Desktop: Left */}
                    <div className="order-last md:order-first flex-shrink-0 z-30">
                        <AppSidebar 
                            activeView={activeView} 
                            setActiveView={setActiveView} 
                            onOpenSettings={() => setModalView('settings')}
                            isHiddenOnMobile={!!activeChatId}
                        />
                    </div>
                    
                    {/* List Panel (Contacts/Status/Communities) */}
                    <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[320px] lg:w-[400px] border-r border-white/20 dark:border-slate-700/30 bg-white/40 dark:bg-[#1e293b]/40 backdrop-blur-xl`}>
                        {activeView === 'chats' && (
                            <ContactList 
                                chats={chats} 
                                activeChatId={activeChatId} 
                                onSelectChat={handleSelectChat} 
                                onNewChat={() => setModalView('new_chat')}
                                hasHiddenChats={chats.some(c => c.isHidden)}
                                isHiddenChatsLocked={isHiddenChatsLocked}
                                onShowHiddenChatsPrompt={() => setPasswordPrompt({ mode: 'enter' })}
                                onToggleHideChat={() => {}}
                            />
                        )}
                        {activeView === 'status' && (
                            <StatusList 
                                statuses={statuses} 
                                onSelectStatus={setViewingStatus} 
                                onCreateStatus={() => setIsCreatingStatus(true)} 
                                currentUserId={currentUser.id} 
                            />
                        )}
                        {activeView === 'communities' && (
                            <CommunitiesView 
                                myCommunities={communities.filter(c => c.joined)}
                                discoverCommunities={communities.filter(c => !c.joined)}
                                onJoin={() => {}}
                            />
                        )}
                    </div>
                    
                    {/* Chat Window Area */}
                    <div className={`flex-1 flex flex-col h-full relative bg-transparent ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
                        {activeChatId ? (
                            <ChatWindow 
                                chat={activeChat} 
                                chatWallpaper={chatWallpaper}
                                onSendMessage={handleSendMessage} 
                                onSendMedia={handleSendMedia}
                                onAiGenerate={handleAiGenerate}
                                isTyping={isTyping}
                                onReaction={handleReaction}
                                onDeleteMessage={handleDeleteMessage}
                                currentUser={currentUser}
                                allUsers={allUsersForProps}
                                onStartCall={handleStartCall}
                                onOpenGroupInfo={setViewingGroupInfoId}
                                onSetReplyTo={setReplyToMessage}
                                onCancelReply={handleCancelReply}
                                replyToMessage={replyToMessage}
                                onVerifyContact={handleVerifyContact}
                                onForwardMessage={handleForwardMessage}
                                onOpenEventCreator={() => setModalView('create_event')}
                                onOpenDocumentScanner={() => setModalView('scan_document')}
                                onOpenScheduleMessage={() => setModalView('schedule_message')}
                                onTranscribeAudio={handleTranscribeAudio}
                                onPinMessage={handlePinMessage}
                                onUnpinMessage={handleUnpinMessage}
                                onToggleVanishMode={handleToggleVanishMode}
                                onChangeTheme={handleChangeTheme}
                                onScreenshot={handleScreenshot}
                                onBack={() => setActiveChatId(null)}
                            />
                        ) : (
                            <div className="hidden md:flex w-full h-full">
                                {activeView === 'chats' && <div className="w-full h-full"><div className="flex-1 hidden md:flex flex-col h-full justify-center"><div className="relative flex flex-col items-center justify-center h-full text-center p-8"><h2 className="text-3xl font-light text-slate-700 dark:text-slate-200">{t('chatWindow.welcomeTitle')}</h2></div></div></div>}
                                {activeView === 'status' && <StatusPlaceholder />}
                                {activeView === 'communities' && <CommunityPlaceholder />}
                            </div>
                        )}
                    </div>

                </div>
            </div>
            
            {/* Add AuthDebugger component to help with Google OAuth testing */}
            <AuthDebugger />
            
            {viewingStatus && <StatusViewer userStatus={viewingStatus} onClose={() => setViewingStatus(null)} onReply={() => {}} />}
            {isCreatingStatus && <StatusCreator onCreateStatus={() => {}} onClose={() => setIsCreatingStatus(false)} />}
            
            {passwordPrompt.mode !== 'none' && (
                <PasswordPromptModal
                    mode={passwordPrompt.mode}
                    onClose={() => setPasswordPrompt({ mode: 'none'})}
                    onSubmit={() => {}}
                    error={passwordPrompt.error}
                />
            )}

            {modalView === 'settings' && (
                <SettingsView 
                    currentUser={currentUser}
                    isOpen={modalView === 'settings'}
                    onClose={() => setModalView('none')}
                    onBackup={handleBackup}
                    onRestore={handleRestore}
                    lastBackupTimestamp={lastBackupTimestamp}
                    onSetDefaultTimer={handleSetDefaultTimer}
                    defaultTimer={defaultDisappearingTimer}
                    hasHiddenChatsPassword={!!hiddenChatsPassword}
                    onChangePassword={() => { setModalView('none'); setPasswordPrompt({ mode: 'change' }); }}
                    onResetHiddenChats={handleResetHiddenChats}
                    onUpdateProfile={handleUpdateProfile}
                    onLogout={() => {
                        setModalView('none');
                        signOut();
                        setShowLanding(true);
                    }}
                    onSetWallpaper={handleSetWallpaper}
                    currentWallpaper={chatWallpaper}
                />
            )}
            {modalView === 'add_contact' && (
                <AddContactView
                    currentUser={currentUser}
                    onClose={() => setModalView('none')}
                    onScanSuccess={() => {}}
                />
            )}
            {modalView === 'new_chat' && (
                <NewChatView
                    onClose={() => setModalView('none')}
                    onNewGroup={() => setModalView('create_group')}
                    onNewContact={() => setModalView('add_contact')}
                />
            )}
            {modalView === 'create_group' && (
                <CreateGroupView
                    contacts={allContactUsers}
                    currentUser={currentUser}
                    onClose={() => setModalView('none')}
                    onCreateGroup={handleCreateGroup}
                />
            )}
            {modalView === 'forward_message' && (
                <ForwardModal
                    chats={chats.filter(c => !c.isHidden)} // Don't show hidden chats in forward list unless unlocked
                    onClose={() => setModalView('none')}
                    onForward={completeForward}
                />
            )}
            {modalView === 'create_event' && activeChatId && (
                <EventCreator 
                    onClose={() => setModalView('none')}
                    onSendEvent={(event) => handleSendEvent(activeChatId, event)}
                />
            )}
             {modalView === 'scan_document' && activeChatId && (
                <DocumentScanner 
                    onClose={() => setModalView('none')}
                    onSendDocument={(imageDataUrl) => {
                         handleSendMedia(activeChatId, {
                            type: 'image',
                            url: imageDataUrl,
                            fileName: `Scanned_Document_${new Date().getTime()}.jpg`,
                            fileSize: 'Unknown'
                        });
                    }}
                />
            )}
            {modalView === 'schedule_message' && activeChatId && (
                <ScheduleMessageModal
                    onClose={() => setModalView('none')}
                    onSchedule={(text, scheduledFor, repeatInterval) => handleScheduleMessage(activeChatId, text, scheduledFor, repeatInterval)}
                />
            )}

            {activeCall && (
                <VideoCallView 
                    callInfo={activeCall}
                    currentUser={currentUser}
                    onEndCall={() => setActiveCall(null)}
                />
            )}
            {viewingGroupInfo && (
                <GroupInfoView
                    groupChat={viewingGroupInfo}
                    currentUser={currentUser}
                    onClose={() => setViewingGroupInfoId(null)}
                    onPromote={() => {}}
                    onDemote={() => {}}
                    onRemove={() => {}}
                    onChangePermission={() => {}}
                />
            )}
        </>
    );
};

export default App;
