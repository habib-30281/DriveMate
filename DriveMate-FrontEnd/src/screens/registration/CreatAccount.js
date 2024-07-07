import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreatAccount = ({navigation}) => {
  const clearOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('@viewedOnboarding');
    } catch (err) {
      console.log('Error while removing item', err);
    }
  };
  return (
    <View style={styles.container}>
      <Image
        style={styles.welcomeImg}
        source={require('../../assets/img/WelcomeScreen.jpg')}
      />

      <Text style={styles.headerText}>Welcome</Text>
      <Text style={styles.descriptionText}>
        Have a better sharing experience
      </Text>

      {/* Clear onboarding Async Storage */}
      {/* <TouchableOpacity onPress={clearOnboarding}>
            <Text style={{fontSize: 24, marginTop: -30}}>Clear the Onboarding</Text>
        </TouchableOpacity> */}
      <TouchableOpacity
        style={styles.creactAccountButton}
        onPress={() => navigation.navigate('profile', {action: 'createAccount', nextScreen: 'CreateAccountRoleSpecific'})}>
        <Text style={styles.creatAccountBtnText}>Create an account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginAccountButton}
       onPress={() => navigation.navigate('profile', {action: 'login',  nextScreen: 'LoginRoleSpecific' })} >
        <Text style={styles.logInAccountBtnText}>Log In</Text>
      </TouchableOpacity>
      
    </View>
  );
};

export default CreatAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  welcomeImg: {
    resizeMode: 'contain',
    marginTop: 100, //need to change to normal
    width: '100%',
    height: 300,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#414141',
    marginTop: 40,
  },
  descriptionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A0A0A0',
    marginTop: 10,
    marginBottom: 180,  //need to change to normal
  },
  creactAccountButton: {
    marginBottom: 20,
    width: '90%',
    backgroundColor: '#008955',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  loginAccountButton: {
    marginBottom: 20,
    width: '90%',
    backgroundColor: 'transparent',
    borderColor: '#008955',
    borderWidth: 2,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  creatAccountBtnText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
  },
  logInAccountBtnText: {
    color: '#008955', // Text color
    fontSize: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
  },
});
