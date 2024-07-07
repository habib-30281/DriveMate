import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

function PassengerRegistration() {
    const navigation = useNavigation();
    const loginNavigation = useNavigation();
    const [Name, setName] = useState('');
    const [Email, setEmail] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [selectGender, setSelectGender] = useState('');
    const [Age, setAge] = useState('');
    const [errors, setErrors] = useState({});//handle the form validation error 

    //form validation function 
    const validate = () => {
        let isValid = true;
        let errors = {};

        // Name validation
        if (!Name.trim()) {
            errors.Name = 'Name is required';
            isValid = false;
        }

        // Email validation
        if (!Email.trim()) {
            errors.Email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(Email)) {
            errors.Email = 'Invalid email format';
            isValid = false;
        }

        // Phone number validation
        if (!phoneNo.trim()) {
            errors.phoneNo = 'Phone number is required';
            isValid = false;
        } else if (!/^\d{11}$/.test(phoneNo)) {
            errors.phoneNo = 'Invalid phone number, must be 11 digits';
            isValid = false;
        }

        // Gender validation
        if (!selectGender) {
            errors.selectGender = 'Please select a gender';
            isValid = false;
        }

        // Age validation
        if (!Age.trim()) {
            errors.Age = 'Age is required';
            isValid = false;
        } else if (!/^\d+$/.test(Age) || Age < 1 || Age > 120) {
            errors.Age = 'Invalid age, must be a number between 1 and 120';
            isValid = false;
        }

        setErrors(errors);
        return isValid;
    };


    const handleSignUpButtonClick = () => {
        if (validate()) {
            navigation.navigate('passengerPassword', {
                name: Name,
                email: Email,
                phoneNo: phoneNo,
                selectGender: selectGender,
                age: Age,
            });
        }
    };
    const navigateToLogin = () => {
        loginNavigation.navigate('Login');
    }




    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled">


                <View style={styles.container}>
                    <TouchableOpacity
                        style={styles.customBackButton}
                        onPress={() => navigation.goBack()}>
                        <AntDesign name="arrowleft" style={styles.Icon} />
                        <Text style={styles.customTextButton}>Back</Text>
                    </TouchableOpacity>

                    <Text style={styles.headerText}>
                        Sign up with your email or phone number
                    </Text>

                    <View style={styles.innerView}>
                        <TextInput
                            placeholder="Name"
                            value={Name}
                            onChangeText={text => setName(text)}
                            style={styles.inputStyle}
                        />
                        {errors.Name && <Text style={styles.errorText}>{errors.Name}</Text>}
                        <TextInput
                            placeholder="Email"
                            keyboardType="email-address"
                            value={Email}
                            onChangeText={text => setEmail(text)}
                            style={styles.inputStyle}
                        />
                        {errors.Email && <Text style={styles.errorText}>{errors.Email}</Text>}
                        <TextInput
                            placeholder=" Your mobile number"
                            keyboardType="phone-pad"
                            value={phoneNo}
                            onChangeText={text => setPhoneNo(text)}
                            style={styles.inputStyle}
                        />
                        {errors.phoneNo && <Text style={styles.errorText}>{errors.phoneNo}</Text>}

                        <View style={styles.pickerContainer}>
                            <RNPickerSelect
                                onValueChange={(value) => setSelectGender(value)}
                                style={styles.pickerSelectStyle}
                                placeholder={{ label: 'Select Gender' }}
                                items={[

                                    { label: 'Male', value: 'male' },
                                    { label: 'Female', value: 'female' },
                                ]}

                            />
                            {errors.selectGender && <Text style={styles.errorText}>{errors.selectGender}</Text>}
                        </View>

                        <TextInput
                            placeholder="Age"
                            keyboardType="numeric"
                            value={Age}
                            onChangeText={value => setAge(value)}
                            style={styles.inputStyle}
                        />
                        {errors.Age && <Text style={styles.errorText}>{errors.Age}</Text>}

                        <TouchableOpacity style={styles.customCheckButton}>
                            <AntDesign name="checkcircle" style={styles.checkIcon} />
                            <Text style={styles.customTextButton}>
                                By signing up. you agree to the{' '}
                                <Text style={styles.greenText}>terms of service</Text> and{' '}
                                <Text style={styles.greenText}>privacy policy.</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Sign up Button */}
                        <TouchableOpacity style={styles.signUpAccountButton} onPress={handleSignUpButtonClick} >
                            <Text style={styles.signUpAccountBtnText}>Sign Up</Text>
                        </TouchableOpacity>

                        {/* Horizontal line */}
                        <View style={styles.horizontolContainer}>
                            <View style={styles.line} />
                            <Text style={styles.lineText}>or</Text>
                            <View style={styles.line} />
                        </View>
                        <View style={styles.lastView}>
                            <Text style={styles.customTextButton}>Already have an account?</Text>
                            <TouchableOpacity onPress={navigateToLogin}><Text style={[styles.customTextButton, { color: '#008955' }]}>Sign in</Text></TouchableOpacity>
                        </View>

                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>

    );
}

export default PassengerRegistration;

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
        marginTop: 50,
        marginLeft: 2,
    },
    customTextButton: {
        fontSize: 18,
        marginLeft: 8,
        fontWeight: '500',
        color: '#414141',
    },
    greenText: {
        color: '#008955',
    },
    customCheckButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        width: '90%',
    },
    checkIcon: {
        color: '#008955',
        fontSize: 22,
    },
    headerText: {
        fontSize: 28,
        color: '#414141',
        padding: 20,
        fontWeight: '400',
    },
    innerView: {
        flex: 0.8,
        alignItems: 'center',
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
    errorText: {
        color: '#FF0000',
        fontSize: 14,
        alignSelf: 'flex-start',
        textAlign: 'left',
        paddingHorizontal: 12,
        // paddingTop: 2,
        // paddingBottom: 6,
    },
    pickerContainer: {
        //////////
        borderRadius: 6,
        width: '93%',
        marginVertical: 12,
        marginBottom: 14,
        fontSize: 20,
        height: 60,
    },
    signUpAccountButton: {
        marginTop: 30,
        marginBottom: 20,
        width: '93%',
        backgroundColor: '#008955',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginLeft: 5,
        marginRight: 5,
    },
    signUpAccountBtnText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '500',
    },

    // Horizontol container
    horizontolContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'black',
    },
    lineText: {
        marginHorizontal: 10,
        color: 'black',
        fontSize: 16,
    },
    lastView: {
        flexDirection: 'row',

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
            marginBottom: 4,
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
            marginBottom: 4,
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
