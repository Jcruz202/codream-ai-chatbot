'use client'
import { Box, Stack, TextField, Button, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the CoDream support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again later." },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  const formatContent = (content) => content.split('\n').map((line, index) => (
    <span key={index}>{line}<br/></span>
  ));

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: isOpen ? 350 : 60,
        height: isOpen ? 500 : 60,
        borderRadius: 3,
        boxShadow: 3,
        bgcolor: 'white',
        zIndex: 1000,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {isOpen ? (
        <Stack height="100%">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            p={1}
            bgcolor="primary.main"
            color="white"
          >
            <Box>CoDream Chat</Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack
            direction="column"
            spacing={1}
            flexGrow={1}
            p={1}
            overflow="auto"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              >
                <Box
                  bgcolor={message.role === 'assistant' ? 'primary.main' : '#94999c'}
                  color="white"
                  borderRadius={2}
                  p={1.5}
                  maxWidth="80%"
                >
                  {formatContent(message.content)}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction="row" spacing={1} p={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button variant="contained" size="small" onClick={sendMessage} disabled={isLoading}>
              {isLoading ? '...' : 'Send'}
            </Button>
          </Stack>
        </Stack>
      ) : (
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{ width: '100%', height: '100%' }}
        >
          <ChatIcon color="primary" />
        </IconButton>
      )}
    </Box>
  );
}
