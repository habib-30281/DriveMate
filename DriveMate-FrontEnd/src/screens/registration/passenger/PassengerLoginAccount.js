import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../../../constant/Config';

function PassengerLoginAccount() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [Email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isPasswordValid = () => {
    // Add your password validation logic here
    return password.length >= 8 && /[A-Z]/.test(password);
  };

  function handleSubmit() {
    const userData = {
      email: Email,
      password: password,
    };

    axios.post(`${Config.apiBaseUrl}/login-passenger`, userData)
      .then(res => {
        if (res.data && res.data.token) { // Assuming your API sends a token on successful login
          AsyncStorage.setItem("Passengertoken", res.data.token)
            .then(() => {
              AsyncStorage.setItem("isPassengerLoggedIn", JSON.stringify(true))
                .then(() => {
                  Alert.alert("Passenger, Logged In Successfully");
                  navigation.navigate("passengerHome");
                })
                .catch(error => {
                  console.error("Storage error:", error);
                  setErrorMessage('Error storing login status');
                });
            })
            .catch(error => {
              console.error("Storage error:", error);
              setErrorMessage('Error storing token');
            });
        } else {
          throw new Error("No token received");
        }
      })
      .catch(error => {
        console.error("Login error:", error.response ? error.response.data : error);
        setErrorMessage('Email or password is incorrect');
      });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.customBackButton}
        onPress={() => navigation.goBack()}>
        <AntDesign name="arrowleft" style={styles.Icon} />
        <Text style={styles.customTextButton}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.headerText}>Login your Passenger Account</Text>

      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        value={Email}
        onChangeText={text => {
          setEmail(text);
          setErrorMessage(''); // Clear error message when user modifies email
        }}
        style={[styles.input, { marginTop: 30 }]}
      />

      <View style={[styles.passwordView, { marginTop: 10 }]}>
        <TextInput
          secureTextEntry={!showPassword}
          placeholder="Enter your password"
          value={password}
          onChangeText={text => {
            setPassword(text);
            setErrorMessage(''); // Clear error message when user modifies password
          }}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.eyeIcon}>
          {showPassword ? (
            <Entypo name="eye" size={24} color="black" />
          ) : (
            <Entypo name="eye-with-line" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>

      <Text
        style={[styles.customTextButton, { marginLeft: 15, fontWeight: 'normal', color: 'red' }]}>
        {errorMessage}
      </Text>

      <TouchableOpacity
        style={styles.registerAccountButton}
        onPress={handleSubmit}>
        <Text style={styles.registerAccountBtnText}>Login</Text>
      </TouchableOpacity>

     
    </View>
  );
}

export default PassengerLoginAccount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Icon: {
    color: '#414141',
    fontSize: 22,
  },
  customBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginLeft: 2,
  },
  customTextButton: {
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '500',
    color: '#414141',
  },
  headerText: {
    fontSize: 28,
    marginTop: 10,
    color: '#414141',
    padding: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
  input: {
    height: 60,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    width: '93%',
    borderRadius: 6,
    margin: 10,
    paddingHorizontal: 30,
    paddingVertical: 10,
    fontSize: 20,
  },
  passwordView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 35,
    color: '#008955',
  },
  registerAccountButton: {
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
  registerAccountBtnText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});
