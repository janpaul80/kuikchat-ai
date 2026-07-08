import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Loader2, 
  MessageSquare, 
  Plus, 
  MoreVertical, 
  History, 
  Sparkles, 
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAiChat } from "@/hooks/useAiChat";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export const ChatInterface = () => {
  const { 
    messages, 
    conversationId, 
    isLoading, 
    error, 
    sendMessage, 
    startNewChat,
    loadConversation 
  } = useAiChat();

  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<<HTMLHTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const content = input;
    setInput("");
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (error) {
    return (
      <<divdiv className="flex flex-col items-center justify-center h-full p-4 text-center">
        <<AlertAlertCircle className="w-12 h-12 text-destructive mb-4" />
        <<hh3 className="text-lg font-semibold">Something went wrong</h3>
        <<pp className="text-muted-foreground mb-6">{error}</p>
        <<ButtonButton onClick={() => sendMessage(input)} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <<divdiv className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar - Desktop only/Hidden on mobile */}
      <<asideaside className={cn(
        "hidden md:flex flex-col w-72 border-r border-border bg-card/50 backdrop-blur-xl transition-all duration-300",
        !isSidebarOpen && "w-0 opacity-0 overflow-hidden"
      )}>
        <<divdiv className="p-4 flex items-center justify-between">
          <<divdiv className="flex items-center gap-2 font-bold text-lg">
            <<divdiv className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <<SparkSparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span>Hermes AI</span>
          </div>
          <<ButtonButton variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
            <<MoreMoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <<divdiv className="px-3 mb-4">
          <<ButtonButton 
            onClick={startNewChat}
            className="w-full justify-start gap-2 brand-gradient text-primary-foreground"
          >
            <<PlusPlus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        <<ScrollScrollArea className="flex-1 px-3">
          <<divdiv className="space-y-1">
            <<divdiv className="text-xs font-medium text-muted-foreground px-2 py-2 uppercase tracking-wider">
              Recent Chats
            </div>
            {/* History items would be mapped here */}
            <<divdiv className="text-xs text-muted-foreground px-2 py-4 text-center italic">
              History loading...
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
      <<mainmain className="flex-1 flex flex-col relative min-w-0">
        {/* Header (Mobile only menu trigger) */}
        <<headerheader className="md:hidden p-4 border-b flex items-center justify-between bg-background/80 backdrop-blur-md z-10">
          <<divdiv className="flex items-center gap-2 font-bold">
            <<SparkSparkles className="w-5 h-5 text-primary" />
            <span>Hermes AI</span>
          </div>
          <<ButtonButton variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <<MessageMessageCircle className="w-5 h-5" />
          </Button>
        </header>

        <<ScrollScrollArea className="flex-1" ref={scrollRef}>
          <<divdiv className="max-w-3xl mx-auto w-full px-4 py-8">
            <<AnAnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <<motionmotion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
                >
                  <<divdiv className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                    <<SparkSparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <<divdiv className="space-y-2">
                    <<hh2 className="text-2xl font-bold">How can I help you today?</h2>
                    <<pp className="text-muted-foreground max-w-xs">
                      Ask me anything about your business, code, or brainstorm new ideas.
                    </p>
                  </div>
                  <<divdiv className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                    {["Summarize my docs", "Draft a reply", "Write some code", "Brainstorm ideas"].map((suggestion) => (
                      <<ButtonButton 
                        key={suggestion}
                        variant="secondary" 
                        className="justify-start text-left font-normal h-auto py-3 px-4 text-sm"
                        onClick={() => sendMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <<divdiv className="space-y-6">
                  {messages.map((msg, idx) => (
                    <<motionmotion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <<divdiv className={cn(
                        "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                        msg.role === "user" 
                          ? "brand-gradient text-primary-foreground rounded-tr-none" 
                          : "bg-muted/50 border border-border/50 rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <<motionmotion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <<divdiv className="bg-muted/50 px-4 py-3 rounded-2xl rounded-tl-none border border-border/50">
                        <<LoaderLoader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <<divdiv className="w-full border-t bg-background/80 backdrop-blur-md p-4">
          <<divdiv className="max-w-3xl mx-auto relative">
            <<textareatextarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Hermes AI..."
              className="w-full resize-none rounded-2xl border border-border bg-muted/50 py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[44px] max-h-[200px]"
            />
            <<ButtonButton
              size="icon"
              className="absolute right-2 bottom-1.5 h-8 w-8 brand-gradient text-primary-foreground"
              disabled={!input.trim() || isLoading}
              onClick={handleSend}
            >
              {isLoading ? <<LoaderLoader2 className="w-4 h-4 animate-spin" /> : <<SendSend className="w-4 h-4" />}
            </Button>
          </div>
          <<pp className="text-[10px] text-center text-muted-foreground mt-2">
            Hermes AI can make mistakes. Check important info.
          </p>
        </div>
      </main>
    </div>
  );
};
