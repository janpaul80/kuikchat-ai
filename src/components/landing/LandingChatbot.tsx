import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export const LandingChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi there! 👋 I'm KuikChat AI. How can I help you explore our features today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isMinimized]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        let assistantSoFar = "";
        const upsertAssistant = (nextChunk: string) => {
            assistantSoFar += nextChunk;
            setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                    return prev.map((m, i) =>
                        i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                    );
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
            });
        };

        try {
            console.log("Calling AI Chat URL:", CHAT_URL);
            const resp = await fetch(CHAT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!resp.ok) {
                const errorText = await resp.text();
                console.error("AI Assistant Error:", resp.status, errorText);
                throw new Error(`AI error (${resp.status}): ${errorText.slice(0, 100)}`);
            }

            if (!resp.body) {
                throw new Error("No response body received from AI");
            }

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let textBuffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                textBuffer += decoder.decode(value, { stream: true });

                let newlineIndex: number;
                while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
                    let line = textBuffer.slice(0, newlineIndex);
                    textBuffer = textBuffer.slice(newlineIndex + 1);

                    if (line.endsWith("\r")) line = line.slice(0, -1);
                    if (line.trim() === "" || line.startsWith(":")) continue;
                    if (!line.startsWith("data: ")) continue;

                    const jsonStr = line.slice(6).trim();
                    if (jsonStr === "[DONE]") break;

                    try {
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) upsertAssistant(content);
                    } catch {
                        // Partial JSON, wait for more
                        textBuffer = line + "\n" + textBuffer;
                        break;
                    }
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to connect to AI assistant.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            height: isMinimized ? "64px" : "500px",
                            width: "350px"
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass shadow-2xl rounded-2xl overflow-hidden flex flex-col mb-4 border border-white/20"
                    >
                        {/* Header */}
                        <div className="p-4 brand-gradient flex items-center justify-between text-primary-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">KuikChat AI</h3>
                                    {!isMinimized && <p className="text-[10px] opacity-80">Always active</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary-foreground hover:bg-white/10"
                                    onClick={() => setIsMinimized(!isMinimized)}
                                >
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary-foreground hover:bg-white/10"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                                    <div className="space-y-4">
                                        {messages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${msg.role === "user"
                                                    ? "brand-gradient text-primary-foreground rounded-tr-sm"
                                                    : "bg-muted rounded-tl-sm text-foreground"
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-muted px-3 py-2 rounded-2xl rounded-tl-sm">
                                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="p-3 border-t border-border bg-background/50 backdrop-blur-md">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Type a message..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                            className="bg-muted/50 border-none h-9 text-sm focus-visible:ring-1"
                                        />
                                        <Button
                                            size="icon"
                                            onClick={handleSend}
                                            disabled={!input.trim() || isLoading}
                                            className="h-9 w-9 brand-gradient shrink-0"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    setIsOpen(true);
                    setIsMinimized(false);
                }}
                className={`w-14 h-14 rounded-full brand-gradient shadow-lg flex items-center justify-center text-primary-foreground transition-transform ${isOpen ? 'scale-0' : 'scale-100'}`}
            >
                <MessageCircle className="w-7 h-7" />
            </motion.button>
        </div>
    );
};
