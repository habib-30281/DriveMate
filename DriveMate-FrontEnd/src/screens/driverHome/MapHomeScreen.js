import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import or define your screens
import CreateRide from './CreateRide';
import TrackRide from './TrackRide';
import PassengerBookedRide from './PassengerBookedRide';
import PassengerRequestedRide from './PassengerRequestedRide';

const Tab = createBottomTabNavigator();

function MapHomeScreen() {
  return (
   
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Create Rides') {
              iconName = 'directions-car';
            } else if (route.name === 'Track Rides') {
              iconName = 'event';
            } else if (route.name === 'Booked Rides') {
              iconName = 'add-circle-outline';
            } else if(route.name === 'Requested Rides'){
              iconName = 'transfer-within-a-station';
            }

            // Return any component that you like here!
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#008955',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Create Rides" component={CreateRide} options={{headerShown: false}} />
        <Tab.Screen name="Track Rides" component={TrackRide} options={{headerShown: false}} />
        <Tab.Screen name="Booked Rides" component={PassengerBookedRide} options={{headerShown: false}} />
        <Tab.Screen name="Requested Rides" component={PassengerRequestedRide} options={{headerShown: false}} />
      </Tab.Navigator>
    
  );
}

export default MapHomeScreen;

const styles = StyleSheet.create({
  // Add any styles for your components here
});
