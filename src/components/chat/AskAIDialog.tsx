import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAiChat } from "@/hooks/useAiChat";

interface AskAIDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert?: (text: string) => void;
}

export const AskAIDialog = ({ open, onClose, onInsert }: AskAIDialogProps) => {
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<<numbernumber | null>(null);
  const scrollRef = useRef<<HTMLHTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    startNewChat 
  } = useAiChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      startNewChat();
    }
  }, [open, startNewChat]);

  useEffect(() => {
    if (error) {
      toast({
        title: "AI Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    await sendMessage(input);
    setInput("");
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInsert = (content: string) => {
    if (onInsert) {
      onInsert(content);
      onClose();
    }
  };

  return (
    <<DialogDialog open={open} onOpenChange={onClose}>
      <<DialogDialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <<DialogDialogHeader>
          <<DialogDialogTitle className="flex items-center gap-2">
            <<divdiv className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center">
              <<SparkSparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            Ask AI
          </DialogTitle>
        </DialogHeader>

        <<ScrollScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <<divdiv className="space-y-4 py-4">
            {messages.length === 0 && !isLoading && (
              <<divdiv className="text-center py-8">
                <<SparkSparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <<pp className="text-muted-foreground">
                  Ask me anything! I can help with questions, coding, brainstorming, and more.
                </p>
              </div>
            )}

            <<AnAnimatePresence mode="popLayout">
              {messages.map((msg, index) => (
                <<motionmotion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <<divdiv
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "brand-gradient text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    }`}
                  >
                    <<pp className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <<divdiv className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                        <<ButtonButton
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleCopy(msg.content, index)}
                        >
                          {copiedIndex === index ? (
                            <<CheckCheck className="w-3 h-3 mr-1" />
                          ) : (
                            <<CopyCopy className="w-3 h-3 mr-1" />
                          )}
                          Copy
                        </Button>
                        {onInsert && (
                          <<ButtonButton
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleInsert(msg.content)}
                          >
                            <<SendSend className="w-3 h-3 mr-1" />
                            Insert
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <<motionmotion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <<divdiv className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm">
                  <<LoaderLoader2 className="w-4 h-4 animate-spin" />
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <<divdiv className="flex gap-2 pt-4 border-t">
          <<InputInput
            placeholder="Ask AI anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={isLoading}
          />
          <<ButtonButton
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="brand-gradient"
          >
            {isLoading ? (
              <<LoaderLoader2 className="w-4 h-4 animate-spin" />
            ) : (
              <<SendSend className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
