import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Config from '../../constant/Config';
function PassengerBookedRide() {
  const [rides, setRides] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const fetchAcceptedRides = useCallback(async () => {
    const token = await AsyncStorage.getItem("Drivertoken");
    if (!token) {
      console.log('No token found');
      return;
    }
  
    try {
      const response = await axios.get(`${Config.apiBaseUrl}/accepted-rides`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data.status === "Success") {
        // Filter out completed rides
        const filteredRides = response.data.data.filter(ride => ride.status !== 'completed');
        setRides(filteredRides);
      } else {
        console.log('No accepted rides found or error occurred:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching accepted rides:', error);
    }
  }, []);
  
  useEffect(() => {
    if(isFocused){

      fetchAcceptedRides();
    }
  }, [isFocused, fetchAcceptedRides]);
  

  // const filteredRides = rides.filter(ride =>
  //   ride.pickupLocation.map(pickup => pickup.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   ride.destinationLocation.map(dest => dest.name).toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const handleMessagePassenger = (ride) => {
    console.log('passenger id, ', ride.passenger._id)
    console.log('name: ', ride.passenger.name)
    console.log('ride id: ', ride.ride._id)
    navigation.navigate('DriverChat', {
      passengerId: ride.passenger._id,
      passengerName: ride.passenger.name,
      rideId: ride.ride._id
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by destination or pickup location"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={rides}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.rideCard}>
            <Text style={styles.rideText}>Passenger Name: {item.passenger.name}</Text>
            <Text style={styles.rideText}>Passenger Email: {item.passenger.email}</Text>
            <Text style={styles.rideText}>Pickup Location: {item.pickupLocation.map(pickup => pickup.name).join(', ')}</Text>
            <Text style={styles.rideText}>Destination: {item.destinationLocation.map(dest => dest.name).join(', ')}</Text>
            <Text style={styles.rideText}>Date and Time: {new Date(item.datetime).toLocaleString()}</Text>
            <TouchableOpacity style={styles.cancelButton} onPress={() => handleMessagePassenger(item)}>
              <Text style={styles.buttonText}>Message Passenger</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Passenger Accepted Ride Till now.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchBar: {
    marginVertical: 40,
    marginLeft: 55,
    height: 40,
    marginBottom: 20,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    width: '80%',
  },
  rideCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  rideText: {
    fontSize: 16,
    marginBottom: 5,
  },
  cancelButton: {
    backgroundColor: '#24a0ed',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50, // Adjust based on your layout
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});

export default PassengerBookedRide;
