import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation } from '@react-navigation/native';
import { jwtDecode } from "jwt-decode";
import Config from '../../constant/Config';
function PassengerRequestedRide() {

    const [searchQuery, setSearchQuery] = useState('');
    const [rides, setRides] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        axios.get(`${Config.apiBaseUrl}/display-all-requested-rides-Todriver`)
            .then(response => {
                if (response.data.status === "Success") {
                    setRides(response.data.data);
                } else {
                    setRides([]); 
                }
            })
            .catch(error => {
                console.error('Error fetching ride data:', error);
                setRides([]); 
            });
    }, []);

    const handleMessagePassenger = async (ride) => {
        try {
          // Retrieve the token from AsyncStorage
          const token = await AsyncStorage.getItem("Drivertoken");
          if (!token) {
            console.error("No token found");
            return;
          }
    
          // Decode the token to get the passenger ID
          const decodedToken = jwtDecode(token);
          const driverId = decodedToken.id; 
    
          console.log('Ride id : ', ride._id);
          navigation.navigate('requested-Ride-Chat', {
            // // driverEmail: ride.driver.email,
            // driverName: ride.driver.name, // Pass the driver's name
            // rideId: ride._id,
            // rideType: 'accepted', 
            // senderId: passengerId,
            // senderType: 'passengerDetails'
            passengerName: ride.passenger.name,
            rideId: ride._id,
            rideType: 'requested',
            senderId: driverId,
            senderType: 'DriverDetails',

          });
        } catch (error) {
          console.error('Error retrieving passenger ID:', error);
          Alert.alert("An error occurred while navigating to the chat.");
        }
      };

    const handleAcceptRequestedRide = async (requestedRide) => {
        console.log('Accepting requested ride:', requestedRide._id);
        try {
            // Retrieve the token from AsyncStorage
            const token = await AsyncStorage.getItem("Drivertoken");
            if (!token) {
                console.error("No token found");
                return;
            }
    
            // Prepare the data to send
            const rideData = {
                requestedRideId: requestedRide._id,
                pickupLocation: requestedRide.pickupLocation, 
                destinationLocation: requestedRide.destination, 
                datetime: requestedRide.datetime,
                passengerGender: requestedRide.gender
            };
    

            // Send the request to the server
            const response = await axios.post(`${Config.apiBaseUrl}/acceptRequestedRide`, rideData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

    
            if (response.data.status === "Success") {
                console.log("Requested ride accepted successfully");
                Alert.alert("Requested ride accepted successfully");
            } else {
                console.error("Failed to accept requested ride:", response.data.message);
                Alert.alert("Failed to accept requested ride: " + response.data.message);
            }
        } catch (error) {
            console.error('Error accepting requested ride:', error);
            Alert.alert("An error occurred while accepting the requested ride.");
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
                        <Text style={styles.text}>Name: {item.passenger.name}</Text>
                        <Text style={styles.text}>Phone no.: {item.passenger.mobile}</Text>
                        <Text style={styles.text}>Pickup Location: {item.pickupLocation.map(pickup => pickup.name)}</Text>
                        <Text style={styles.text}>Destination Location: {item.destination.map(dest => dest.name)}</Text>
                        <Text style={styles.text}>Date: {new Date(item.datetime).toLocaleString()}</Text>
                        <Text style={styles.text}>No. of Seats: {item.noOfSeats}</Text>
                        <Text style={styles.text}>Passenger Gender: {item.gender}</Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={() => handleAcceptRequestedRide(item)}
                                style={styles.acceptRideButton}
                            >
                                <Text style={styles.buttonText}>Accept Ride</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleMessagePassenger(item)}
                                style={styles.messageButton}
                            >
                                <Text style={styles.buttonText}>Message Passenger</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => (
                    
                        <Text style={styles.noRecordText}>No passenger has requested a ride.</Text>
                  
                )}
                numColumns={1}
            />
        </View>
    )
}

export default PassengerRequestedRide;

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
    noRecordText: {
        marginTop: 80,
        fontSize: 18,
        color: '#666',
        alignSelf: 'center'
      }
});
