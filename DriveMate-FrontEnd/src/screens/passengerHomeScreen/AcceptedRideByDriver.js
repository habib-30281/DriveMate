import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import Config from '../../constant/Config';

function AcceptedRideByDriver() {
    const [searchQuery, setSearchQuery] = useState('');
    const [acceptedRides, setAcceptedRides] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        async function fetchAcceptedRides() {
            const token = await AsyncStorage.getItem("Passengertoken");
            if (!token) {
                console.log('No token found');
                return;
            }

            try {
                const response = await axios.get(`${Config.apiBaseUrl}/display-accepted-rides-for-passenger-by-driver`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                

                if (response.data.status === "Success") {
                    setAcceptedRides(response.data.data);
                } else {
                    console.log('No accepted rides found or error occurred:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching accepted rides:', error);
            }
        }

        fetchAcceptedRides();
    }, []);



    const handleMessageDriver = (ride) => {
        
        console.log(ride)
        
        navigation.navigate('passenger-requested-ridechat', {
            driverId: ride.driver._id,
            driverName: ride.driver.name,
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
                data={acceptedRides}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.rideCard}>
                        <Text style={styles.text}>Driver Name: {item.driver.name}</Text>
                        <Text style={styles.text}>Driver Email: {item.driver.email}</Text>
                        <Text style={styles.text}>Driver Mobile: {item.driver.mobile}</Text>
                        <Text style={styles.text}>Pickup: {item.pickupLocation.map(pickup => pickup.name)}</Text>
                        <Text style={styles.text}>Destination: {item.destinationLocation.map(dest => dest.name)}</Text>
                        <Text style={styles.text}>Date: {new Date(item.datetime).toLocaleString()}</Text>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => handleMessageDriver(item)}>
                            <Text style={styles.buttonText}>Message Driver</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No Driver Accepted Ride Till now.</Text>
                    </View>
                )}
            />
        </View>
    )
}

export default AcceptedRideByDriver;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    searchBar: {
        // marginVertical: 40,
        marginTop: 30,
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