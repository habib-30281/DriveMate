import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions, Keyboard, TextInput, Text, TouchableOpacity, Platform, FlatList, Alert, TouchableWithoutFeedback, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';

import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

import { debounce } from 'lodash';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../../constant/Config';
function CreateRide() {
    const navigation = useNavigation();

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [date, setDate] = useState(new Date());
    const [selectGender, setSelectGender] = useState('');
    const [passenger, setPassenger] = useState('');

    const [destinationPlaces, setDestinationPlaces] = useState([]);
    const [pickupPlaces, setPickupPlaces] = useState([]);
    const [destination, setDestination] = useState(null);
    const [pickup, setPickup] = useState(null);

    const [destinationText, setDestinationText] = useState('');
    const [pickupText, setPickupText] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
    const [pricePerSeat, setPricePerSeat] = useState('');




    // const [showDatePicker, setShowDatePicker] = useState(false);


    // onChange function for current date
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        // setShowDatePicker(Platform.OS === 'ios' ? true : false);
        setDate(currentDate);
    };


    const bottomSheetRef = useRef(null);
    const mapRef = useRef(null);

    // This will be the initial snap point, and `1` represents the expanded state.
    const snapPoints = useMemo(() => ['32%', '50%', '90%'], []);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    let text = 'Map is Loading !!! Waiting...';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    // Search the place in search bar.......
    const fetchPlaces = async (input, type) => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=pk&q=${input}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (type === 'destination') {
                setDestinationPlaces(data);
            } else {
                setPickupPlaces(data);
            }
        } catch (error) {
            console.error('Failed to fetch places', error);
        }
    };


    //change location after new destination or pickup location is initiate 
    const onLocationSelect = (item, type) => {
        const newRegion = {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        };
        mapRef.current?.animateToRegion(newRegion, 1000); // Animate to region

        if (type === 'destination') {
            setDestination(newRegion);
            console.log(destination);

            setDestinationText(item.display_name);
            setDestinationPlaces([item]);

        } else {
            setPickup(newRegion);
            console.log(pickup);
            // setPickupPlaces([]);
            setPickupText(item.display_name);
            setPickupPlaces([item]);

        }
        setShowSuggestions(false);
        setShowPickupSuggestions(false);
    };

    useEffect(() => {
        console.log('Destination:', destination);
    }, [destination]); // This will run every time destination changes

    useEffect(() => {
        console.log('Pickup location: ', pickup);
    }, [pickup])

    const debouncedFetchPlaces = useMemo(() => debounce((text, type) => {
        fetchPlaces(text, type);
    }, 300), []); // Debounce API calls by 300ms

    const handleSearchChange = (text, type) => {
        if (type === 'destination') {
            setDestination(null);
            setDestinationPlaces([]);
            setShowSuggestions(text !== '');
        } else {
            setPickup(null);
            setPickupPlaces([]);
            setShowPickupSuggestions(text !== '');
        }
        debouncedFetchPlaces(text, type);


    };

    const handlePressOutside = () => {
        setShowSuggestions(false); // Dismiss the suggestions when pressed outside the FlatList
        setShowPickupSuggestions(false);
    };



    async function handleSubmitRideDetails() {

        if (!destination || !pickup) {
            console.error('Destination or pickup is null');
            return; // Exit the function early if destination or pickup is null
        }
        const rideData = {
            destination: destinationPlaces,
            pickupLocation: pickupPlaces,
            datetime: date,
            gender: selectGender,
            passengers: passenger,
            pricePerSeat: parseFloat(pricePerSeat),

        };

        // Retrieve the token from AsyncStorage

        const token = await AsyncStorage.getItem("Drivertoken");
        if (!token) {
            Alert.alert("Authentication Error", "No authentication token found.");
            return;
        }

        // Configure the header with the token
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        console.log("Config Headers for Request:", config);

        axios.post(`${Config.apiBaseUrl}/createRide`, rideData, config)
            .then(res => {

                if (res.data.status === "Success") {
                    Alert.alert("Registered Successfully!");
                    //perform navigation.
                    setDestinationText('');
                    setPickupText('');
                    setDestinationPlaces([]);
                    setPickupPlaces([]);
                    setDestination(null);
                    setPickup(null);
                    setDate(new Date());
                    setPricePerSeat('');
                    setPassenger('');
                    setSelectGender('');
                    setTimeout(() => {
                        navigation.navigate('Track Rides');
                    }, 0);


                } else {
                    // Handle unexpected status codes or response data
                    Alert.alert("Ride creation failed", res.data.data);
                }

            }).catch(e => {
                // Handle cases where the server returns a response (e.g., non-2xx status)
                if (e.response) {
                    console.log(e.response.data);
                    Alert.alert("Server Error", e.response.data.message || "An unexpected error occurred.");
                } else {
                    console.log(e.message);
                    Alert.alert("Network Error", "Please check your internet connection and try again.");
                }
            });

    }


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

      
        <View style={styles.container}>
            {location ? (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.005, // Smaller delta for closer zoom
                        longitudeDelta: 0.005, // Smaller delta for closer zoom
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title="Your Location"
                    />
                    {pickup && <Marker coordinate={pickup} title="Pickup Location" />}
                    {destination && <Marker coordinate={destination} title="Destination" />}

                </MapView>

            ) : (
                <Text style={styles.waitingText}>{text}</Text>
            )}


            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                borderRadius={10}
            >
                <BottomSheetView style={styles.bottomSheetContent}>
                    
                    


                        <Text style={styles.sheetText}>Create Your Ride</Text>


                        {/* You can place other UI elements like forms or buttons here */}


                        {/* Enter you Destination  */}

                        
                        <View style={styles.searchSection}>
                            <Icon style={styles.searchIcon} name="search" size={20} color="#000" />
                            <TextInput
                                style={styles.input}
                                placeholder="Search Destination"
                                onChangeText={(text) => {
                                    setDestinationText(text);
                                    handleSearchChange(text, 'destination');
                                }}
                                value={destinationText}
                            />
                        </View>

                        {/* suggestion list for destination places */}

                        {showSuggestions && (
                            <TouchableWithoutFeedback onPress={handlePressOutside}>
                                <View style={styles.suggestionsContainer}>
                                    <FlatList
                                        data={destinationPlaces}
                                        keyExtractor={(item) => item.place_id.toString()}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity onPress={() => onLocationSelect(item, 'destination')}>
                                                <Text style={{fontSize: 16}}>{item.display_name}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        )}



                        {/* Enter you PickUp locaiton */}
                        <View style={styles.searchSection}>
                            <Icon style={styles.searchIcon} name="search" size={20} color="#000" />
                            <TextInput
                                style={styles.input}
                                placeholder="Search Pickup Location"
                                onChangeText={(text) => {
                                    setPickupText(text);
                                    handleSearchChange(text, 'pickup');
                                }}
                                value={pickupText}
                            />
                        </View>

                        {/* suggestion places for pickup places */}
                        {showPickupSuggestions && (
                            <TouchableWithoutFeedback onPress={handlePressOutside}>
                                <View style={styles.suggestionsPickUpContainer}>
                                    <FlatList
                                        data={pickupPlaces}
                                        keyExtractor={(item) => item.place_id.toString()}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity onPress={() => onLocationSelect(item, 'pickup')}>
                                                <Text style={{fontSize: 16}} >{item.display_name}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        )}




                        {/* Select Date and time of the Ride  */}

                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.dateTimeText}>Select Date and Time for Ride:</Text>
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={date}
                                mode="datetime"
                                is24Hour={true}
                                display="default"
                                onChange={onChange}
                                style={styles.dateTimePicker}
                            />
                        </View>

                        <View style={styles.searchSection}>
                            <Icon style={styles.searchIcon} name="attach-money" size={20} color="#000" />
                            <TextInput
                                style={styles.input}
                                placeholder="Price per Seat"
                                keyboardType="numeric"
                                onChangeText={(text) => setPricePerSeat(text)}
                                value={pricePerSeat}
                            />
                        </View>



                        {/* co passenger  */}

                        <View style={styles.searchSection}>

                            <Icon style={styles.searchIcon} name="arrow-drop-down" size={20} color="#000" />

                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setSelectGender(value)}
                                    style={styles.pickerSelectStyle}
                                    placeholder={{ label: 'Select Gender' }}
                                    items={[

                                        { label: 'Male', value: 'male' },
                                        { label: 'Female', value: 'female' },
                                    ]}

                                />

                            </View>

                        </View>




                        {/* Number of available seats */}

                        <View style={styles.searchSection}>

                            <Icon style={styles.searchIcon} name="arrow-drop-down" size={20} color="#000" />

                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setPassenger(value)}
                                    style={styles.pickerSelectStyle}
                                    placeholder={{ label: 'Select No. of passenger' }}
                                    items={[

                                        { label: '1', value: 1 },
                                        { label: '2', value: 2 },
                                        { label: '3', value: 3 },
                                        { label: '4', value: 4 },
                                    ]}

                                />

                            </View>

                        </View>

                        {/* Create Ride Button */}

                        <TouchableOpacity
                            style={[
                                styles.createRideButton,
                                { marginTop: -4 }
                            ]}
                            onPress={() => handleSubmitRideDetails()}
                        >
                            <Text style={styles.createRideBtnText}>Create Ride</Text>
                        </TouchableOpacity>

                  
                </BottomSheetView>
            </BottomSheet>

        </View>
        </TouchableWithoutFeedback>
    );
}

export default CreateRide;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    waitingText: {
        position: 'absolute', // Position it over other elements
        top: '50%', // Center vertically
        left: '30%', // Center horizontally
        transform: [{ translateX: -50 }, { translateY: -50 }], // Offset by 50% of its size to truly center it
        fontSize: 20, // Larger text size
        color: 'grey' // Grey text color
    },
    bottomSheetContent: {
        // alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
    },
    sheetText: {
        fontSize: 24,
        marginBottom: 24,
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 20,
        padding: 10,
        marginBottom: 30,
    },
    searchIcon: {
        padding: 10,
        fontSize: 22,
        color: '#424242',
    },
    input: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 0,
        paddingBottom: 10,
        paddingLeft: 0,
        backgroundColor: '#f2f2f2',
        color: '#424242',
        borderRadius: 20,
        fontSize: 18,
    },
    suggestionsContainer: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        width: '90%', // Adjust the width to fit the input field
        maxHeight: 200,
        zIndex: 1,
        top: '18%', // Position it just below the input field
        left: '10%', // Align it with the input field
        marginTop: 5, // Add some space between input field and suggestions
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 6,
    },
    suggestionsPickUpContainer: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        width: '90%', // Adjust the width to fit the input field
        maxHeight: 200,
        zIndex: 1,
        top: '30%', // Position it just below the input field
        left: '10%', // Align it with the input field
        marginTop: 10, // Add some space between input field and suggestions
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 6,
    },

    dateTimePickerSection: {
        marginTop: 20,
        alignItems: 'center',
        width: '100%',
    },

    dateTimeContainer: {
        padding: 15,
        backgroundColor: '#fff', // or any color that fits your app theme
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        marginBottom: 30, // To provide space from the bottom or next component
    },
    dateTimeText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333', // or any color that fits your app theme
    },
    dateTimePicker: {
        width: '100%',
    },
    pickerSelectStyle: {
        inputIOS: {
            fontSize: 18,
            borderRadius: 5,
            marginBottom: 4,
        },
        inputAndroid: {
            fontSize: 18,
            borderRadius: 5,
            marginBottom: 4,
        },
        placeholder: {
            color: '#424242',
            fontSize: 18,
        },
        iconContainer: {
            top: 10,
            right: 12,
        },
    },
    createRideButton: {
        marginTop: 30,
        marginBottom: 20,
        width: '93%',
        backgroundColor: '#008955',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginLeft: 15,
        marginRight: 15,
    },
    createRideBtnText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '500',
    },


});
