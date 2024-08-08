'use client';
import { Box, Button, TextField, Stack } from "@mui/material";
import { useState } from "react";
import OpenAI from "openai";


export default function Home() {
  
  new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
  console.log('OpenAI API Key:', process.env.NEXT_PUBLIC_OPENAI_API_KEY); // Add this to verify if the key is being loaded



  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi I am Alfred your personal butler, not that the one from Batman :) (I am way cooler). What can I help you with today?'
    }
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    if (message.trim() === '') return;
  
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message }
    ]);
  
    setMessage('');
  
    try {
      const response = await fetch('/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: message }] }),
      });
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      let result = '';
      let done = false;
  
      while (!done) {
        const { done: doneReading, value } = await reader.read();
        done = doneReading;
        result += decoder.decode(value, { stream: true });
  
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          return [
            ...prevMessages.slice(0, -1),
            {
              ...lastMessage,
              content: result
            }
          ];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="white"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={2}
        bgcolor="white"
        display="flex"
        flexDirection="column"
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                msg.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  msg.role === 'assistant' ? 'primary.main' : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {msg.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2} mt={2}>
          <TextField
            value={message}
            label="Type your message"
            fullWidth
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
