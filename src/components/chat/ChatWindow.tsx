import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Mic, 
  Send,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Camera,
  MapPin,
  Calendar,
  Languages,
  Loader2,
  Scan,
  QrCode,
  Timer,
  Palette,
  Bot,
  PhoneCall,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation, SupportedLanguage } from "@/hooks/useTranslation";
import { VoiceRecorder, VoiceNotePlayer } from "./VoiceRecorder";
import { WallpaperPicker } from "./WallpaperPicker";
import { VideoCallModal } from "./VideoCallModal";
import { EventCreator, CalendarEvent } from "./EventCreator";
import { DocumentScanner } from "./DocumentScanner";
import { QRCodeScanner } from "./QRCodeScanner";
import { VerifiedBadge, VerificationType } from "./VerifiedBadge";
import { EncryptionBanner, EncryptionIndicator } from "./EncryptionBanner";
import { DisappearingMessagesSettings, DisappearingDuration } from "./DisappearingMessagesSettings";
import { ScreenshotAlert } from "./ScreenshotAlert";
import { MessageContextMenu } from "./MessageContextMenu";
import { ScheduleMessageDialog, RepeatType } from "./ScheduleMessageDialog";
import { ReplyBubble } from "./ReplyBubble";
import { AskAIDialog } from "./AskAIDialog";
import { AIArtStudio } from "./AIArtStudio";
import { MultimodalAICall } from "./MultimodalAICall";
import { useToast } from "@/hooks/use-toast";
import { EmojiPicker } from "./EmojiPicker";
import { cn } from "@/lib/utils";

export interface ChatContact {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  avatar_url?: string | null;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  about: string;
  verified?: VerificationType;
}

interface ChatWindowProps {
  contact: ChatContact;
  onBack: () => void;
  wallpaper?: string;
  onWallpaperChange?: (wallpaper: string) => void;
}

const attachmentOptions = [
  { icon: ImageIcon, label: "Photo & Video", color: "from-purple-500 to-pink-500", action: "photo" },
  { icon: Scan, label: "Document Scan", color: "from-blue-500 to-cyan-500", action: "scan" },
  { icon: Calendar, label: "Event", color: "from-orange-500 to-amber-500", action: "event" },
  { icon: MapPin, label: "Location", color: "from-green-500 to-emerald-500", action: "location" },
  { icon: QrCode, label: "QR Code", color: "from-pink-500 to-rose-500", action: "qr" },
  { icon: Palette, label: "AI Art", color: "from-primary to-secondary", action: "ai-art" },
  { icon: Bot, label: "Ask AI", color: "from-violet-500 to-purple-500", action: "ask-ai" },
  { icon: PhoneCall, label: "AI Call", color: "from-cyan-500 to-blue-500", action: "ai-call" },
];

export const ChatWindow = ({ contact, onBack, wallpaper = "transparent", onWallpaperChange }: ChatWindowProps) => {
  const [messageText, setMessageText] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<<RecordRecord<<stringstring, string>>({});
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(true);
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [showDocScanner, setShowDocScanner] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [events, setEvents] = useState<<CalendarCalendarEvent[]>([]);
  const [disappearingDuration, setDisappearingDuration] = useState<<DisDisappearingDuration>("off");
  const [showEncryptionBanner, setShowEncryptionBanner] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; sender: string } | null>(null);
  const [showAskAI, setShowAskAI] = useState(false);
  const [showAIArt, setShowAIArt] = useState(false);
  const [showAICall, setShowAICall] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<<NodeNodeJS.Timeout | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<<RecordRecord<<stringstring, { url: string; duration: number }>({}); 
  const messagesEndRef = useRef<<HTMLHTMLDivElement>(null);
  const messageRefs = useRef<<RecordRecord<<stringstring, HTMLDivElement | null>>({});
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead } = useMessages(contact.user_id);
  const { translateText } = useTranslation();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, events]);

  useEffect(() => {
    markAsRead();
  }, [contact.user_id]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    await sendMessage(messageText);
    setMessageText("");
    setShowAttachments(false);
  };

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    setShowVoiceRecorder(false);
    const audioUrl = URL.createObjectURL(audioBlob);
    const voiceId = `voice-${Date.now()}`;
    
    setVoiceNotes(prev => ({
      ...prev,
      [voiceId]: { url: audioUrl, duration }
    }));
    
    await sendMessage(`[VOICE:${voiceId}:${duration}]`);
  };

  const handleTranslate = async (messageId: string, text: string, targetLanguage: SupportedLanguage) => {
    const translated = await translateText(text, targetLanguage);
    if (translated) {
      setTranslatedMessages(prev => ({ ...prev, [messageId]: translated }));
    }
  };

  const handleVideoCall = () => {
    setIsVideoCall(true);
    setShowVideoCall(true);
  };

  const handleVoiceCall = () => {
    setIsVideoCall(false);
    setShowVideoCall(true);
  };

  const handleSendEvent = async (event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
    await sendMessage(`📅 Event: ${event.title} on ${event.date}${event.time ? ` at ${event.time}` : ""}${event.location ? ` - ${event.location}` : ""}`);
  };

  const handleScanDocument = async (imageData: string) => {
    await sendMessage(`📄 Scanned document attached`);
  };

  const handleAttachmentAction = async (action: string) => {
    setShowAttachments(false);
    switch (action) {
      case "photo":
        const photoInput = document.createElement('input');
        photoInput.type = 'file';
        photoInput.accept = 'image/*,video/*';
        photoInput.multiple = true;
        photoInput.onchange = async (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            for (const file of Array.from(files)) {
              const isVideo = file.type.startsWith('video/');
              toast({
                title: isVideo ? "Video attached" : "Photo attached",
                description: `${file.name} ready to send`,
              });
              await sendMessage(`${isVideo ? '🎬' : '📷'} ${file.name}`);
            }
          }
        };
        photoInput.click();
        break;
      case "location":
        if ('geolocation' in navigator) {
          toast({ title: "Getting location...", description: "Please allow location access" });
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
              await sendMessage(`📍 Location: ${locationUrl}`);
              toast({ title: "Location shared", description: "Your location has been sent" });
            },
            (error) => {
              toast({ title: "Location error", description: "Could not get your location. Please enable location services.", variant: "destructive" });
            }
          );
        } else {
          toast({ title: "Not supported", description: "Location is not supported in your browser", variant: "destructive" });
        }
        break;
      case "event":
        setShowEventCreator(true);
        break;
      case "scan":
        setShowDocScanner(true);
        break;
      case "qr":
        setShowQRScanner(true);
        break;
      case "ai-art":
        setShowAIArt(true);
        break;
      case "ask-ai":
        setShowAskAI(true);
        break;
      case "ai-call":
        setShowAICall(true);
        break;
      default:
        break;
    }
  };

  const handleReply = (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      const senderName = msg.sender_id === user?.id ? "You" : contact.name;
      setReplyingTo({ id: messageId, content: msg.content, sender: senderName });
    }
  };

  const handleScheduleMessage = (scheduledAt: Date, repeatType: RepeatType) => {
    toast({
      title: "Message Scheduled",
      description: `Your message will be sent ${repeatType === "once" ? "on" : "starting"} ${scheduledAt.toLocaleString()}`,
    });
    setMessageText("");
  };

  const handleSendButtonDown = () => {
    const timer = setTimeout(() => {
      if (messageText.trim()) {
        setShowScheduleDialog(true);
      }
    }, 500);
    setLongPressTimer(timer);
  };

  const handleSendButtonUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleAIArtSend = async (imageUrl: string, prompt: string) => {
    await sendMessage(`🎨 AI Art: "${prompt}"\n${imageUrl}`);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getWallpaperStyle = () => {
    if (!wallpaper || wallpaper === "transparent") return {};
    if (wallpaper.startsWith("http") || wallpaper.startsWith("data:")) {
      return {
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return { backgroundColor: wallpaper };
  };

  return (
    <<divdiv className="flex flex-col h-full bg-gradient-to-b from-muted/20 to-background">
      {/* Header */}
      <<divdiv className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <<divdiv className="flex items-center gap-3">
          <<ButtonButton variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
            <<ArrowArrowLeft className="w-5 h-5" />
          </Button>
          <<divdiv className="relative">
            <<divdiv className={`w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-semibold ${
              contact.id === "ai" ? "brand-gradient" : "bg-muted-foreground/20 text-foreground"
            }`}>
              {contact.avatar_url ? (
                <<imgimg src={contact.avatar_url} alt={contact.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                contact.avatar
              )}
            </div>
            {contact.online && (
              <<divdiv className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-card" />
            )}
          </div>
          <<divdiv>
            <<divdiv className="flex items-center gap-1">
              <<hh2 className="font-semibold">{contact.name}</h2>
              {contact.verified && <<VerifiedVerifiedBadge type={contact.verified} size="sm" />}
            </div>
            <<divdiv className="flex items-center gap-2">
              <<pp className="text-xs text-muted-foreground">
                {contact.online ? "Online" : "Last seen recently"}
              </p>
              <<EncryptionEncryptionIndicator />
              {disappearingDuration !== "off" && (
                <<DisDisappearingMessageIndicator duration={disappearingDuration} />
              )}
            </div>
          </div>
        </div>
        <<divdiv className="flex items-center gap-1">
          <<ButtonButton variant="ghost" size="icon" className="rounded-full" onClick={handleVoiceCall}>
            <<PhonePhone className="w-5 h-5" />
          </Button>
          <<ButtonButton variant="ghost" size="icon" className="rounded-full" onClick={handleVideoCall}>
            <<VideoVideo className="w-5 h-5" />
          </Button>
          <<DropdownDropdownMenu>
            <<DropdownDropdownMenuTrigger asChild>
              <<ButtonButton variant="ghost" size="icon" className="rounded-full">
                <<MoreMoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <<DropdownDropdownMenuContent align="end">
              {onWallpaperChange && (
                <<WallpaperWallpaperPicker
                  currentWallpaper={wallpaper}
                  onWallpaperChange={onWallpaperChange}
                  trigger={
                    <<DropdownDropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <<ImageIconImageIcon className="w-4 h-4 mr-2" />
                      Change Wallpaper
                    </DropdownMenuItem>
                  }
                />
              )}
              <<DropdownDropdownMenuSeparator />
              <<DisDisappearingMessagesSettings
                currentDuration={disappearingDuration}
                onDurationChange={setDisappearingDuration}
                trigger={
                  <<DropdownDropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <<TimerTimer className="w-4 h-4 mr-2" />
                    Disappearing Messages
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Encryption Banner */}
      {showEncryptionBanner && (
        <<EncryptionEncryptionBanner contactName={contact.name} />
      )}

      {/* Screenshot Alert */}
      <<ScreenshotScreenshotAlert chatId={contact.id} contactName={contact.name} />

      {/* Messages */}
      <<divdiv 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={getWallpaperStyle()}
      >
        {messages.length === 0 ? (
          <<divdiv className="flex-1 flex items-center justify-center h-full">
            <<pp className="text-muted-foreground bg-background/80 px-4 py-2 rounded-lg">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.sender_id === user?.id;
            return (
              <<motionmotion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                {!isOwnMessage && (
                  <<divdiv className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-muted-foreground/20 flex items-center justify-center text-xs font-semibold">
                    {contact.avatar}
                  </div>
                )}
                
                <<MessageMessageContextMenu
                  messageId={msg.id}
                  messageContent={msg.content}
                  isOwnMessage={isOwnMessage}
                  onTranslate={(id, content, lang) => handleTranslate(id, content, lang)}
                  onReply={handleReply}
                >
                  <<divdiv 
                    ref={el => messageRefs.current[msg.id] = el}
                    className={`max-w-[75%] sm:max-w-[65%] ${
                      isOwnMessage 
                        ? "brand-gradient text-primary-foreground rounded-2xl rounded-tr-none" 
                        : "glass rounded-2xl rounded-tl-none"
                    } px-4 py-3 group relative cursor-pointer transition-all`}
                  >
                    {msg.content.startsWith("[VOICE:") ? (
                      (() => {
                        const match = msg.content.match(/\[VOICE:(voice-\d+):(\d+)\]/);
                        if (match) {
                          const voiceId = match[1];
                          const duration = parseInt(match[2], 10);
                          const voiceNote = voiceNotes[voiceId];
                          
                          return voiceNote ? (
                            <<VoiceVoiceNotePlayer audioUrl={voiceNote.url} duration={voiceNote.duration} />
                          ) : (
                            <<divdiv className="flex items-center gap-2 py-1">
                              <<divdiv className={`w-8 h-8 rounded-full flex items-center justify-center ${isOwnMessage ? "bg-primary-foreground/20" : "bg-primary/20"}`}>
                                <<MicMic className={`w-4 h-4 ${isOwnMessage ? "text-primary-foreground" : "text-primary"}`} />
                              </div>
                              <<divdiv className="flex-1">
                                <<divdiv className={`h-1 rounded-full ${isOwnMessage ? "bg-primary-foreground/30" : "bg-muted"}`} />
                              </div>
                              <<spanspan className={`text-xs font-mono ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {msg.content.match(/\(([^)]+)\)/)?.[1] || "0:00"}
                              </span>
                            </div>
                          );
                        }
                        return <<pp className="text-sm">{msg.content}</p>;
                      })()
                    ) : (
                      <<pp className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                    
                    {translatedMessages[msg.id] && (
                      <<divdiv className="mt-2 pt-2 border-t border-white/20">
                        <<pp className="text-xs opacity-70 mb-1">Translation:</p>
                        <<pp className="text-sm whitespace-pre-wrap">{translatedMessages[msg.id]}</p>
                      </div>
                    )}
                    
                    <<divdiv className="flex items-center justify-between mt-1">
                      <<pp className={`text-xs ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </MessageContextMenu>
                
                {isOwnMessage && (
                  <<divdiv className="w-8 h-8 rounded-full shrink-0 overflow-hidden brand-gradient flex items-center justify-center">
                    <<spanspan className="text-xs font-semibold text-primary-foreground">You</span>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
        <<divdiv ref={messagesEndRef} />
      </div>

      {/* Attachment Menu */}
      <<AnAnimatePresence>
        {showAttachments && (
          <<motionmotion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 pb-2"
          >
            <<divdiv className="glass rounded-2xl p-4">
              <<divdiv className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {attachmentOptions.map((option, index) => (
                  <<motionmotion.button
                    key={option.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2"
                    onClick={() => handleAttachmentAction(option.action)}
                  >
                    <<divdiv className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg`}>
                      <<optionoption.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <<spanspan className="text-xs text-muted-foreground">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recorder */}
      <<AnAnimatePresence>
        {showVoiceRecorder && (
          <<divdiv className="px-4 pb-2">
            <<VoiceVoiceRecorder
              onSend={handleVoiceSend}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      {!showVoiceRecorder && (
        <<divdiv className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
          {/* Reply Preview */}
          <<AnAnimatePresence>
            {replyingTo && (
              <<divdiv className="mb-2">
                <<ReplyReplyBubble
                  replyToContent={replyingTo.content}
                  replyToSender={replyingTo.sender}
                  onClear={() => setReplyingTo(null)}
                />
              </div>
            )}
          </AnimatePresence>
          
          <<divdiv className="flex items-center gap-2">
            <<ButtonButton 
              variant="ghost" 
              size="icon" 
              className="rounded-full shrink-0"
              onClick={() => setShowAttachments(!showAttachments)}
            >
              <<PaperPaperclip className={`w-5 h-5 transition-transform ${showAttachments ? 'rotate-45' : ''}`} />
            </Button>
            <<divdiv className="flex-1 relative">
              <<InputInput
                placeholder="Type a message..."
                className="pr-10 bg-muted/50 border-none rounded-full"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              />
              <<EmojiEmojiPicker
                onEmojiSelect={(emoji) => setMessageText(prev => prev + emoji)}
                trigger={
                  <<ButtonButton 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
                  >
                    <<SmileSmile className="w-5 h-5" />
                  </Button>
                }
              />
            </div>
            {messageText.trim() ? (
              <<ButtonButton 
                variant="default" 
                size="icon" 
                className="rounded-full shrink-0 brand-gradient"
                onClick={handleSend}
                onMouseDown={handleSendButtonDown}
                onMouseUp={handleSendButtonUp}
                onTouchStart={handleSendButtonDown}
                onTouchEnd={handleSendButtonUp}
                title="Hold to schedule"
              >
                <<SendSend className="w-5 h-5" />
              </Button>
            ) : (
              <<ButtonButton 
                variant="ghost" 
                size="icon" 
                className="rounded-full shrink-0"
                onClick={() => setShowVoiceRecorder(true)}
              >
                <<MicMic className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <<VideoVideoCallModal
        open={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        contact={{ ...contact, user_id: contact.user_id }}
        isVideoCall={isVideoCall}
      />
      <<EventEventCreator
        open={showEventCreator}
        onClose={() => setShowEventCreator(false)}
        onSendEvent={handleSendEvent}
      />
      <<DocumentDocumentScanner
        open={showDocScanner}
        onClose={() => setShowDocScanner(false)}
        onScan={handleScanDocument}
      />
      <<QRCodeQRCodeScanner
        open={showQRScanner}
        onClose={() => setShowQRScanner(false)}
      />
      <<ScheduleScheduleMessageDialog
        open={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        onSchedule={handleScheduleMessage}
        messagePreview={messageText}
      />
      <<AskAskAIDialog
        open={showAskAI}
        onClose={() => setShowAskAI(false)}
        onInsert={(text) => setMessageText(text)}
      />
      <<AIAIArtStudio
        open={showAIArt}
        onClose={() => setShowAIArt(false)}
        onSendImage={handleAIArtSend}
      />
      <<MultMultimodalAICall
        open={showAICall}
        onClose={() => setShowAICall(false)}
      />
    </div>
  );
};
