import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AvailableRides from './AvailableRides';
import BookedRides from './BookedRides';
import RequestRide from './RequestRide';
import AcceptedRideByDriver from './AcceptedRideByDriver';

const Tab = createBottomTabNavigator();

function PassengerMainHome() {
  return (
   
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Explore Rides') {
              iconName = 'directions-car';
            } else if (route.name === 'My Rides') {
              iconName = 'event';
            } else if (route.name === 'Request Ride') {
              iconName = 'add-circle-outline';
            } else if(route.name === 'Accepted Ride') {
              iconName = 'verified';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#008955',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Explore Rides" component={AvailableRides} options={{headerShown: false}} />
        <Tab.Screen name="My Rides" component={BookedRides} options={{headerShown: false}} />
        <Tab.Screen name="Request Ride" component={RequestRide} options={{headerShown: false}} />
        <Tab.Screen name="Accepted Ride" component={AcceptedRideByDriver} options={{headerShown: false}} />
      </Tab.Navigator>
    
  );
}

export default PassengerMainHome;


