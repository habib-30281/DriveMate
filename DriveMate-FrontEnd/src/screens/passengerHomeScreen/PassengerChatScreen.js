import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import Config from '../../constant/Config';

const PassengerChatScreen = ({ route, navigation }) => {
  const { driverName, rideId } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        await axios.post(`${Config.apiBaseUrl}/enableChat`, { rideId });
        console.log('Chat enabled for this requested ride');
      } catch (error) {
        console.error('Error enabling chat for ride:', error);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${Config.apiBaseUrl}/acceptedRideChat/${rideId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    initializeChat();
    fetchMessages();
  }, [rideId]);

  const handleSendMessage = async () => {
    if (input.trim()) {
      try {
        const token = await AsyncStorage.getItem('Passengertoken');
        const decodedToken = jwtDecode(token);
        const passengerId = decodedToken.id;

        const newMessage = {
          rideId,
          senderId: passengerId,
          senderType: 'passengerDetails',
          message: input,
          // createdAt: new Date().toISOString(),  // Add createdAt to the new message
        };

        await axios.post(`${Config.apiBaseUrl}/sendMessage`, newMessage, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Optimistically add the message to the state
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInput('');
        flatListRef.current.scrollToEnd({ animated: true });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const filteredMessages = messages
    .filter(message => message.rideId === rideId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 4}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.topPadding} />
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#fff" />
              <Text style={styles.headerText}>Chat with {driverName}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={flatListRef}
            data={filteredMessages}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.senderType === 'passengerDetails' ? styles.passengerMessage : styles.driverMessage,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  item.senderType === 'passengerDetails' ? styles.passengerMessageText : styles.driverMessageText
                ]}>{item.message}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
          />
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message"
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
              <Icon name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inner: {
    flex: 1,
  },
  topPadding: {
    height: 40,
    backgroundColor: '#007AFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 10,
    elevation: 2,
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 20,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  driverMessage: {
    backgroundColor: '#b0b0b0',
    alignSelf: 'flex-start',
  },
  passengerMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  messageText: {
    color: '#fff',
  },
  driverMessageText: {
    color: '#000',
  },
  passengerMessageText: {
    color: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default PassengerChatScreen;
