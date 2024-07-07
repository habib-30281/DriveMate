
import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import Config from '../constant/Config';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io(`${Config.apiBaseUrl}`); // Update with your server URL
    console.log('Initializing socket connection...');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      console.log('Cleaning up socket connection...');
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message', (message) => {
        console.log('Received message in ChatContext:', message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Cleanup function to remove the event listener
      return () => {
        console.log('Removing message event listener...');
        socket.off('message');
      };
    }
  }, [socket]);

  const sendMessage = (rideId, rideType, senderId, senderType, message) => {
    if (socket) {
      socket.emit('sendMessage', { rideId, rideType, senderId, senderType, message });
      console.log('Sent message:', { rideId, rideType, senderId, senderType, message });
    } else {
      console.error('Socket is not connected.');
    }
  };

  return (
    <ChatContext.Provider value={{ socket, messages, setMessages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
