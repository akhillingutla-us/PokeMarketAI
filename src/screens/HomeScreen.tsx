import react from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

export default function HomeScreen ({navigation}: any) {
    return (
        <View style={styles.container}>
      <Text style={styles.title}>PokéMarket AI</Text>
      <Text style={styles.subtitle}>Your AI-Powered Card Portfolio</Text>
      
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scan')}
      >
        <Text style={styles.scanButtonText}>Scan Card</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1a1a2e',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: '#aaa',
      marginBottom: 50,
    },
    scanButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 25,
      elevation: 3,
    },
    scanButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });