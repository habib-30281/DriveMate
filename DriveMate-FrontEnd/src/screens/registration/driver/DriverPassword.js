import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useRoute } from '@react-navigation/native'; // Import useRoute
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';


function DriverPassword() {
  const route = useRoute(); // Use the useRoute hook
  const navigation = useNavigation();
  const { name, email, phoneNo, selectGender, age } = route.params || {};; // Extract params, defaulting to an empty object

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  //handle the data transfering into database
  function handleSubmit() {

    navigation.navigate('driverDocument', {
      name,
      email,
      phoneNo,
      selectGender,
      age,
      password,

    });
    // const driverData = {
    //   name,
    //   email,
    //   mobile: phoneNo,
    //   gender: selectGender,
    //   age,
    //   password,
    // };

    // axios.post("http://192.168.100.3:5001/driver/register", driverData)
    //   .then(res => {
    //     console.log(res.data);
    //     if (res.data.status == "ok") { // Assuming 201 Created is the success status code
    //       Alert.alert("Registration Successful", "You have registered successfully!");
    //       // Consider using reset or replace to navigate
    //       //navigation.navigate('passengerRegComplete');
    //     } else {
    //       // Handle other statuses with meaningful messages if needed
    //       Alert.alert(JSON.stringify(res.data));
    //     }
    //   })
    //   .catch(e => console.log(e.response));
  }


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPassVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const isPasswordValid = () => {
    // Add your password validation logic here
    return password.length >= 8 && /[A-Z]/.test(password);
  };
  // checking the password validity b/w current and entered password
  const isCurrentPasswordValid = () => {
    return password === confirmPassword;
  };

  const isRegisterDisabled = () => {
    return !isPasswordValid() || !isCurrentPasswordValid();
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.customBackButton}
        onPress={() => navigation.goBack()}>
        <AntDesign name="arrowleft" style={styles.Icon} />
        <Text style={styles.customTextButton}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.headerText}>Set Your Password </Text>
      <Text>name: {name}</Text>
      <Text>email: {email}</Text>
      <Text>phoneno: {phoneNo}</Text>

      {/* Password */}
      <View style={[styles.passwordView, { marginTop: 30 }]}>
        <TextInput
          secureTextEntry={!showPassword}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
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

      {/* Confirm Password */}
      <View style={styles.passwordView}>
        <TextInput
          secureTextEntry={!showConfirmPassword}
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={toggleConfirmPassVisibility}
          style={styles.eyeIcon}>
          {showConfirmPassword ? (
            <Entypo name="eye" size={24} color="black" />
          ) : (
            <Entypo name="eye-with-line" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>
      <Text
        style={[
          styles.customTextButton,
          { marginLeft: 15, fontWeight: 'normal' },
        ]}>
        Atleast 1 number or a special character
      </Text>

      {password.length > 0 && isCurrentPasswordValid() && (
        <Text style={styles.successText}>
          Entered password matches the current password.
        </Text>
      )}
      {/* Register button */}
      <TouchableOpacity
        style={[styles.registerAccountButton, { marginTop: 60 }, isRegisterDisabled() && styles.disabledButton,]}
        onPress={() => handleSubmit()}
        disabled={isRegisterDisabled()}>
        <Text style={styles.registerAccountBtnText}>Register</Text>
      </TouchableOpacity>

      {password.length > 0 && !isPasswordValid() && (
        <Text style={styles.errorText}>
          Password must be at least 8 characters and contain an uppercase
          letter.
        </Text>
      )}
    </View>
  );
}

export default DriverPassword;

const styles = StyleSheet.create({
  container: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginVertical: 10,
    flex: 1,
    // alignItems: 'center',
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
    fontWeight: '500',
    color: '#414141',
  },
  headerText: {
    fontSize: 28,
    marginTop: 10,
    color: '#0c0c0d',
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
    // fontSize: 22,
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
    fontSize: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  successText: {
    color: 'green',
    marginTop: 5,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
});
