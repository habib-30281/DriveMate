import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
function PassengerRegComplete() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.customBackButton}
        onPress={() => navigation.goBack()}>
        <AntDesign name="arrowleft" style={styles.Icon} />
        <Text style={styles.customTextButton}>Back</Text>
      </TouchableOpacity>
      <View style={{marginTop: 60}}>
        <Text style={styles.headerText}>Thanks for Registration</Text>
        <Text style={styles.descriptionText}>
          The Registration process may{'\n'} take few days
        </Text>
      </View>

      <Image
        style={styles.welcomeImg}
        source={require('../../../assets/img/complete.jpg')}
      />

      <TouchableOpacity
        style={[styles.registerAccountButton]}
        onPress={() => navigation.navigate('createAccount')}>
        <Text style={styles.registerAccountBtnText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

export default PassengerRegComplete;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
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
    fontWeight: '500',
    color: '#414141',
  },
  headerText: {
    fontSize: 28,
    marginTop: 8,
    color: '#0c0c0d',
    padding: 10,
    fontWeight: '400',
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 18,
    color: '#0c0c0d',
    fontWeight: '200',
    textAlign: 'center',
  },
  welcomeImg: {
    resizeMode: 'contain',
    marginTop: 50,
    width: '100%',
    height: 400,
  },
  registerAccountButton: {
    marginTop: 60,
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
});
