import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Onboarding from './src/screens/onboarding/Onboarding';
import CreatAccount from './src/screens/registration/CreatAccount';
import Profile from './src/screens/registration/Profile';
import { navigationRef } from './src/services/NavigationService';

// Passenger and Driver screens import
import PassengerRegistration from './src/screens/registration/passenger/PassengerRegistration';
import PassengerPassword from './src/screens/registration/passenger/PassengerPassword';
import PassengerProfile from './src/screens/registration/passenger/PassengerProfile';
import PassengerRegComplete from './src/screens/registration/passenger/PassengerRegComplete';
import DriverRegistration from './src/screens/registration/driver/DriverRegistration';
import DriverPassword from './src/screens/registration/driver/DriverPassword';
import DriverProfile from './src/screens/registration/driver/DriverProfile';
import DriverDocuments from './src/screens/registration/driver/DriverDocuments';
import DriverLicenses from './src/screens/registration/driver/DriverLicenses';
import DriverRegComplete from './src/screens/registration/driver/DriverRegComplete';
import DriverLoginAccount from './src/screens/registration/driver/DriverLoginAccount';
import PassengerLoginAccount from './src/screens/registration/passenger/PassengerLoginAccount';
import PassengerNavigationHome from './src/screens/passengerHomeScreen/PassengerNavigationHome';
import DriverNavigationHome from './src/screens/driverHome/DriverNavigationHome';
import { ChatProvider } from './src/context/ChatContext';

const Loading = () => {
  return (
    <View>
      <ActivityIndicator size="large" />
    </View>
  );
};

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [viewedOnboarding, setViewedOnboarding] = useState(false);
  const [isDriverLoggedIn, setDriverLoggedIn] = useState(false);
  const [isPassengerLoggedIn, setPassengerLoggedIn] = useState(false);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('@viewedOnboarding');
      if (value !== null) {
        setViewedOnboarding(true);
      }
    } catch (err) {
      console.log('Error @checkOnboarding: ', err);
    } finally {
      setLoading(false);
    }
  };

  async function getDriverLoggedIn() {
    const data = await AsyncStorage.getItem('isDriverLoggedIn');
    setDriverLoggedIn(data === 'true');
  }

  async function getPassengerLoggedIn() {
    const data = await AsyncStorage.getItem('isPassengerLoggedIn');
    setPassengerLoggedIn(data === 'true');
  }

  useEffect(() => {
    checkOnboarding();
    getDriverLoggedIn();
    getPassengerLoggedIn();
  }, []);

  const StackNav = () => {
    const InitialScreen = ({ navigation }) => {
      return loading ? <Loading /> : viewedOnboarding ? <CreatAccount navigation={navigation} /> : <Onboarding />;
    };

    return (
      <Stack.Navigator>
        <Stack.Screen name="onboarding" component={InitialScreen} options={{ headerShown: false }} />
        <Stack.Screen name="createAccount" component={CreatAccount} options={{ headerShown: false }} />
        <Stack.Screen name="profile" component={Profile} options={{ headerShown: false }} />
        <Stack.Screen name="passenger" component={PassengerRegistration} options={{ headerShown: false }} />
        <Stack.Screen name="passengerPassword" component={PassengerPassword} options={{ headerShown: false }} />
        <Stack.Screen name="passengerProfile" component={PassengerProfile} options={{ headerShown: false }} />
        <Stack.Screen name="passengerRegComplete" component={PassengerRegComplete} options={{ headerShown: false }} />
        <Stack.Screen name="driver" component={DriverRegistration} options={{ headerShown: false }} />
        <Stack.Screen name="driverPassword" component={DriverPassword} options={{ headerShown: false }} />
        <Stack.Screen name="driverProfile" component={DriverProfile} options={{ headerShown: false }} />
        <Stack.Screen name="driverDocument" component={DriverDocuments} options={{ headerShown: false }} />
        <Stack.Screen name="driverLicenses" component={DriverLicenses} options={{ headerShown: false }} />
        <Stack.Screen name="driverRegComplete" component={DriverRegComplete} options={{ headerShown: false }} />
        <Stack.Screen name="passengerLogin" component={PassengerLoginAccount} options={{ headerShown: false }} />
        <Stack.Screen name="driverLogin" component={DriverLoginAccount} options={{ headerShown: false }} />
        <Stack.Screen name="passengerHome" component={PassengerNavigationHome} options={{ headerShown: false }} />
        <Stack.Screen name="driverNavigationHome" component={DriverNavigationHome} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  };

  return (
    <SafeAreaProvider>
      <ChatProvider>
        <NavigationContainer ref={navigationRef}>
          {isDriverLoggedIn ? (
            <DriverNavigationHome />
          ) : isPassengerLoggedIn ? (
            <PassengerNavigationHome />
          ) : (
            <StackNav />
          )}
        </NavigationContainer>
      </ChatProvider>
    </SafeAreaProvider>
  );
}
