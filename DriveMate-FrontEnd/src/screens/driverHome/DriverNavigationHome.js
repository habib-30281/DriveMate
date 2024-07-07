import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions, useNavigation, getFocusedRouteNameFromRoute } from '@react-navigation/native';

import MapHomeScreen from './MapHomeScreen';
import DriverContent from './DriverContent';
import DriverLoginProfile from './DriverLoginProfile';
import DriverChatScreen from './DriverChatScreen';
import ChatListScreen from './ChatListScreen';
import DriverRequestedRideChatScreen from './DriverRequestedRideChatScreen';
import DriverRideHistory from './DriverRideHistory';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const DriverStack = () => {
  const navigation = useNavigation();
  const route = getFocusedRouteNameFromRoute(navigation.getState()) ?? 'MapHomeScreen';
  const showDrawerIcon = route !== 'DriverChat';
  const insets = useSafeAreaInsets();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MapHomeScreen"
        component={MapHomeScreen}
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
        name="DriverLoginProfile"
        component={DriverLoginProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="DriverChat" component={DriverChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="chatlist" component={ChatListScreen} options={{headerShown: false}} />
      <Stack.Screen name="requested-Ride-Chat" component={DriverRequestedRideChatScreen} options={{headerShown: false}} />

    </Stack.Navigator>
  );
};

const DriverNavigationHome = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <DriverContent {...props} />}
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
      <Drawer.Screen name="DriverMain" component={DriverStack} />
      <Drawer.Screen name="Driver-Ride-History" component={DriverRideHistory} />
    </Drawer.Navigator>
  );
};

export default DriverNavigationHome;

const styles = StyleSheet.create({
  customHeader: {
    height: 5, // Adjust the height as needed
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  menuButton: {
    position: 'absolute',
    zIndex: 1,
  },
});
