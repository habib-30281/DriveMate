import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import BottomSheet from '@gorhom/bottom-sheet';
import PagerView from 'react-native-pager-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import Config from '../../constant/Config';

function TrackRide() {
  const [rides, setRides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [acceptedRide, setAcceptedRide] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [rideStarted, setRideStarted] = useState(false); 
  const bottomSheetRef = useRef(null);
  const isFocused = useIsFocused();
  const pagerRef = useRef(null);
  const navigation = useNavigation();
  const socket = useRef(null);
  const mapRef = useRef(null);

  const fetchRides = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("Drivertoken");
      if (!token) {
        console.log('No token found');
        return;
      }
  
      const response = await axios.get(`${Config.apiBaseUrl}/display-rides`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data.status === "Success") {
        // Filter out completed rides
        const filteredRides = response.data.data.filter(ride => ride.status !== 'completed');
        setRides(filteredRides);
  
        if (filteredRides.length === 0) {
          console.log('No rides found');
        }
      } else {
        console.error('Error occurred:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching ride data:', error);
    }
  }, []);
  

  useEffect(() => {
    if (isFocused) {
      fetchRides();
    }
  }, [isFocused, fetchRides]);

  const handleCancelRide = async (rideId) => {
    console.log("Ride Id ", rideId);

    const token = await AsyncStorage.getItem("Drivertoken");
    if (!token) {
      Alert.alert("Authentication Error", "No authentication token found.");
      return;
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    axios.post(`${Config.apiBaseUrl}/cancelRide`, { rideId }, config)
      .then(res => {
        if (res.data.status === "Success") {
          Alert.alert("Success", "Ride cancelled successfully");
          fetchRides();
        } else {
          Alert.alert("Cancellation Failed", res.data.data);
        }
      })
      .catch(e => {
        if (e.response) {
          console.log("Detailed error:", e.response);
          Alert.alert("Server Error", e.response.data.message || "An unexpected error occurred.");
        } else if (e.request) {
          console.log("Request was made but no response was received", e.request);
          Alert.alert("Network Error", "No response from server.");
        } else {
          console.log("Error setting up the request", e.message);
          Alert.alert("Error", "An error occurred setting up your request.");
        }
      });
  };

  const fetchAcceptedRideRequests = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("Drivertoken");
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await axios.get(`${Config.apiBaseUrl}/display-accepted-ride-requests-for-driver`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.status === "Success") {
        setAcceptedRide(response.data.data);
      } else {
        console.log('No accepted ride requests found:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching accepted ride requests:', error);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchAcceptedRideRequests();
    }
  }, [isFocused, fetchAcceptedRideRequests]);

  const handleCancelAcceptedRide = async (acceptedRideId) => {
    console.log("Cancelling accepted ride:", acceptedRideId);

    const token = await AsyncStorage.getItem("Drivertoken");
    if (!token) {
      Alert.alert("Authentication Error", "No authentication token found.");
      return;
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    axios.post(`${Config.apiBaseUrl}/cancelAcceptedRide-for-driver`, { acceptedRideId }, config)
      .then(res => {
        console.log("Server response:", res.data);
        if (res.data.status === "Success") {
          Alert.alert("Success", "Accepted ride cancelled successfully");
          fetchAcceptedRideRequests();
        } else {
          Alert.alert("Cancellation Failed", res.data.message);
        }
      })
      .catch(e => {
        if (e.response) {
          console.log("Detailed error:", e.response.data);
          Alert.alert("Server Error", e.response.data.message || "An unexpected error occurred.");
        } else if (e.request) {
          console.log("Request was made but no response was received", e.request);
          Alert.alert("Network Error", "No response from server.");
        } else {
          console.log("Error setting up the request", e.message);
          Alert.alert("Error", "An error occurred setting up your request.");
        }
      });
  };

  const handlePageChange = (selectedIndex) => {
    setActiveIndex(selectedIndex);
    pagerRef.current?.setPage(selectedIndex);
  };

  useEffect(() => {
    if (rides.length > 0) {
      const rideId = rides[0]._id;
      console.log("RideId : ", rideId);
      socket.current = io(`${Config.apiBaseUrl}`);

      socket.current.on('connect', () => {
        console.log('Connected to WebSocket');
        socket.current.emit('join', { rideId });
      });

      return () => {
        socket.current.disconnect();
      };
    }
  }, [rides]);

  const shareDriverLocation = async (rideId) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }
  
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1
      },
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          rideId: rideId
        };
        setDriverLocation(location);
        socket.current.emit('updateDriverLocation', location);
  
        // Call getRoute to update the route dynamically
        if (rides.length > 0 && rides[0].destination && rides[0].destination.length > 0) {
          getRoute([{ lat: location.latitude, lon: location.longitude }], rides[0].destination);
        }
      }
    );
  };
  
  const getRoute = async (startLocation, destination) => {
    if (!startLocation || !destination || startLocation.length === 0 || destination.length === 0) {
      console.error('Invalid start or destination coordinates:', startLocation, destination);
      return;
    }
  
    const start = `${startLocation[0].lon},${startLocation[0].lat}`;
    const end = `${destination[0].lon},${destination[0].lat}`;
    const url = `http://router.project-osrm.org/route/v1/driving/${start};${end}?geometries=geojson`;
  
    // console.log('Request URL:', url); // Log the URL to debug
  
    try {
      const response = await axios.get(url);
      const coordinates = response.data.routes[0].geometry.coordinates.map(([longitude, latitude]) => ({
        latitude,
        longitude,
      }));
      setRouteCoordinates(coordinates);
      // console.log('Route coordinates:', coordinates); // Log the coordinates for verification
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };
  
  const handleStartRide = async (rideId) => {
    try {
      const token = await AsyncStorage.getItem("Drivertoken");
      if (!token) {
        Alert.alert("Authentication Error", "No authentication token found.");
        return;
      }
  
      // Call the API to start the ride
      const response = await axios.post(`${Config.apiBaseUrl}/startRide`, { rideId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.data.status === "Success") {
        console.log('Ride started successfully');
        setRideStarted(true); // Mark the ride as started
        bottomSheetRef.current.snapToIndex(0); // Set bottom sheet to minimal snap point
        shareDriverLocation(rideId);
        
        if (rides.length > 0 && rides[0].pickupLocation && rides[0].pickupLocation.length > 0 && rides[0].destination && rides[0].destination.length > 0) {
          const pickupLocation = {
            latitude: parseFloat(rides[0].pickupLocation[0].lat),
            longitude: parseFloat(rides[0].pickupLocation[0].lon),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          mapRef.current.animateToRegion(pickupLocation, 1000);
          getRoute([{ lat: rides[0].pickupLocation[0].lat, lon: rides[0].pickupLocation[0].lon }], rides[0].destination);
        }
      } else {
        Alert.alert("Failed to start ride", response.data.message);
      }
    } catch (error) {
      console.error('Error starting ride:', error);
      Alert.alert("Error", "An error occurred while starting the ride.");
    }
  };

  const handleEndRide = async (rideId) => {
    const token = await AsyncStorage.getItem("Drivertoken");
    if (!token) {
      Alert.alert("Authentication Error", "No authentication token found.");
      return;
    }
  
    Alert.alert(
      "Confirm End Ride",
      "Are you sure you want to end the ride?",
      [
        {
          text: "No",
          onPress: () => console.log("Ride continues"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const response = await axios.post(`${Config.apiBaseUrl}/endRide`, { rideId }, {
                headers: { Authorization: `Bearer ${token}` }
              });
  
              if (response.data.status === "Success") {
                Alert.alert("Ride Completed", "Congratulations! Ride complete.");
                
                console.log('Ride ended successfully');
                // Alert.alert("Congratulations", "Ride Complete");
                setRideStarted(false); // Mark the ride as ended
                setDriverLocation(null);
                setRouteCoordinates([]);
              } else {
                Alert.alert("Failed to end ride", response.data.message);
              }
            } catch (error) {
              console.error('Error ending ride:', error);
              Alert.alert("Error", "An error occurred while ending the ride.");
            }
          }
        }
      ]
    );
  };
  

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 33.6839,
          longitude: 73.0313,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Driver Location"
            pinColor="blue"
          />
        )}
        {rideStarted && rides.length > 0 && rides[0].pickupLocation && rides[0].pickupLocation.length > 0 && (
          <Marker
            coordinate={{
              latitude: parseFloat(rides[0].pickupLocation[0].lat),
              longitude: parseFloat(rides[0].pickupLocation[0].lon),
            }}
            title="Pickup Location"
            pinColor="red"
          />
        )}
        {rideStarted && rides.length > 0 && rides[0].destination && rides[0].destination.length > 0 && (
          <Marker
            coordinate={{
              latitude: parseFloat(rides[0].destination[0].lat),
              longitude: parseFloat(rides[0].destination[0].lon),
            }}
            title="Destination Location"
            pinColor="purple"
          />
        )}

        {rideStarted && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={3}
            strokeColor="blue"
          />
        )}
      </MapView>

      <View style={styles.notificationIconContainer}>
        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => navigation.navigate('chatlist')}
        >
          <Icon name="message" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      {rideStarted && (
        <TouchableOpacity
          style={styles.endRideButton}
          onPress={() => handleEndRide(rides[0]._id)}
        >
          <Text style={styles.buttonText}>End Ride</Text>
        </TouchableOpacity>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={rideStarted ? ['4%'] : ['35%', '50%', '75%']}
        index={0}
      >
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeIndex === 0 && styles.activeTab]}
            onPress={() => handlePageChange(0)}
          >
            <Text style={[styles.tabText, activeIndex === 0 && styles.activeTabText]}>Track Rides</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeIndex === 1 && styles.activeTab]}
            onPress={() => handlePageChange(1)}
          >
            <Text style={[styles.tabText, activeIndex === 1 && styles.activeTabText]}>Requested Rides</Text>
          </TouchableOpacity>
        </View>

        <PagerView
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={e => setActiveIndex(e.nativeEvent.position)}
          ref={pagerRef}
        >
          <View key="1" style={styles.page}>
            <ScrollView style={styles.cardContainer}>
              {rides.length > 0 ? (
                rides.map((ride, index) => (
                  <View key={ride._id} style={[styles.card, index !== 0 && { marginTop: 10 }]}>
                    <Text style={styles.cardText}>Destination: {ride.destination.map(dest => dest.name)}</Text>
                    <Text style={styles.cardText}>Pickup: {ride.pickupLocation.map(pickup => pickup.name)}</Text>
                    <Text style={styles.cardText}>Date and Time: {new Date(ride.datetime).toLocaleString()}</Text>
                    {/* <Text style={styles.cardText}>Gender Preference: {ride.gender}</Text> */}
                    <Text style={styles.text}>Price Per Seat: {ride.pricePerSeat}</Text>
                    <Text style={styles.cardText}>No of Seats: {ride.passengers}</Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.startRideButton}
                        onPress={() => handleStartRide(ride._id)}
                      >
                        <Text style={styles.buttonText}>Start Ride</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelRideButton}
                        onPress={() => handleCancelRide(ride._id)}
                      >
                        <Text style={styles.buttonText}>Cancel Ride</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noRecordText}>No Rides Available To Track.</Text>
              )}
            </ScrollView>
          </View>

          <View key="2" style={styles.page}>
            <ScrollView style={styles.cardContainer}>
              {acceptedRide.length > 0 ? (
                acceptedRide.map((ride, index) => (
                  <View key={index} style={styles.card}>
                    <Text style={styles.cardText}>Passenger Name: {ride.passenger.name}</Text>
                    <Text style={styles.cardText}>Passenger Phone: {ride.passenger.mobile}</Text>
                    <Text style={styles.cardText}>Pickup: {ride.pickupLocation.map(pickup => pickup.name)}</Text>
                    <Text style={styles.cardText}>Destination: {ride.destinationLocation.map(dest => dest.name)}</Text>
                    <Text style={styles.cardText}>Date: {new Date(ride.datetime).toLocaleString()}</Text>
                    <Text style={styles.cardText}>Gender Preference: {ride.passengerGender}</Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.startRideButton}
                        onPress={() => console.log('Starting ride with ID:', ride._id)}
                      >
                        <Text style={styles.buttonText}>Start Ride</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelRideButton}
                        onPress={() => handleCancelAcceptedRide(ride._id)}
                      >
                        <Text style={styles.buttonText}>Cancel Ride</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noRecordText}>No accepted rides available.</Text>
              )}
            </ScrollView>
          </View>
        </PagerView>
      </BottomSheet>
    </View>
  );
}

export default TrackRide;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  pagerView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  page: {
    width: '100%',
    height: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#008955',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#008955',
    fontWeight: 'bold',
  },
  cardContainer: {
    width: '100%',
    maxHeight: '100%',
    backgroundColor: 'white',
    padding: 10,
  },
  sheetText: {
    fontSize: 24,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#e6e6e6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  startRideButton: {
    backgroundColor: '#008955',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  cancelRideButton: {
    backgroundColor: 'red',
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
  },
  notificationIconContainer: {
    position: 'absolute',
    top: 45,
    right: 12,
  },
  notificationIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  endRideButton: {
    position: 'absolute',
    bottom: 40,
    left: '25%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#037ffc',
    padding: 15,
    borderRadius: 10,
    width:'80%',
    zIndex: 1000,
    textAlign: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  },
});
