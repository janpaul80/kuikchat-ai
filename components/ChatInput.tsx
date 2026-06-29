


import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, MicrophoneIcon, EmojiIcon, PaperclipIcon, PhotoIcon, VideoCameraIcon, SparklesIcon, CloseIcon, PaintBrushIcon, DocumentIcon, CameraIcon, GifIcon, CalendarIcon, ScanIcon, VideoNoteIcon, TimerIcon, TextEffectIcon } from './icons';
import ExpressionPicker from './EmojiPicker';
import { Media, Message, User, TextEffect } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import CameraEffectModal from './CameraEffectModal';

type AiMode = 'none' | 'ask' | 'art';

interface ChatInputProps {
  onSendMessage: (message: string, effect?: TextEffect) => void;
  onSendMedia: (media: Media) => void;
  onStartVideoCall: () => void;
  // FIX: Correctly type AiMode for onAiGenerate to exclude 'none'
  onAiGenerate: (prompt: string, mode: 'ask' | 'art') => void;
  isSending: boolean;
  disabledReason?: string | null;
  replyToMessage: Message | null;
  onCancelReply: () => void;
  allUsers: User[];
  onOpenEventCreator: () => void;
  onOpenDocumentScanner: () => void;
  onOpenScheduleMessage: () => void;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

const EFFECT_OPTIONS: { id: TextEffect; label: string }[] = [
    { id: 'none', label: 'Normal' },
    { id: 'big', label: 'Big' },
    { id: 'small', label: 'Small' },
    { id: 'shake', label: 'Shake' },
    { id: 'nod', label: 'Nod' },
    { id: 'explode', label: 'Explode' },
    { id: 'ripple', label: 'Ripple' },
    { id: 'bloom', label: 'Bloom' },
    { id: 'jitter', label: 'Jitter' },
];

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onSendMedia, onStartVideoCall, onAiGenerate, isSending, disabledReason, replyToMessage, onCancelReply, allUsers, onOpenEventCreator, onOpenDocumentScanner, onOpenScheduleMessage }) => {
  const [message, setMessage] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isRecordingVideoNote, setIsRecordingVideoNote] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showExpressionPicker, setShowExpressionPicker] = useState(false);
  const [initialPickerTab, setInitialPickerTab] = useState<'emoji' | 'gif' | 'sticker'>('emoji');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEffectsMenu, setShowEffectsMenu] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<TextEffect>('none');
  const [aiMode, setAiMode] = useState<AiMode>('none');
  const [showCameraEffectModal, setShowCameraEffectModal] = useState(false);
  const { t } = useLanguage();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement>(null);
  const effectsMenuRef = useRef<HTMLDivElement>(null);
  const photoVideoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const isDisabled = isSending || !!disabledReason;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        attachmentMenuRef.current && !attachmentMenuRef.current.contains(target) &&
        attachmentButtonRef.current && !attachmentButtonRef.current.contains(target)
      ) {
        setShowAttachmentMenu(false);
      }
      if (effectsMenuRef.current && !effectsMenuRef.current.contains(target)) {
          setShowEffectsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
      if (isRecordingVideoNote && videoPreviewRef.current && videoStreamRef.current) {
          videoPreviewRef.current.srcObject = videoStreamRef.current;
      }
  }, [isRecordingVideoNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      if (aiMode !== 'none') {
        onAiGenerate(message.trim(), aiMode);
      } else {
        onSendMessage(message.trim(), selectedEffect === 'none' ? undefined : selectedEffect);
      }
      setMessage('');
      setShowExpressionPicker(false);
      setAiMode('none');
      setSelectedEffect('none');
    }
  };

  const handleStartRecording = async () => {
    if (isRecordingVoice || isDisabled) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            onSendMedia({
                type: 'audio',
                url: audioUrl,
            });

            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsRecordingVoice(true);
        setRecordingDuration(0);
        recordingTimerRef.current = window.setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);

    } catch (err) {
        console.error("Microphone access error:", err);
        alert("Microphone permission denied. Please enable it in your browser settings.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
        mediaRecorderRef.current.stop();
        setIsRecordingVoice(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleStartVideoNote = async () => {
      if (isRecordingVideoNote || isDisabled) return;
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          videoStreamRef.current = stream;
          mediaRecorderRef.current = new MediaRecorder(stream);
          videoChunksRef.current = [];

          mediaRecorderRef.current.ondataavailable = (event) => {
              videoChunksRef.current.push(event.data);
          };

          mediaRecorderRef.current.onstop = () => {
              const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
              const videoUrl = URL.createObjectURL(videoBlob);

              onSendMedia({
                  type: 'video_note',
                  url: videoUrl,
                  duration: `${recordingDuration}s`
              });

               if (videoStreamRef.current) {
                  videoStreamRef.current.getTracks().forEach(track => track.stop());
                  videoStreamRef.current = null;
              }
          };

          mediaRecorderRef.current.start();
          setIsRecordingVideoNote(true);
          setShowAttachmentMenu(false);
          setRecordingDuration(0);
          recordingTimerRef.current = window.setInterval(() => {
              setRecordingDuration(prev => {
                  if (prev >= 60) {
                      handleStopVideoNote();
                      return prev;
                  }
                  return prev + 1;
              });
          }, 1000);
      } catch (err) {
           console.error("Camera/Mic access error:", err);
           alert("Camera permission denied. Please enable it in your browser settings.");
      }
  };

  const handleStopVideoNote = () => {
       if (mediaRecorderRef.current && isRecordingVideoNote) {
           mediaRecorderRef.current.stop();
           setIsRecordingVideoNote(false);
           if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
       }
  };

  const handleCancelVideoNote = () => {
      if (mediaRecorderRef.current && isRecordingVideoNote) {
           mediaRecorderRef.current.onstop = () => {
               if (videoStreamRef.current) {
                  videoStreamRef.current.getTracks().forEach(track => track.stop());
                  videoStreamRef.current = null;
               }
           };
           mediaRecorderRef.current.stop();
           setIsRecordingVideoNote(false);
           if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      }
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
        alert(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
        return;
    }

    const fileUrl = URL.createObjectURL(file);
    let mediaType: 'image' | 'video' | 'document' = 'document';
    if (file.type.startsWith('image/')) mediaType = 'image';
    if (file.type.startsWith('video/')) mediaType = 'video';
    
    onSendMedia({
        type: mediaType,
        url: fileUrl,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
    });
    
    event.target.value = '';
  };

  const handleStartVideoCall = () => {
      onStartVideoCall();
      setShowAttachmentMenu(false);
  };

  const toggleAiMode = (mode: 'ask' | 'art') => {
    setAiMode(prev => (prev === mode ? 'none' : mode));
  };
  
  const handleEmojiButtonClick = () => {
    setInitialPickerTab('emoji');
    setShowExpressionPicker(p => !p);
  };

  const handleGifButtonClick = () => {
      setInitialPickerTab('gif');
      setShowExpressionPicker(true);
      setShowAttachmentMenu(false);
  };

  const getPlaceholderText = () => {
    if (disabledReason) return disabledReason;
    if (isSending) {
        if (aiMode === 'ask') return t('chatInput.thinking');
        if (aiMode === 'art') return t('chatInput.creating');
        return t('chatInput.placeholderSending');
    }
    if (isRecordingVoice) return `${t('chatInput.placeholderRecording')} ${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}`;
    if (aiMode === 'ask') return t('chatInput.placeholderAiAsk');
    if (aiMode === 'art') return t('chatInput.placeholderAiArt');
    return t('chatInput.placeholder');
  };

  const getReplyPreviewText = () => {
    if (!replyToMessage) return '';
    if (replyToMessage.text) {
        try {
            return decodeURIComponent(escape(atob(replyToMessage.text)));
        } catch {
            return replyToMessage.text;
        }
    }
    if (replyToMessage.media) return replyToMessage.media.fileName || replyToMessage.media.type.charAt(0).toUpperCase() + replyToMessage.media.type.slice(1);
    return '';
  }

  const showSendButton = message.trim().length > 0;
  const replySender = replyToMessage ? allUsers.find(u => u.id === replyToMessage.senderId) : null;

  return (
    <div className="bg-transparent p-3 relative z-20">
       <input type="file" ref={photoVideoInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
       <input type="file" ref={documentInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv" className="hidden" />
        
        {showCameraEffectModal && (
            <CameraEffectModal 
                onClose={() => setShowCameraEffectModal(false)}
                onCapture={(dataUrl) => {
                    onSendMedia({ type: 'image', url: dataUrl, fileName: `Effect_Cam_${Date.now()}.jpg` });
                }}
            />
        )}

        {isRecordingVideoNote && (
            <div className="absolute bottom-24 right-4 z-50 flex flex-col items-center gap-4 animate-fade-in">
                 <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-red-500 shadow-xl">
                     <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                     <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                         {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                     </div>
                 </div>
                 <div className="flex items-center gap-4">
                     <button onClick={handleCancelVideoNote} className="p-3 bg-white/80 backdrop-blur rounded-full text-red-500 shadow-md hover:bg-white">
                         <CloseIcon className="w-6 h-6" />
                     </button>
                     <button onClick={handleStopVideoNote} className="p-4 bg-kuik-accent rounded-full text-white shadow-md hover:bg-kuik-green transform hover:scale-110 transition-transform">
                         <SendIcon className="w-6 h-6" />
                     </button>
                 </div>
            </div>
        )}

        {replyToMessage && (
            <div className="mx-2 mb-2 p-3 rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-md border border-white/20 shadow-sm flex justify-between items-center animate-fade-in-fast">
                <div>
                    <p className="text-sm font-bold text-kuik-accent">Replying to {replySender?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs">{getReplyPreviewText()}</p>
                </div>
                <button onClick={onCancelReply} className="p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-white/10">
                    <CloseIcon className="w-4 h-4 text-gray-500 dark:text-gray-300"/>
                </button>
            </div>
        )}
       <div className="relative">
          {showExpressionPicker && (
            <ExpressionPicker 
              initialTab={initialPickerTab}
              onSelectEmoji={(emoji) => setMessage(prev => prev + emoji)}
              onSelectGif={(url) => onSendMedia({ type: 'gif', url })}
              onSelectSticker={(url) => onSendMedia({ type: 'sticker', url })}
              onClose={() => setShowExpressionPicker(false)}
            />
          )}
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1 flex items-center bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-3xl shadow-lg transition-all duration-300 hover:bg-white/80 dark:hover:bg-black/70">
                <button
                type="button"
                onClick={handleEmojiButtonClick}
                className="p-3 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors ml-1"
                aria-label="Toggle emoji picker"
                disabled={isDisabled}
                >
                <EmojiIcon className="w-6 h-6"/>
                </button>

                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={getPlaceholderText()}
                  className={`flex-1 w-full py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none ${aiMode !== 'none' ? 'pl-12' : ''} ${isRecordingVoice ? 'text-red-500' : ''}`}
                  disabled={isDisabled}
                />

                {aiMode !== 'none' && (
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 flex items-center space-x-1 bg-kuik-light-green/20 text-kuik-green dark:bg-kuik-light-green/30 dark:text-kuik-light-green text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        <SparklesIcon className="w-3 h-3"/>
                        <span>AI {aiMode === 'art' ? 'Art' : 'Ask'}</span>
                        <button type="button" onClick={() => setAiMode('none')} className="ml-1 -mr-1 hover:bg-black/10 rounded-full"><CloseIcon className="w-3 h-3"/></button>
                    </div>
                )}
                
                {selectedEffect !== 'none' && (
                    <div className="absolute right-44 md:right-56 top-1/2 -translate-y-1/2 flex items-center space-x-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">
                        <span>Fx: {selectedEffect}</span>
                        <button type="button" onClick={() => setSelectedEffect('none')} className="ml-1 -mr-1 hover:bg-black/10 rounded-full"><CloseIcon className="w-3 h-3"/></button>
                    </div>
                )}

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowEffectsMenu(p => !p)}
                        className={`p-3 rounded-full transition-colors ${selectedEffect !== 'none' ? 'text-purple-500 dark:text-purple-400' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/10'}`}
                        disabled={isDisabled}
                        title="Text Effects"
                    >
                        <TextEffectIcon className="w-6 h-6" />
                    </button>
                    {showEffectsMenu && (
                        <div ref={effectsMenuRef} className="absolute bottom-full mb-2 right-0 w-40 bg-white dark:bg-kuik-dark-panel rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-30 max-h-60 overflow-y-auto custom-scrollbar">
                            {EFFECT_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => { setSelectedEffect(opt.id); setShowEffectsMenu(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedEffect === opt.id ? 'bg-kuik-accent text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <button
                    type="button"
                    onClick={() => toggleAiMode('ask')}
                    className={`p-3 rounded-full transition-colors hidden sm:block ${
                        aiMode === 'ask'
                        ? 'text-kuik-light-green'
                        : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/10'
                    }`}
                    disabled={isDisabled}
                    title="Ask AI"
                >
                    <SparklesIcon className="w-5 h-5" />
                </button>

                <button
                    type="button"
                    onClick={() => toggleAiMode('art')}
                    className={`p-3 rounded-full transition-colors hidden sm:block ${
                        aiMode === 'art'
                        ? 'text-kuik-light-green'
                        : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/10'
                    }`}
                    disabled={isDisabled}
                    title="Generate Art"
                >
                    <PaintBrushIcon className="w-5 h-5" />
                </button>
                
                <div className="relative mr-1">
                    <button
                        ref={attachmentButtonRef}
                        type="button"
                        onClick={() => setShowAttachmentMenu(p => !p)}
                        className="p-3 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
                        disabled={isDisabled}
                    >
                        <PaperclipIcon className="w-6 h-6" />
                    </button>
                    {showAttachmentMenu && (
                        <div
                        ref={attachmentMenuRef}
                        className="absolute bottom-full right-0 mb-4 w-64 bg-white/80 dark:bg-black/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 z-50 p-3 animate-fade-in-up transform origin-bottom-right"
                        >
                         <div className="grid grid-cols-3 gap-2">
                             <button onClick={() => { onOpenEventCreator(); setShowAttachmentMenu(false); }} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all group">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full group-hover:scale-110 transition-transform">
                                    <CalendarIcon className="w-6 h-6 text-orange-500" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">Event</span>
                            </button>
                            <button onClick={() => { documentInputRef.current?.click(); setShowAttachmentMenu(false); }} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all group">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full group-hover:scale-110 transition-transform">
                                    <DocumentIcon className="w-6 h-6 text-indigo-500" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">File</span>
                            </button>
                            <button onClick={() => { photoVideoInputRef.current?.click(); setShowAttachmentMenu(false); }} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all group">
                                <div className="p-3 bg-pink-100 dark:bg-pink-900/50 rounded-full group-hover:scale-110 transition-transform">
                                    <PhotoIcon className="w-6 h-6 text-pink-500" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">Gallery</span>
                            </button>
                            <button onClick={() => { setShowCameraEffectModal(true); setShowAttachmentMenu(false); }} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all group">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full group-hover:scale-110 transition-transform">
                                    <CameraIcon className="w-6 h-6 text-blue-500" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">Camera</span>
                            </button>
                             <button onClick={handleStartVideoNote} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all group">
                                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full group-hover:scale-110 transition-transform">
                                    <VideoNoteIcon className="w-6 h-6 text-kuik-green" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">Video Note</span>
                            </button>
                             <button onClick={() => { onOpenDocumentScanner(); setShowAttachmentMenu(false); }} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all group">
                                <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-full group-hover:scale-110 transition-transform">
                                    <ScanIcon className="w-6 h-6 text-teal-500" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">Scan</span>
                            </button>
                             <button onClick={handleGifButtonClick} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all group">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full group-hover:scale-110 transition-transform">
                                    <GifIcon className="w-6 h-6 text-purple-500" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">GIF</span>
                            </button>
                             <button onClick={handleStartVideoCall} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all group">
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:scale-110 transition-transform">
                                    <VideoCameraIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">Call</span>
                            </button>
                             <button onClick={() => { onOpenScheduleMessage(); setShowAttachmentMenu(false); }} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-all group">
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-full group-hover:scale-110 transition-transform">
                                    <TimerIcon className="w-6 h-6 text-yellow-600" />
                                </div>
                                <span className="text-xs text-gray-700 dark:text-gray-300">Schedule</span>
                            </button>
                         </div>
                        </div>
                    )}
                </div>

            </div>
          
            {showSendButton ? (
                <button
                type="submit"
                className="bg-kuik-accent text-white p-3 rounded-full hover:bg-kuik-green transition-all shadow-lg hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0"
                disabled={isDisabled}
                aria-label={t('chatInput.sendMessage')}
                >
                {isSending ? (
                     <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : <SendIcon className="w-6 h-6" />}
                </button>
            ) : (
                <button
                    type="button"
                    onMouseDown={handleStartRecording}
                    onMouseUp={handleStopRecording}
                    onMouseLeave={handleStopRecording}
                    className={`${
                    isRecordingVoice ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-kuik-accent hover:bg-kuik-green'
                    } text-white p-3 rounded-full transition-all shadow-lg hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0`}
                    aria-label={isRecordingVoice ? 'Stop recording' : 'Start recording'}
                    disabled={isDisabled}
                >
                    <MicrophoneIcon className="w-6 h-6" />
                </button>
            )}
        </form>
      </div>
    </div>
  );
};

export default ChatInput;