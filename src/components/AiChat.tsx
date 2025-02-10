import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Download, AlertCircle, BookOpen, Brain, Lightbulb, X, Search } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import DOMPurify from 'dompurify';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'error' | 'warning' | 'info';
  context?: 'study' | 'general' | 'off-topic';
}

interface AiChatProps {
  pdfContent: string;
  onClose: () => void;
  currentPage?: number;
  fileName?: string;
}

const STORAGE_KEY = 'ai_chat_history';
const MAX_CHUNK_SIZE = 30000;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const formatMarkdown = (text: string): string => {
  // Convert headers
  text = text.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-indigo-600 mt-4 mb-2">$1</h3>');
  text = text.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-indigo-700 mt-6 mb-3">$1</h2>');
  text = text.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-indigo-800 mt-8 mb-4">$1</h1>');
  
  // Convert code blocks
  text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto">$1</pre>');
  
  // Convert inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-indigo-600 px-1 rounded">$1</code>');
  
  // Convert bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-900">$1</strong>');
  
  // Convert italics
  text = text.replace(/\*(.*?)\*/g, '<em class="italic text-indigo-700">$1</em>');
  
  // Convert lists
  text = text.replace(/^\s*[-*+]\s+(.*)/gm, '<li class="ml-4 mb-2 flex items-start"><span class="inline-block w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-2"></span>$1</li>');
  text = text.replace(/^\s*\d+\.\s+(.*)/gm, '<li class="ml-4 mb-2 flex items-start"><span class="inline-block w-5 h-5 bg-indigo-100 rounded-full text-indigo-600 text-sm flex items-center justify-center mr-2">$1</span>$2</li>');
  
  // Convert blockquotes
  text = text.replace(/^\s*>\s+(.*)/gm, '<blockquote class="border-l-4 border-indigo-300 pl-4 my-4 text-gray-600 italic">$1</blockquote>');
  
  // Convert horizontal rules
  text = text.replace(/^---$/gm, '<hr class="my-6 border-t-2 border-indigo-100">');

  return text;
};

export const AiChat: React.FC<AiChatProps> = ({ pdfContent, onClose, currentPage, fileName }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'study' | 'general'>('study');
  const [relevantContext, setRelevantContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const cleanPDFContent = (content: string): string => {
    try {
      const base64Content = content.replace(/^data:application\/pdf;base64,/, '');
      const decodedContent = atob(base64Content);
      return decodedContent.replace(/[^\x20-\x7E]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (error) {
      console.error('Error cleaning PDF content:', error);
      return content;
    }
  };

  const findRelevantContext = (query: string): string => {
    try {
      const cleanedContent = cleanPDFContent(pdfContent);
      const words = query.toLowerCase().split(/\s+/);
      const sections = cleanedContent.split(/\n\n+/);
      const scoredSections = sections.map(section => {
        const score = words.reduce((acc, word) => {
          return acc + (section.toLowerCase().includes(word) ? 1 : 0);
        }, 0);
        return { text: section, score };
      });

      const relevantSections = scoredSections
        .filter(section => section.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(section => section.text);

      return relevantSections.join('\n\n');
    } catch (error) {
      console.error('Error finding relevant context:', error);
      return '';
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      if (mode === 'study') {
        const context = findRelevantContext(userMessage);
        const isRelevant = context.length > 0;

        if (!isRelevant) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I notice your question might not be directly related to the document content. Would you like me to:

1. Answer based on my general knowledge about "${userMessage}"
2. Help you find relevant information in the document
3. Rephrase your question to better match the document's content

Please let me know how you'd like to proceed!`,
            type: 'warning',
            context: 'off-topic'
          }]);
          setIsLoading(false);
          return;
        }

        setRelevantContext(context);

        const truncatedContext = context.length > MAX_CHUNK_SIZE 
          ? context.substring(0, MAX_CHUNK_SIZE) + "..."
          : context;

        const prompt = `You are an expert academic advisor and subject matter specialist analyzing a PDF document titled "${fileName || 'document'}". The user is currently viewing page ${currentPage || 1}. 

Relevant Document Context:
"""
${truncatedContext}
"""

Question: ${userMessage}

Instructions:
1. Focus on the specific content from the document
2. Use direct quotes when relevant
3. Highlight key concepts in **bold**
4. Structure your response with clear headings
5. Provide specific examples from the text
6. End with a concise summary
7. If relevant, reference the current page number
8. Maintain an educational, teaching tone

Format your response using markdown.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const formattedResponse = formatMarkdown(response.text());
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: formattedResponse,
          context: 'study'
        }]);
      } else {
        const prompt = `As a knowledgeable educator, provide a detailed response to this question: ${userMessage}

Format your response with:
- Clear structure using markdown
- Evidence-based explanations
- Practical examples
- Professional insights
- Educational tone`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const formattedResponse = formatMarkdown(response.text());
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: formattedResponse,
          context: 'general'
        }]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request. This might be due to the content format or size limitations. Please try asking about a different part of the document or rephrase your question.',
        type: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'
            } animate-fade-in`}
          >
            <div className={`p-2 rounded-full flex-shrink-0 ${
              message.role === 'assistant' 
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {message.role === 'assistant' ? (
                <Bot className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div
              className={`flex-1 p-4 rounded-lg break-words ${
                message.role === 'assistant'
                  ? message.type === 'error'
                    ? 'bg-red-50 text-red-800'
                    : message.type === 'warning'
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-indigo-50 text-gray-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.role === 'assistant' && message.context === 'study' && relevantContext && (
                <div className="mb-3 p-2 bg-indigo-100 rounded text-sm text-indigo-700 flex items-start gap-2">
                  <Search className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Relevant context found:</p>
                    <p className="line-clamp-2">{relevantContext}</p>
                  </div>
                </div>
              )}
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.content) }}
              />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-indigo-100">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 p-4 rounded-lg bg-indigo-50">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={mode === 'study' ? "Ask about the document..." : "Ask anything..."}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Lightbulb className="w-4 h-4" />
            {mode === 'study' 
              ? "I'm focused on helping you understand this document. Ask about its content!"
              : "Feel free to ask any question - I'm here to help!"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('study')}
              className={`p-1.5 rounded transition-colors ${
                mode === 'study'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              title="Study Mode"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMode('general')}
              className={`p-1.5 rounded transition-colors ${
                mode === 'general'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              title="General Mode"
            >
              <Brain className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};