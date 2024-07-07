import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import { Image } from 'react-native-svg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RNPickerSelect from 'react-native-picker-select';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';

import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';

const citiestNames = [
    'Islamabad',
    'Karachi',
    'Lahore',
    'Faisalabad',
    'Rawalpindi',
    'Multan',
    'Peshawar',
    'Quetta',
    'Sialkot',
    'Gujranwala',
    'Abbottabad',
    'Bahawalpur',
    'Sargodha',
    'Sukkur',
    'Gujrat',
    'Jhelum',
    // ... add more district names as needed
];

const districtNames = [
    'Abbottabad',
    'Attock',
    'Badin',
    'Bahawalnagar',
    'Bahawalpur',
    'Bannu',
    'Bhakkar',
    'Bhimber',
    'Chakwal',
    'Chiniot',
    'Dadu',
    'Dera Ghazi Khan',
    'Dera Ismail Khan',
    'Faisalabad',
    'Ghotki',
    'Gujranwala',
    'Gujrat',
    'Hafizabad',
    'Haripur',
    'Hyderabad',
    'Islamabad',
    'Jacobabad',
    'Jhang',
    'Jhelum',
    'Karak',
    'Kasur',
    'Khairpur',
    'Khanewal',
    'Khushab',
    'Kohat',
    'Kotli',
    'Lahore',
    'Larkana',
    'Layyah',
    'Lodhran',
    'Mandi Bahauddin',
    'Mansehra',
    'Mardan',
    'Mianwali',
    'Mirpur',
    'Mirpur Khas',
    'Multan',
    'Muzaffargarh',
    'Nankana Sahib',
    'Narowal',
    'Naushahro Feroze',
    'Nawabshah',
    'Nowshera',
    'Okara',
    'Pakpattan',
    'Peshawar',
    'Quetta',
    'Rahim Yar Khan',
    'Rajanpur',
    'Rawalakot',
    'Rawalpindi',
    'Sahiwal',
    'Sargodha',
    'Sheikhupura',
    'Shikarpur',
    'Sialkot',
    'Sukkur',
    'Swabi',
    'Swat',
    'Tando Allahyar',
    'Tando Muhammad Khan',
    'Tank',
    'Tharparkar',
    'Thatta',
    'Timergara',
    'Toba Tek Singh',
    'Vehari',
    'Wazirabad',
    'Zhob',
];

function DriverProfile({ navigation }) {
    const [fullName, setFullName] = useState('');
    const [Email, setEmail] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');

    const [visible, setVisible] = useState(false);

    // using state for handling the image
    const [image, setImage] = useState(null);


    const takePhotoFromCamera = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                alert("You've refused to allow this app to access your camera!");
                return;
            }
    
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });
    
            if (!result.canceled && result.assets) {
                console.log("Selected image URI: ", result.assets[0].uri);
                setImage(result.assets[0].uri);
                setVisible(false);
            }
        } catch (error) {
            console.error("Error taking photo: ", error);
        }
    };

    const choosePhotoFromLibrary = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert("You've refused to allow this app to access your photos!");
                return;
            }
    
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });
    
            if (!result.canceled && result.assets) {
                console.log("Selected image URI: ", result.assets[0].uri);
                setImage(result.assets[0].uri);
                setVisible(false);
            }
        } catch (error) {
            console.error("Error selecting image: ", error);
        }
    };
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.customBackButton}
                onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" style={styles.Icon} />
                <Text style={styles.customTextButton}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Profile</Text>

            <View style={{ alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setVisible(true)}>
                    <View
                        style={{
                            height: 120,
                            width: 120,
                            borderRadius: 50,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderColor: 'red',
                        }}>
                        <ImageBackground
                            source={{ uri: image }}
                            style={{ marginTop: 20, height: 120, width: 120, borderRadius: 50, backgroundColor: 'gray' }}
                            imageStyle={{ borderRadius: 50 }}>
                            <View>
                                <Icon
                                    name="camera"
                                    color="#008955"
                                    size={35}
                                    style={{
                                        opacity: 0.7,
                                        position: 'absolute',
                                        right: 8,
                                        top: 95,
                                        borderWidth: 1,
                                        borderColor: '#008955',
                                        borderRadius: 10,
                                    }}
                                />
                            </View>
                        </ImageBackground>
                    </View>
                </TouchableOpacity>
            </View>

            <Modal
                style={{ width: '100%', marginLeft: 0, marginBottom: 0 }}
                isVisible={visible}
                onBackButtonPress={() => {
                    setVisible(false);
                }}
                animationIn={'slideInUp'}
                animationInTiming={500}
                backdropOpacity={0.4}>
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        left: 0,
                        backgroundColor: '#fff',
                        width: '100%',
                    }}>
                    <Text style={{ textAlign: 'center', fontSize: 28, fontWeight: '700' }}>
                        Upload Photo
                    </Text>
                    <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '300' }}>
                        Choose Your Profile Picture
                    </Text>

                    <TouchableOpacity
                        style={{
                            width: '100%',
                            height: 50,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                        onPress={takePhotoFromCamera}

                    >
                        <Entypo name="camera" style={[styles.Icon, { marginLeft: 10 }]} />
                        <Text
                            style={{
                                color: '#000',
                                marginLeft: 15,
                                fontSize: 20,
                                fontWeight: '400',
                            }}>
                            Camera
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            width: '100%',
                            height: 50,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                        onPress={choosePhotoFromLibrary}
                    >
                        <Entypo name="browser" style={[styles.Icon, { marginLeft: 10 }]} />
                        <Text
                            style={{
                                color: '#000',
                                marginLeft: 15,
                                fontSize: 20,
                                fontWeight: '400',
                            }}>
                            Gallery
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            width: '100%',
                            height: 50,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 10,
                        }}>
                        <AntDesign name="addfile" style={[styles.Icon, { marginLeft: 10 }]} />
                        <Text
                            style={{
                                color: '#000',
                                marginLeft: 15,
                                fontSize: 20,
                                fontWeight: '400',
                            }}>
                            Files
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Input From users */}
            <View style={styles.innerView}>
                <TextInput
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={text => setFullName(text)}
                    style={styles.inputStyle}
                />

                <TextInput
                    placeholder="Your mobile number"
                    value={phoneNo}
                    onChangeText={text => setPhoneNo(text)}
                    style={styles.inputStyle}
                />

                <TextInput
                    placeholder="Email"
                    value={Email}
                    onChangeText={text => setEmail(text)}
                    style={styles.inputStyle}
                />

                <TextInput
                    placeholder="Street"
                    value={street}
                    onChangeText={text => setStreet(text)}
                    style={styles.inputStyle}
                />

                <View style={styles.pickerContainer}>
                    {/* <Picker selectedValue={city} onValueChange={value => setCity(value)}>
            {citiestNames.map((Cities, index) => (
              <Picker.Item key={index} label={Cities} value={Cities} />
            ))}
          </Picker> */}
                    <RNPickerSelect
                        onValueChange={(value) => setCity(value)}
                        style={styles.pickerSelectStyle}
                        items={citiestNames.map(city => ({ label: city, value: city }))}
                        placeholder={{ label: 'Select City', value: null }}

                    />
                </View>

                <View style={styles.pickerContainer}>
                    {/* <Picker
                        selectedValue={district}
                        onValueChange={value => setDistrict(value)}>
                        {districtNames.map((district, index) => (
                            <Picker.Item key={index} label={district} value={district} />
                        ))}
                    </Picker> */}
                    <RNPickerSelect
                        onValueChange={(value) => setDistrict(value)}
                        style={styles.pickerSelectStyle}
                        items={districtNames.map(district => ({ label: district, value: district }))}
                        placeholder={{ label: 'Select District', value: null }}

                    />
                </View>
            </View>
            <View
                style={{
                    flex: 0.3,
                    marginTop: 200,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                }}>
                <TouchableOpacity style={styles.cancleButton}>
                    <Text style={styles.cancleButtonText}>Cancle</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => navigation.navigate('driverDocument')}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default DriverProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    Icon: {
        color: '#414141',
        fontSize: 22,
    },
    headerText: {
        fontSize: 28,
        color: '#0c0c0d',
        fontWeight: '400',
        textAlign: 'center',
        marginTop: -10,
    },

    //   user input Styles
    innerView: {
        flex: 0.7,
        alignItems: 'center',
        marginTop: 30,
    },
    inputStyle: {
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
    pickerContainer: {
        // borderWidth: 1,
        // borderColor: 'gray',
        borderRadius: 6,
        width: '93%',
        marginVertical: 15,
        fontSize: 20,
        height: 60,
    },
    //   Button Desing
    saveButton: {
        marginBottom: 10,
        width: '40%',
        backgroundColor: '#008955',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '500',
    },
    cancleButton: {
        marginBottom: 10,
        width: '40%',
        backgroundColor: 'transparent',
        borderColor: '#008955',
        borderWidth: 2,
        paddingVertical: 13,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    cancleButtonText: {
        color: '#008955', // Text color
        fontSize: 16,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '500',
    },

    //   Bottom Sheets styling
    header: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#333333',
        shadowOffset: { width: -1, height: -3 },
        shadowRadius: 2,
        shadowOpacity: 0.4,
        // elevation: 5,
        paddingTop: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    panelHeader: {
        alignItems: 'center',
    },
    panelHandle: {
        width: 40,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00000040',
        marginBottom: 10,
    },
    pickerSelectStyle: {
        inputIOS: {
            fontSize: 20,
            height: 60,
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 5,
            paddingRight: 30, // to ensure the text is never behind the icon
        },
        inputAndroid: {
            fontSize: 20,
            height: 60,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 5,
            paddingRight: 30, // to ensure the text is never behind the icon
        },
        placeholder: {
            color: 'gray',
        },
        iconContainer: {
            top: 10,
            right: 12,
        },
    },
});
