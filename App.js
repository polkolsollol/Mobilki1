import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import * as CryptoJS from 'crypto-js';

export default function App() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  const handleRegister = async () => {
    if (login.trim() === '' || password.trim() === '' || password2.trim() === '') {
      Alert.alert('Błąd', 'Uzupełnij wszystkie pola');
      return;
    }

    if (password !== password2) {
      Alert.alert('Błąd', 'Hasła nie są takie same');
      return;
    }

    try {
      const q = query(collection(db, 'users'), where('login', '==', login));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        Alert.alert('Błąd', 'Login jest już zajęty');
        return;
      }

      const hashedPassword = CryptoJS.SHA256(password).toString();

      await addDoc(collection(db, 'users'), {
        login: login,
        password: hashedPassword,
        createdAt: new Date()
      });

      Alert.alert('Sukces', 'Użytkownik został zarejestrowany');
      setIsRegistering(false);
      setLogin('');
      setPassword('');
      setPassword2('');
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd rejestracji', error.message);
    }
  };

  const handleLogin = async () => {
    if (login.trim() === '' || password.trim() === '') {
      Alert.alert('Błąd', 'Uzupełnij wszystkie pola');
      return;
    }

    try {
      const q = query(collection(db, 'users'), where('login', '==', login));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Błąd', 'Nieprawidłowy login lub hasło');
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const hashedPassword = CryptoJS.SHA256(password).toString();

      if (userData.password === hashedPassword) {
        Alert.alert('Sukces', 'Zalogowano pomyślnie');
        setLoggedUser(userData);
      } else {
        Alert.alert('Błąd', 'Nieprawidłowy login lub hasło');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd logowania', error.message);
    }
  };

  const handleLogout = () => {
    setLoggedUser(null);
    setLogin('');
    setPassword('');
    setPassword2('');
    Alert.alert('Wylogowano');
  };

  return (
    <View style={styles.container}>
      {!loggedUser ? (
        <View style={styles.formContainer}>
          <Text style={styles.title}>{isRegistering ? 'Rejestracja' : 'Logowanie'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Login"
            placeholderTextColor="#888"
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Hasło"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {isRegistering && (
            <TextInput
              style={styles.input}
              placeholder="Powtórz hasło"
              placeholderTextColor="#888"
              secureTextEntry
              value={password2}
              onChangeText={setPassword2}
            />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={isRegistering ? handleRegister : handleLogin}
          >
            <Text style={styles.buttonText}>
              {isRegistering ? 'Zarejestruj' : 'Zaloguj'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
            <Text style={styles.link}>
              {isRegistering ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loggedContainer}>
          <Text style={styles.welcomeText}>Witaj, {loggedUser.login}!</Text>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Wyloguj się</Text>
          </TouchableOpacity>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9f9d9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: 'center',
  },
  loggedContainer: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#3498db',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
});
