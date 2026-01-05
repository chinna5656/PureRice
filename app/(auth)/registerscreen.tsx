import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { API_URL } from '../../src/services/api';

// Import Validators
import { emailValidator } from '../../src/helpers/emailValidator';
import { nameValidator } from '../../src/helpers/nameValidator';
import { passwordValidator } from '../../src/helpers/passwordValidator';

export default function RegisterScreen() {
  const router = useRouter();
  //const { signUp } = useAuth(); // ดึงฟังก์ชัน signUp

  const [name, setName] = useState({ value: '', error: '' });
  const [username, setUsername] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [loading, setLoading] = useState(false);

  const onSignUpPressed = async () => {
    const nameError = nameValidator(name.value);
    const usernameError = nameValidator(username.value);
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError || nameError) {
      setName({ ...name, error: nameError });
      setUsername({ ...username, error: usernameError });
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name.value);
      formData.append('username', username.value);
      formData.append('email', email.value);
      formData.append('password', password.value);

      console.log('Registering with data:', {
        name: name.value,
        username: username.value,
        email: email.value,
        password: password.value,
      });
      console.log('API URL:', `${API_URL}/register`);
      console.log('Form Data:', formData);

      const response = await axios.post(`${API_URL}/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'ok') {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/loginscreen') }
        ]);
      } else {
        Alert.alert('Registration Failed', response.data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', 'Email might already be in use or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
          <Text style={styles.header}>Create Account</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name.value}
              onChangeText={(text) => setName({ value: text, error: '' })}
            />
            {name.error ? <Text style={styles.errorText}>{name.error}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username.value}
              onChangeText={(text) => setUsername({ value: text, error: '' })}
            />
            {username.error ? <Text style={styles.errorText}>{username.error}</Text> : null}
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email.value}
              onChangeText={(text) => setEmail({ value: text, error: '' })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {email.error ? <Text style={styles.errorText}>{email.error}</Text> : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password.value}
              onChangeText={(text) => setPassword({ value: text, error: '' })}
              secureTextEntry
            />
            {password.error ? <Text style={styles.errorText}>{password.error}</Text> : null}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.button} onPress={onSignUpPressed} disabled={loading}>
             {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>SIGN UP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.row}>
            <Text>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/loginscreen')}>
              <Text style={styles.link}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  inner: { flex: 1, justifyContent: 'center', padding: 24, alignItems: 'center' },
  header: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 30 },
  inputContainer: { width: '100%', marginBottom: 15 },
  input: { 
    width: '100%', 
    height: 50, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    paddingHorizontal: 16, 
    borderWidth: 1, 
    borderColor: '#ddd' 
  },
  errorText: { color: 'red', fontSize: 12, marginTop: 4, marginLeft: 4 },
  button: { 
    width: '100%', 
    height: 50, 
    backgroundColor: '#28a745', // สีเขียวสำหรับปุ่ม Register
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', marginTop: 20 },
  link: { fontWeight: 'bold', color: '#28a745' },
});