import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles, Minimize2, Maximize2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAiChat } from "@/hooks/useAiChat";
import { supabase } from "@/lib/supabase";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export const LandingChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [session, setSession] = useState<<anyany>(null);
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
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isMinimized]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        await sendMessage(input);
        setInput("");
    };

    const handleSignIn = async () => {
        // Redirect to sign in or trigger auth flow
        // For now, we assume the user will use the main app sign-in
        // In a real implementation, this might trigger a redirect or a modal
        window.location.href = "/login"; 
    };

    return (
        <<divdiv className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <<AnAnimatePresence>
                {isOpen && (
                    <<motionmotion.div
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
                        <<divdiv className="p-4 brand-gradient flex items-center justify-between text-primary-foreground">
                            <<divdiv className="flex items-center gap-2">
                                <<divdiv className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <<SparkSparkles className="w-4 h-4" />
                                </div>
                                <<divdiv>
                                    <<hh3 className="font-semibold text-sm">KuikChat AI</h3>
                                    {!isMinimized && <<pp className="text-[10px] opacity-80">Always active</p>}
                                </div>
                            </div>
                            <<divdiv className="flex items-center gap-1">
                                <<ButtonButton
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary-foreground hover:bg-white/10"
                                    onClick={() => setIsMinimized(!isMinimized)}
                                >
                                    {isMinimized ? <<MaximizeMaximize2 className="w-4 h-4" /> : <<MinimizeMinimize2 className="w-4 h-4" />}
                                </Button>
                                <<ButtonButton
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary-foreground hover:bg-white/10"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <<XX className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                <<ScrollScrollArea className="flex-1 p-4" ref={scrollRef}>
                                    <<divdiv className="space-y-4">
                                        {!session ? (
                                            <<divdiv className="text-center py-8 space-y-4">
                                                <<divdiv className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                                                    <<LockLock className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <<divdiv className="space-y-2">
                                                    <<pp className="text-sm font-medium">Sign in to use KuikChat AI</p>
                                                    <<pp className</code>,op: "replace",new_string: `import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles, Minimize2, Maximize2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAiChat } from "@/hooks/useAiChat";
import { supabase } from "@/lib/supabase";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export const LandingChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [session, setSession] = useState<<anyany>(null);
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
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isMinimized]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        await sendMessage(input);
        setInput("");
    };

    const handleSignIn = () => {
        window.location.href = "/login";
    };

    return (
        <<divdiv className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <<AnAnimatePresence>
                {isOpen && (
                    <<motionmotion.div
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
                        <<divdiv className="p-4 brand-gradient flex items-center justify-between text-primary-foreground">
                            <<divdiv className="flex items-center gap-2">
                                <<divdiv className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <<SparkSparkles className="w-4 h-4" />
                                </div>
                                <<divdiv>
                                    <<hh3 className="font-semibold text-sm">KuikChat AI</h3>
                                    {!isMinimized && <<pp className="text-[10px] opacity-80">Always active</p>}
                                </div>
                            </div>
                            <<divdiv className="flex items-center gap-1">
                                <<ButtonButton
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary-foreground hover:bg-white/10"
                                    onClick={() => setIsMinimized(!isMinimized)}
                                >
                                    {isMinimized ? <<MaximizeMaximize2 className="w-4 h-4" /> : <<MinimizeMinimize2 className="w-4 h-4" />}
                                </Button>
                                <<ButtonButton
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary-foreground hover:bg-white/10"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <<XX className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                <<ScrollScrollArea className="flex-1 p-4" ref={scrollRef}>
                                    <<divdiv className="space-y-4">
                                        {!session ? (
                                            <<divdiv className="text-center py-8 space-y-4">
                                                <<divdiv className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                                                    <<LockLock className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <<divdiv className="space-y-2">
                                                    <<pp className="text-sm font-medium">Sign in to use KuikChat AI</p>
                                                    <<ButtonButton onClick={handleSignIn} className="w-full brand-gradient text-xs">
                                                        Sign In
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {messages.map((msg, i) => (
                                                    <<divdiv key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                                        <<divdiv className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                                                            msg.role === "user" 
                                                            ? "brand-gradient text-primary-foreground rounded-tr-sm" 
                                                            : "bg-muted rounded-tl-sm text-foreground"
                                                        }`}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                ))}
                                                {isLoading && (
                                                    <<divdiv className="flex justify-start">
                                                        <<divdiv className="bg-muted px-3 py-2 rounded-2xl rounded-tl-sm">
                                                            <<LoaderLoader2 className="w-4 h-4 animate-spin" />
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </ScrollArea>

                                {session && (
                                    <<divdiv className="p-3 border-t border-border bg-background/50 backdrop-blur-md">
                                        <<divdiv className="flex gap-2">
                                            <<InputInput
                                                placeholder="Type a message..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                                className="bg-muted/50 border-none h-9 text-sm"
                                                disabled={isLoading}
                                            />
                                            <<ButtonButton
                                                size="icon"
                                                onClick={handleSend}
                                                disabled={!input.trim() || isLoading}
                                                className="h-9 w-9 brand-gradient shrink-0"
                                            >
                                                <<SendSend className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <<motionmotion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    setIsOpen(true);
                    setIsMinimized(false);
                }}
                className={`w-14 h-14 rounded-full brand-gradient shadow-lg flex items-center justify-center text-primary-foreground transition-transform ${isOpen ? 'scale-0' : 'scale-100'}`}
            >
                <<MessageMessageCircle className="w-7 h-7" />
            </motion.button>
        </div>
    );
};
