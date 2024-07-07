import React, { useState, useEffect } from 'react';
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

const DriverChatScreen = ({ route, navigation }) => {
  const { passengerId, passengerName, rideId } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    console.log('ride id: ', rideId);
    console.log('passenger id', passengerId);
    console.log('passenger Name', passengerName);
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${Config.apiBaseUrl}/acceptedRideChat/${rideId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [rideId]);

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

        await axios.post(`${Config.apiBaseUrl}/sendMessage`, newMessage, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInput('');
      } catch (error) {
        console.error('Error sending message:', error);
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
            data={messages}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.senderType === 'DriverDetails' ? styles.driverMessage : styles.passengerMessage,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  item.senderType === 'DriverDetails' ? styles.driverMessageText : styles.passengerMessageText
                ]}>{item.message}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            
            contentContainerStyle={styles.messagesList}
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
    backgroundColor: '#b0b0b0',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
  },
  driverMessageText: {
    color: '#fff',
  },
  passengerMessageText: {
    color: '#000',
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

export default DriverChatScreen;
