import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  sender_type: 'visitor' | 'admin';
  message: string;
  created_at: string;
  image_url?: string;
}

interface ChatSession {
  name: string;
  email: string;
  conversationId: string;
  sessionToken: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'chat'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved session
  useEffect(() => {
    const savedSession = localStorage.getItem('chat_session');
    if (savedSession) {
      try {
        const session: ChatSession = JSON.parse(savedSession);
        if (session.name && session.email && session.conversationId && session.sessionToken) {
          setName(session.name);
          setEmail(session.email);
          setConversationId(session.conversationId);
          setSessionToken(session.sessionToken);
          setStep('chat');
        }
      } catch (e) {
        localStorage.removeItem('chat_session');
      }
    }
  }, []);

  // Load messages when conversation exists
  useEffect(() => {
    if (!conversationId || !sessionToken) return;

    const loadMessages = async () => {
      try {
        const response = await supabase.functions.invoke('chat-get-messages', {
          body: { conversationId, sessionToken },
        });

        if (response.data?.messages) {
          setMessages(response.data.messages as Message[]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(loadMessages, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [conversationId, sessionToken]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setStep('chat');
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `chat/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        await sendMessageWithImage('', imageUrl);
      }
    } catch (error) {
      console.error('Error handling image:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sendMessageWithImage = async (text: string, imageUrl?: string) => {
    if ((!text.trim() && !imageUrl) || isSending) return;

    setIsSending(true);
    
    try {
      const isNewConversation = !conversationId;
      
      const response = await supabase.functions.invoke('chat-send-message', {
        body: {
          conversationId,
          sessionToken,
          message: text.trim() || (imageUrl ? '📷 Image' : ''),
          imageUrl,
          visitorEmail: email,
          visitorName: name,
          isNewConversation,
        },
      });

      if (response.error) throw response.error;

      const newConvId = response.data.conversationId;
      const newSessionToken = response.data.sessionToken;
      
      if (isNewConversation && newConvId && newSessionToken) {
        setConversationId(newConvId);
        setSessionToken(newSessionToken);
        localStorage.setItem('chat_session', JSON.stringify({
          name,
          email,
          conversationId: newConvId,
          sessionToken: newSessionToken,
        }));
      }

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    await sendMessageWithImage(message.trim());
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[360px] max-w-[360px] h-[400px] sm:h-[500px] max-h-[calc(100vh-100px)] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-4 text-white">
            <h3 className="font-semibold text-lg">SolFerno Support</h3>
            <p className="text-sm opacity-90">
              {step === 'form' ? 'Please introduce yourself' : 'We are online'}
            </p>
          </div>

          {step === 'form' ? (
            /* Registration Form */
            <form onSubmit={handleStartChat} className="flex-1 p-6 flex flex-col gap-4">
              <div className="flex-1 flex flex-col justify-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Start Chat
              </Button>
            </form>
          ) : (
            /* Chat Interface */
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Send us a message</p>
                    <p className="text-sm">We'll reply as soon as possible</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'visitor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.sender_type === 'visitor'
                          ? 'bg-gradient-to-r from-primary to-accent text-white rounded-br-md'
                          : 'bg-secondary text-foreground rounded-bl-md'
                      }`}
                    >
                      {msg.image_url && (
                        <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={msg.image_url} 
                            alt="Shared image" 
                            className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxHeight: '200px' }}
                          />
                        </a>
                      )}
                      {msg.message && msg.message !== '📷 Image' && (
                        <p className="text-sm">{renderMessageWithLinks(msg.message)}</p>
                      )}
                      <p className={`text-xs mt-1 ${msg.sender_type === 'visitor' ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {/* Image upload button */}
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={isUploading || isSending}
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImagePlus className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isSending || isUploading}
                    className="flex-1 bg-background/50"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isSending || isUploading || !message.trim()}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
