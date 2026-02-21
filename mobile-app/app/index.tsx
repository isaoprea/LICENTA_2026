import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap } from 'lucide-react-native';
// REPARARE CALE: Am adăugat încă un nivel de ../
import { api } from '../services/api'; 

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        router.replace('/(tabs)' as any);
      }
    } catch (error: any) {
      Alert.alert("Eroare", "Verifică conexiunea cu serverul!");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.header}>
        <Zap color="#3b82f6" size={50} fill="#3b82f6" />
        <Text style={styles.logoText}>CODE OVERLOAD</Text>
      </View>

      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          placeholderTextColor="#475569"
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Parolă" 
          placeholderTextColor="#475569"
          secureTextEntry 
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>AUTENTIFICARE</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  logoText: { 
    color: 'white', 
    fontSize: 24, 
    fontWeight: '900', 
    marginTop: 10, 
    // REPARARE STIL: Schimbat din italic: true
    fontStyle: 'italic' 
  },
  form: { width: '100%' },
  input: { 
    backgroundColor: '#0f172a', 
    borderWidth: 1, // Corectat din borderWeight
    borderColor: '#1e293b', 
    color: 'white', 
    padding: 18, 
    borderRadius: 18, 
    marginBottom: 20 
  },
  button: { 
    backgroundColor: '#2563eb', 
    padding: 18, 
    borderRadius: 18, 
    alignItems: 'center' 
  },
  buttonText: { color: 'white', fontWeight: '900' }
});