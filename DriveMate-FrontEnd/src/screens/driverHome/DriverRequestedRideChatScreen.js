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
import { jwtDecode } from 'jwt-decode';
import Config from '../../constant/Config';

const DriverRequestedRideChatScreen = ({ route, navigation }) => {
  const { passengerName, rideId, rideType, senderId, senderType } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    const enableChatForRide = async (rideId) => {
      try {
        console.log('Enabling chat for rideId:', rideId);
        const response = await axios.post(`${Config.apiBaseUrl}/enableRequestedRideChat`, { rideId });
        console.log(response.data); // 'Chat enabled for this requested ride'
      } catch (error) {
        console.error('Error enabling chat for ride:', error.response ? error.response.data : error.message);
      }
    };

    
    const fetchMessages = async () => {
      try {
        let response;
        if (rideType === 'requested') {
          response = await axios.get(`${Config.apiBaseUrl}/requestedRideChat/${rideId}`);
        }
        if (response && response.data) {
          setMessages(response.data);
          flatListRef.current.scrollToEnd({ animated: true });
        }
      } catch (error) {
        console.error('Error fetching messages:', error.response ? error.response.data : error.message);
      }
    };

    enableChatForRide(rideId); // Enable chat for the ride
    fetchMessages(); // Fetch messages after enabling chat
  }, [rideId, rideType]);

  const filteredMessages = messages
    .filter(message => message.rideId === rideId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const handleSendMessage = async () => {
    if (input.trim()) {
      try {
        const token = await AsyncStorage.getItem('Drivertoken');
        const decodedToken = jwtDecode(token);
        const driverId = decodedToken.id;

        const newMessage = {
          rideId,
          senderId: driverId,
          senderType: 'DriverDetails',
          message: input,
        };

        await axios.post(`${Config.apiBaseUrl}/requestedRide-sendMessage`, newMessage, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInput('');
        flatListRef.current.scrollToEnd({ animated: true });
      } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
      }
    }
  };

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
              <Text style={styles.headerText}>Chat with {passengerName}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={flatListRef}
            data={filteredMessages}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.senderType === 'DriverDetails' ? styles.driverMessage : styles.passengerMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.message}</Text>
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
    justifyContent: 'flex-end',
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
  },
  messageContainer: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  driverMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  passengerMessage: {
    backgroundColor: '#333',
    alignSelf: 'flex-start',
  },
  messageText: {
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

export default DriverRequestedRideChatScreen;
