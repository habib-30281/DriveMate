import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import { ListItem, Avatar } from 'react-native-elements';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Config from '../../constant/Config';
const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = await AsyncStorage.getItem('Drivertoken');

        if (!token) {
          console.error('Token is missing');
          return;
        }

        const decodedToken = jwtDecode(token);
        const driverId = decodedToken.id;

        console.log('DriverId from token:', driverId);

        const response = await axios.get(`${Config.apiBaseUrl}/passengerList/${driverId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Fetched chats:', response.data);
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, []);



  const renderItem = ({ item }) => {
    console.log('Rendering item:', item);
    console.log('rideid : ', item.rideId);

    if (!item || !item.name || !item.email || !item.rideId) {
      console.error('Invalid item:', item);
      return null;
    }

    return (
      <ListItem
        bottomDivider
        onPress={() => navigation.navigate('DriverChat', {
          passengerId: item._id,
          passengerName: item.name,
          rideId: item.rideId
        })}
      >
        <Avatar
          rounded
          title={item.name[0]}
          containerStyle={{ backgroundColor: '#ccc' }}
        />
        <ListItem.Content>
          <ListItem.Title style={styles.chatName}>{item.name}</ListItem.Title>
          <ListItem.Subtitle style={styles.chatMessage}>{item.email}</ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    );
  };

  const renderEmptyList = () => (
    <Text style={styles.emptyText}>No chats available.</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.customBackButton}
        onPress={() => navigation.goBack()}>
        <AntDesign name="arrowleft" style={styles.Icon} />
        <Text style={styles.customTextButton}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Chats</Text>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmptyList}
      />
    </SafeAreaView>
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  Icon: {
    color: '#414141',
    fontSize: 22,
  },
  customBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 2,
  },
  customTextButton: {
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '500',
    color: '#414141',
  },
  header: {
    fontSize: 30,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chatMessage: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});
