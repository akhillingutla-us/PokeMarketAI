import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { identifyCard, CardIdentification } from '../services/ClaudeAPI';

export default function ScanScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifiedCard, setIdentifiedCard] = useState<CardIdentification | null>(null);
  const cameraRef = useRef<any>(null);

  // Check if we have permission
  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Loading...</Text></View>;
  }

  // If no permission, show request button
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need camera access to scan cards</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Take picture and identify card
  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setLoading(true);
      
      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });

      // Close camera
      setCameraActive(false);

      // Call Claude API to identify card
      const cardData = await identifyCard(photo.base64);
      setIdentifiedCard(cardData);

    } catch (error) {
      console.error('Error identifying card:', error);
      Alert.alert('Error', 'Failed to identify card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.text}>Analyzing card with AI...</Text>
      </View>
    );
  }

  // Show identified card results
  if (identifiedCard) {
    return (
      <ScrollView style={styles.resultsContainer}>
        <View style={styles.resultsContent}>
          <Text style={styles.resultsTitle}>Card Identified! ✨</Text>
          
          <View style={styles.cardInfo}>
            <InfoRow label="Card Name" value={identifiedCard.cardName} />
            <InfoRow label="Set" value={identifiedCard.setName} />
            <InfoRow label="Card Number" value={identifiedCard.cardNumber} />
            <InfoRow label="Rarity" value={identifiedCard.rarity} />
            <InfoRow label="Condition" value={identifiedCard.condition} />
            <InfoRow label="Confidence" value={identifiedCard.confidence} />
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => {
              setIdentifiedCard(null);
              setCameraActive(true);
            }}
          >
            <Text style={styles.buttonText}>Scan Another Card</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setIdentifiedCard(null);
              navigation.goBack();
            }}
          >
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Show camera or button to activate camera
  if (!cameraActive) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Scan a Card</Text>
        <Text style={styles.subtitle}>AI will identify the card instantly</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setCameraActive(true)}
        >
          <Text style={styles.buttonText}>📸 Open Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Camera is active
  return (
    <View style={styles.cameraContainer}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.cameraControls}>
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={takePicture}
          >
            <Text style={styles.captureButtonText}>📷 Capture</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setCameraActive(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

// Helper component for displaying card info
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
  },
  text: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 50,
    marginBottom: 20,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  resultsContent: {
    padding: 20,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 40,
    marginBottom: 30,
  },
  cardInfo: {
    width: '100%',
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a4e',
  },
  infoLabel: {
    fontSize: 16,
    color: '#aaa',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
});