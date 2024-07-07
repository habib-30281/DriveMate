import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { jwtDecode } from "jwt-decode";// Import jwt-decode
import Config from '../../constant/Config';

function AvailableRides() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rides, setRides] = useState([]);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const fetchRides = useCallback(async () => {
    try {
      const response = await axios.get(`${Config.apiBaseUrl}/display-all-rides`);
  
      if (response.data.status === "Success") {
        // Filter out rides with status 'completed'
        const filteredRides = response.data.data.filter(ride => ride.status !== 'completed');
        setRides(filteredRides);
      } else {
        setRides([]); // Handle cases where no data is returned successfully
      }
    } catch (error) {
      console.error('Error fetching ride data:', error);
      setRides([]); // Ensure the rides array is cleared on error
    }
  }, []);
  

  useEffect(() => {
    if (isFocused) {
      fetchRides();
    }
  }, [isFocused]);

  const handleAcceptRide = async (ride) => {
    console.log('Accepting ride:', ride._id);
    try {
        // Retrieve the token from AsyncStorage
        const token = await AsyncStorage.getItem("Passengertoken");
        if (!token) {
            console.error("No token found");
            return;
        }

        // Prepare the data to send
        const rideData = {
            rideId: ride._id,
            driverId: ride.driver._id, // Assuming you have the driver's details nested under 'driver'
            pickupLocation: ride.pickupLocation, // Send the full object
            destinationLocation: ride.destination, // Send the full object
            datetime: ride.datetime,
            passengerGender: ride.gender
        };

        // Send the request to the server
        const response = await axios.post(`${Config.apiBaseUrl}/acceptRide`, rideData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data.status === "Success") {
            console.log("Ride accepted successfully");
            Alert.alert("Ride accepted successfully");
        } else {
            console.error("Failed to accept ride:", response.data.message);
            Alert.alert("Failed to accept ride: " + response.data.message);
        }
    } catch (error) {
        console.error('Error accepting ride:', error);
        Alert.alert("An error occurred while accepting the ride.");
    }
};


  const handleMessageDriver = async (ride) => {
    try {
      // Retrieve the token from AsyncStorage

      const token = await AsyncStorage.getItem("Passengertoken");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Decode the token to get the passenger ID
      const decodedToken = jwtDecode(token);
      const passengerId = decodedToken.id; // Adjust according to your token structure

      console.log("RideId: ", ride._id);
      navigation.navigate('Chat', {
        // driverEmail: ride.driver.email,
        
        driverName: ride.driver.name, // Pass the driver's name
        rideId: ride._id,
        rideType: 'accepted', 
        senderId: passengerId,
        senderType: 'passengerDetails'
      });
    } catch (error) {
      console.error('Error retrieving passenger ID:', error);
      Alert.alert("An error occurred while navigating to the chat.");
    }
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
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>Name: {item.driver.name}</Text>
            <Text style={styles.text}>phone no. {item.driver.mobile}</Text>
            <Text style={styles.text}>Pickup Location: {item.pickupLocation.map(pickup => pickup.name)}</Text>
            <Text style={styles.text}>Destination Location: {item.destination.map(dest => dest.name)}</Text>
            <Text style={styles.text}>Date: {new Date(item.datetime).toLocaleString()}</Text>
            <Text style={styles.text}>Price Per Seat: {item.pricePerSeat}</Text>
            <Text style={styles.text}>Available Seats: {item.passengers}</Text>
            <Text style={styles.text}>Passenger Gender: {item.gender}</Text>
            {/* <Text style={styles.text}>Price per seat: ${item.price}</Text> */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => handleAcceptRide(item)}
                style={styles.acceptRideButton}
              >
                <Text style={styles.buttonText}>Accept Ride</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleMessageDriver(item)}
                style={styles.messageButton}
              >
                <Text style={styles.buttonText}>Message Driver</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No ride is available to Explore</Text>
          </View>
        )}
        numColumns={1}
        key={"one-column"}
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
    marginTop: 30,
    marginLeft: 55,
    height: 40,
    marginBottom: 20,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    width: '80%',
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  text: {
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acceptRideButton: {
    backgroundColor: '#008955',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  messageButton: {
    backgroundColor: '#24a0ed',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 22,
    color: '#666',
  },
});

export default AvailableRides;
