import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Config from '../../constant/Config';

function PassengerRideHistory({ navigation }) {
    const [completedRides, setCompletedRides] = useState([]);

    const fetchCompletedRides = useCallback(async () => {
        const token = await AsyncStorage.getItem("Passengertoken");
        if (!token) {
            console.log('No token found');
            return;
        }

        try {
            const response = await axios.get(`${Config.apiBaseUrl}/passenger/completed-rides`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.status === "Success") {
                setCompletedRides(response.data.data);
            } else {
                console.log('No completed rides found or error occurred:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching completed rides:', error);
        }
    }, []);

    useEffect(() => {
        fetchCompletedRides();
    }, [fetchCompletedRides]);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.customBackButton}
                onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" style={styles.Icon} />
                <Text style={styles.customTextButton}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Ride Completed Successfully</Text>
            <FlatList
                data={completedRides}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.text}>Driver Name: {item.driverName}</Text>
                        <Text style={styles.text}>Pickup Location: {item.pickupLocation.map(pickup => pickup.name).join(', ')}</Text>
                        <Text style={styles.text}>Destination Location: {item.destinationLocation.map(dest => dest.name).join(', ')}</Text>
                        <Text style={styles.text}>Date: {new Date(item.datetime).toLocaleString()}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.noRecordText}>No completed rides available to explore.</Text>}
            />
        </View>
    )
}

export default PassengerRideHistory;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        
    },
    card: {
        backgroundColor: '#e6e6e6',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        marginHorizontal: 20
    },
    text: {
        fontSize: 16,
        marginBottom: 5,
    },
    noRecordText: {
        marginTop: 80,
        fontSize: 18,
        color: '#666',
        alignSelf: 'center'
    },
    Icon: {
        color: '#414141',
        fontSize: 22,
    },
    customBackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 50,
        marginLeft: 2,
    },
    customTextButton: {
        fontSize: 18,
        marginLeft: 8,
        fontWeight: 'normal',
        color: '#414141',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
});
