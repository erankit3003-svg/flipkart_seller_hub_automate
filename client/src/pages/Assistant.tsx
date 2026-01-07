import Layout from "@/components/Layout";
import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Assistant() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello ${user?.firstName || 'there'}! I'm your seller assistant. I can help you analyze your sales, suggest inventory actions, or answer questions about your orders. How can I help you today?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Create a new conversation if needed, or use existing one.
      // For this demo, we'll assume a conversation ID of 1 (in a real app, manage this state properly)
      // NOTE: This assumes backend auto-creates conversation 1 if it doesn't exist, or we should create it first.
      // Simplified for UI demo purposes:
      
      const res = await fetch(`/api/conversations/1/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage.content }),
      });

      if (!res.ok) throw new Error('Failed to send');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: 'assistant' as const, content: '' };
      
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              assistantMessage.content += data.content;
              setMessages(prev => [
                ...prev.slice(0, -1),
                { ...assistantMessage }
              ]);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div>
          <h1 className="text-3xl font-display font-bold">AI Assistant</h1>
          <p className="text-muted-foreground">Your intelligent seller companion</p>
        </div>

        <Card className="flex-1 mt-6 flex flex-col glass-panel overflow-hidden border-indigo-100">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 py-4">
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
              <Bot className="w-5 h-5 text-indigo-600" />
              FlipkartHub Intelligence
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-primary text-white' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none shadow-md shadow-primary/20' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-4 border-t border-indigo-100 bg-white">
            <div className="flex w-full gap-2">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your sales, inventory, or returns..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button onClick={handleSend} disabled={isTyping || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
