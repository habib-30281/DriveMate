import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  Image,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const Profile = ({route, navigation}) => {

  const { action } = route.params; 
  const headingText = action === 'createAccount' ? 'Start Your Journey with Us! Choose Your Profile.' : 'Select Your Profile for Login';

  const handleRoleSelection = (role) => {
    // Determine the next screen based on the action and role
    let targetScreen = '';
    if (action === 'createAccount') {
      targetScreen = role === 'driver' ? 'driver' : 'passenger';
    } else if (action === 'login') {
      targetScreen = role === 'driver' ? 'driverLogin' : 'passengerLogin';
    }
    navigation.navigate(targetScreen);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.customBackButton}
        onPress={() => navigation.goBack()}>
        <AntDesign name="arrowleft" style={styles.Icon} />
        <Text style={styles.customTextButton}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.headerText}>{headingText}</Text>
      <View style={styles.imgView}>
        <Pressable onPress={() => handleRoleSelection('driver')}>
          <Image
            style={styles.driverImg}
            source={require('../../assets/img/driver.jpg')}
          />
          <Text
            style={{
              marginBottom: 20,
              fontSize: 24,
              color: '#008955',
              textAlign: 'center',
            }}>
            Driver
          </Text>
        </Pressable>
        <View style={styles.horizontalLine} />

        <Pressable onPress={() => handleRoleSelection('passenger')}>
          <Image
            style={styles.passengerImg}
            source={require('../../assets/img/passenger.jpg')}
          />
          <Text style={{marginTop: 10, fontSize: 24, color: '#008955', textAlign: 'center'}}>
            Passenger
          </Text>
        </Pressable>
        
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  headerText: {
    fontSize: 28,
    textAlign: 'center',
    marginTop: 20,
    color: '#414141',
  },
  imgView: {
    flex: 0.8,
    alignItems: 'center',
  },
  driverImg: {
    marginVertical: 30,
    width: 200,
    height: 200,
    resizeMode: 'contain',
    borderRadius: 100,
  },
  horizontalLine: {
    width: '80%', // Set the desired width of the line
    borderBottomColor: 'black', // Change the color as needed
    borderBottomWidth: 1, // Set the desired thickness of the line
    marginVertical: 20, // Adjust the vertical spacing
  },
  passengerImg: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    borderRadius: 100,
    marginVertical: 30,
  },
});
