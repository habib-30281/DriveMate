import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import Config from '../../constant/Config';


const SOCKET_SERVER_URL = `${Config.apiBaseUrl}`;

function BookedRides() {
  const [rides, setRides] = useState([]);
  const [requestedRides, setRequestedRides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [driverLocation, setDriverLocation] = useState(null);
  const [rideStarted, setRideStarted] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const bottomSheetRef = useRef(null);
  const isFocused = useIsFocused();
  const pagerRef = useRef(null);
  const navigation = useNavigation();
  const socket = useRef(null);
  const mapRef = useRef(null);

  const fetchAcceptedRides = useCallback(async () => {
    const token = await AsyncStorage.getItem("Passengertoken");
    if (!token) return;
  
    try {
      const response = await axios.get(`${Config.apiBaseUrl}/accepted-rides-for-passenger`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.data.status === "Success") {
        // Filter out rides with status 'completed'
        const filteredRides = response.data.data.filter(ride => ride.status !== 'completed');
        setRides(filteredRides);
        console.log('Accepted rides fetched:', filteredRides);
      } else {
        console.log('No accepted rides found:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching accepted rides:', error);
    }
  }, []);
  

  useEffect(() => {
    if (isFocused) {
      fetchAcceptedRides();
    }
  }, [isFocused, fetchAcceptedRides]);

  const handleCancelAcceptedRide = async (acceptedRideId) => {
    const token = await AsyncStorage.getItem("Passengertoken");
    if (!token) {
      Alert.alert("Authentication Error", "No authentication token found.");
      return;
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    axios.post(`${Config.apiBaseUrl}/cancelAcceptedRide-for-passenger`, { acceptedRideId }, config)
      .then(res => {
        if (res.data.status === "Success") {
          Alert.alert("Success", "Accepted ride cancelled successfully");
          fetchAcceptedRides();
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

  const fetchRequestedRides = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("Passengertoken");
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await axios.get(`${Config.apiBaseUrl}/display-requested-rides`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.status === "Success") {
        setRequestedRides(response.data.data);
      } else {
        console.error('No requested rides found or error occurred:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching requested ride data:', error);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchRequestedRides();
    }
  }, [isFocused, fetchRequestedRides]);

  const handleCancelRequestedRide = async (rideRequestId) => {
    const token = await AsyncStorage.getItem("Passengertoken");
    if (!token) {
      Alert.alert("Authentication Error", "No authentication token found.");
      return;
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    axios.post(`${Config.apiBaseUrl}/cancelRequestedRide`, { rideRequestId }, config)
      .then(res => {
        if (res.data.status === "Success") {
          Alert.alert("Success", "Requested ride cancelled successfully");
          fetchRequestedRides();
        } else {
          Alert.alert("Cancellation Failed", res.data.data || "Failed to cancel the ride");
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

  const handlePageChange = (selectedIndex) => {
    setActiveIndex(selectedIndex);
    pagerRef.current?.setPage(selectedIndex);
  };

  const getRoute = async (driverLoc, destination) => {
    if (!driverLoc || !destination) {
      console.error('Driver location or destination is missing.');
      return;
    }

    const driverLat = parseFloat(driverLoc.latitude);
    const driverLon = parseFloat(driverLoc.longitude);
    const destLat = parseFloat(destination.lat);
    const destLon = parseFloat(destination.lon);

    setRideStarted(true);

    if (isNaN(driverLat) || isNaN(driverLon) || isNaN(destLat) || isNaN(destLon)) {
      console.error('Invalid driver location or destination coordinates.');
      return;
    }

    const startLocation = `${driverLon},${driverLat}`;
    const endLocation = `${destLon},${destLat}`;
    const url = `http://router.project-osrm.org/route/v1/driving/${startLocation};${endLocation}?geometries=geojson`;

    // console.log("Route URL:", url);

    try {
      const response = await axios.get(url);
      console.log("OSRM API response:", response.data);

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const coordinates = response.data.routes[0].geometry.coordinates.map(([longitude, latitude]) => ({
          latitude,
          longitude,
        }));
        setRouteCoordinates(coordinates);
        // console.log('Route coordinates:', coordinates);
      } else {
        console.error('No routes found in the response.');
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
    }
  };

  const handleEndMyRide = async (rideId) => {

    console.log("Ending Ride Id : here : ", rideId); 
    const token = await AsyncStorage.getItem("Passengertoken");
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
                        const response = await axios.post(`${Config.apiBaseUrl}/endPassengerRide`, { rideId }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });



                        if (response.data.status === "Success") {

                          setRideStarted(false);
                            Alert.alert("Ride Completed", "Congratulations! Ride complete.");
                            console.log('Ride ended successfully');
                            // setRideStarted(false);
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



  useEffect(() => {
    socket.current = io(SOCKET_SERVER_URL);

    socket.current.on('connect', () => {
      console.log('Connected to the server');
    });

    socket.current.on('disconnect', () => {
      console.log('Disconnected from the server');
    });

    socket.current.on('driverLocation', (location) => {
      console.log('Driver location update received:', location);
      setDriverLocation(location);

      if (location && rides.length > 0 && rides[0].destinationLocation && rides[0].destinationLocation.length > 0) {
        getRoute(location, rides[0].destinationLocation[0]);

        // Focus on the driver's location
        const driverRegion = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        mapRef.current.animateToRegion(driverRegion, 1000);
      }
    });


    socket.current.on('driverDisconnected', () => {
      // console.log('Driver disconnected');
      setDriverLocation(null);
      setRideStarted(false);
      Alert.alert('Driver Disconnected', 'The driver has disconnected.');
    });

    // Join ride room when component mounts
    const joinRoom = async () => {
      const token = await AsyncStorage.getItem("Passengertoken");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      if (!userId || rides.length === 0) {
        console.log('No user ID or rides found');
        return;
      }

      console.log('Joining room for ride:', rides[0].ride._id);
      socket.current.emit('join', { rideId: rides[0].ride._id, userId });
    };

    joinRoom();

    return () => {
      socket.current.disconnect();
    };
  }, [rides]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 33.6844,
          longitude: 73.0479,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {rides.map((ride, index) => {
          const pickup = ride.pickupLocation[0];
          const destination = ride.destinationLocation[0];
          return (
            <Marker
              key={index}
              coordinate={{ latitude: parseFloat(pickup.lat), longitude: parseFloat(pickup.lon) }}
              title={`Pickup: ${pickup.name}`}
            />
          );
        })}

        {driverLocation && (
          <Marker
            coordinate={{ latitude: driverLocation.latitude, longitude: driverLocation.longitude }}
            title="Driver Location"
            pinColor="blue"
          />
        )}

        {rides.length > 0 && rides[0].status === 'started' && routeCoordinates.length > 0 && (
          <>
            <Marker
              coordinate={{ latitude: parseFloat(rides[0].destinationLocation[0].lat), longitude: parseFloat(rides[0].destinationLocation[0].lon) }}
              title={`Destination: ${rides[0].destinationLocation[0].name}`}
            />
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={3}
              strokeColor="blue"
            />
          </>
        )}
      </MapView>

      <View style={styles.notificationIconContainer}>
        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => navigation.navigate('passenger-chatlist')}
        >
          <Icon name="notifications" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      {rides.length > 0 && rides[0].status === 'started' && (
        <TouchableOpacity
          style={styles.endRideButton}
          onPress={() => handleEndMyRide(rides[0].ride._id)}
        >
          
          <Text style={styles.buttonText}>End My Ride</Text>
        </TouchableOpacity>
      )}
    


      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={rideStarted ? ['4%'] : ['35%', '50%', '75%']}
        initialSnapIndex={1}
      >
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeIndex === 0 && styles.activeTab]}
            onPress={() => handlePageChange(0)}
          >
            <Text style={[styles.tabText, activeIndex === 0 && styles.activeTabText]}>Accepted Rides</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeIndex === 1 && styles.activeTab]}
            onPress={() => handlePageChange(1)}
          >
            <Text style={[styles.tabText, activeIndex === 1 && styles.activeTabText]}>Requested Rides</Text>
          </TouchableOpacity>
        </View>

        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          <View key="1" style={styles.page}>
            <ScrollView style={styles.cardContainer}>
              {rides.length > 0 ? rides.map((ride, index) => (
                <View key={index} style={styles.rideCard}>
                  <Text style={styles.rideText}>Pickup: {ride.pickupLocation.map(pickup => pickup.name).join(', ')}</Text>
                  <Text style={styles.rideText}>Destination: {ride.destinationLocation.map(dest => dest.name).join(', ')}</Text>
                  <Text style={styles.rideText}>Date: {new Date(ride.datetime).toLocaleString()}</Text>
                  <Text style={styles.rideText}>Driver Name: {ride.driver.name}</Text>
                  <Text style={styles.rideText}>Driver Phone no. {ride.driver.mobile}</Text>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelAcceptedRide(ride._id)}>
                    <Text style={styles.buttonText}>Cancel Ride</Text>
                  </TouchableOpacity>
                </View>
              )) : (
                <Text style={styles.noRecordText}>No rides accepted yet.</Text>
              )}
            </ScrollView>
          </View>
          <View key="2" style={styles.page}>
            <ScrollView style={styles.cardContainer}>
              {requestedRides.length > 0 ? requestedRides.map((ride, index) => (
                <View key={index} style={styles.rideCard}>
                  <Text style={styles.rideText}>Pickup: {ride.pickupLocation.map(pickup => pickup.name)}</Text>
                  <Text style={styles.rideText}>Destination: {ride.destination.map(dest => dest.name)}</Text>
                  <Text style={styles.rideText}>Date: {new Date(ride.datetime).toLocaleString()}</Text>
                  <Text style={styles.rideText}>Requested Seats: {ride.noOfSeats}</Text>
                  <Text style={styles.rideText}>Gender Preference: {ride.gender}</Text>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelRequestedRide(ride._id)}>
                    <Text style={styles.buttonText}>Cancel Request</Text>
                  </TouchableOpacity>
                </View>
              )) : (
                <Text style={styles.noRecordText}>No requested rides found.</Text>
              )}
            </ScrollView>
          </View>
        </PagerView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
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
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
  },
  sheetText: {
    fontSize: 24,
    marginBottom: 24,
  },
  rideCard: {
    backgroundColor: '#e6e6e6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  rideText: {
    fontSize: 16,
    marginBottom: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
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
    width: '80%',
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

export default BookedRides;
