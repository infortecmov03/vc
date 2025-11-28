'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { MessageSquare, Send, X, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { chat, ChatInput } from '@/ai/flows/chat-flow';
import { cn } from '@/lib/utils';


interface ChatMessage {
  id: string;
  message: string;
  senderType: 'user' | 'ai' | 'seller';
  timestamp: any;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isAiThinking, startAiTransition] = useTransition();

  const { user, firestore, areServicesAvailable } = useFirebase();
  
  const chatId = useMemo(() => {
    if (!user) return 'anonymous-chat';
    // In a multi-seller marketplace, this would be `userId_sellerId`
    return `${user.uid}_site_owner`;
  }, [user]);

  const messagesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'chats', chatId, 'messages');
  }, [firestore, chatId]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesRef) return null;
    return query(messagesRef, orderBy('timestamp', 'asc'), limit(50));
  }, [messagesRef]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection<ChatMessage>(messagesQuery);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        // A hack to scroll to the bottom. It needs some time to register the new message.
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !messagesRef) return;

    const userMessage = {
      message: message,
      senderType: 'user' as const,
      timestamp: serverTimestamp(),
      userId: user?.uid ?? 'anonymous',
      sellerId: 'site_owner',
    };

    setMessage('');
    await addDoc(messagesRef, userMessage);
    
    startAiTransition(async () => {
        try {
            const chatHistory = (messages || [])
                .filter(msg => msg.senderType === 'user' || msg.senderType === 'ai')
                .map(msg => ({
                    role: msg.senderType === 'user' ? 'user' : 'model',
                    content: msg.message,
                }));

            const aiInput: ChatInput = {
                history: chatHistory,
                message: userMessage.message,
            };

            const aiResponse = await chat(aiInput);

            const aiMessage = {
                message: aiResponse.response,
                senderType: 'ai' as const,
                timestamp: serverTimestamp(),
                userId: user?.uid ?? 'anonymous',
                sellerId: 'site_owner',
            };
            await addDoc(messagesRef, aiMessage);
        } catch (error) {
            console.error("AI chat failed:", error);
             const errorMessage = {
                message: "Desculpe, não estou conseguindo responder agora. Tente novamente mais tarde.",
                senderType: 'ai' as const,
                timestamp: serverTimestamp(),
                userId: user?.uid ?? 'anonymous',
                sellerId: 'site_owner',
            };
            await addDoc(messagesRef, errorMessage);
        }
    });

  };
  
  if (!areServicesAvailable) {
    return null; // Don't render the chat widget if Firebase isn't ready
  }


  return (
    <>
      <div className={cn("fixed bottom-4 right-4 z-50 transition-transform duration-300", isOpen ? "translate-x-[500px]" : "translate-x-0")}>
        <Button onClick={() => setIsOpen(true)} size="icon" className="h-16 w-16 rounded-full shadow-lg">
          <MessageSquare className="h-8 w-8" />
        </Button>
      </div>

      <div className={cn("fixed bottom-4 right-4 z-50 transition-transform duration-300", !isOpen ? "translate-x-[500px]" : "translate-x-0")}>
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot />
              <CardTitle>Assistente Virtual</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80 w-full pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {areMessagesLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-2 text-sm',
                      msg.senderType === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[75%] rounded-lg px-3 py-2',
                        msg.senderType === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
                 {isAiThinking && (
                    <div className="flex justify-start gap-2 text-sm">
                         <div className="max-w-[75%] rounded-lg px-3 py-2 bg-muted flex items-center">
                             <Loader2 className="h-4 w-4 animate-spin" />
                         </div>
                    </div>
                 )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isAiThinking}
              />
              <Button type="submit" size="icon" disabled={!message.trim() || isAiThinking}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
