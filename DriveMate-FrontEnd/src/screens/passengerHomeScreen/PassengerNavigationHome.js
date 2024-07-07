import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions, useNavigation, getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { ChatProvider } from '../../context/ChatContext';
import PassengerMainHome from './PassengerMainHome';
import PassengerLoginProfile from './PassengerLoginProfile';
import PassengerContent from './PassengerContent';
import PassengerChatScreen from './PassengerChatScreen';
import PassengerChatListScreen from './PassengerChatListScreen';
import PassengerRequestedRideChatScreen from './PassengerRequestedRideChatScreen';
import PassengerRequestedRide from '../driverHome/PassengerRequestedRide';
import PassengerRideHistory from './PassengerRideHistory';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const PassengerStack = () => {
  const navigation = useNavigation();
  const route = getFocusedRouteNameFromRoute(navigation.getState()) ?? 'PassengerMainScreen';
  const showDrawerIcon = route !== 'Chat';
  const insets = useSafeAreaInsets();

  return (

    <ChatProvider>


      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="PassengerMainScreen"
          component={PassengerMainHome}
          options={{
            headerShown: true,
            header: () => (
              <View style={styles.customHeader}>
                {showDrawerIcon && (
                  <TouchableOpacity
                    style={[styles.menuButton, { top: insets.top + 5, left: insets.left + 10 }]}
                    onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                  >
                    <Icon name="menu" size={30} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="PassengerLoginProfile"
          component={PassengerLoginProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={PassengerChatScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="passenger-chatlist"
          component={PassengerChatListScreen}
          options={{ headerShown: false }} />

        <Stack.Screen
          name="passenger-requested-ridechat"
          component={PassengerRequestedRideChatScreen}
          options={{headerShown: false}}        
        
        />

        
      </Stack.Navigator>
    </ChatProvider>
  );
};

const PassengerNavigationHome = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <PassengerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'transparent',
        drawerPosition: 'left',
        animationEnabled: true,
        swipeEdgeWidth: 100,  // Increase swipe edge width to make it easier to swipe open
        sceneContainerStyle: { backgroundColor: '#f5f5f5' },
      }}
    >
      <Drawer.Screen name="PassengerMain" component={PassengerStack} />
      <Drawer.Screen name="Passenger-Ride-History" component={PassengerRideHistory} />
    </Drawer.Navigator>
  );
};

export default PassengerNavigationHome;

const styles = StyleSheet.create({
  customHeader: {
    height: 5, 
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  menuButton: {
    position: 'absolute',
    zIndex: 1,
  },
});
