import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { getAllCards, deleteCard, Card } from '../services/backendAPI';

export default function PortfolioScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load cards on mount
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const fetchedCards = await getAllCards();
      setCards(fetchedCards);
    } catch (error) {
      console.error('Error loading cards:', error);
      Alert.alert('Error', 'Failed to load cards from database');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  const handleDelete = (cardId: number, cardName: string) => {
    Alert.alert(
      'Delete Card',
      `Remove ${cardName} from your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCard(cardId);
              await loadCards(); // Refresh the list
              Alert.alert('Success', 'Card removed from collection');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete card');
            }
          },
        },
      ]
    );
  };

  const renderCard = ({ item }: { item: Card }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.card_name}</Text>
        <TouchableOpacity
          onPress={() => handleDelete(item.id!, item.card_name)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardDetails}>
        <CardDetail label="Set" value={item.set_name || 'Unknown'} />
        <CardDetail label="Number" value={item.card_number || 'Unknown'} />
        <CardDetail label="Rarity" value={item.rarity || 'Unknown'} />
        <CardDetail label="Condition" value={item.condition || 'Unknown'} />
      </View>
    </View>
  );

  if (loading && cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your collection...</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyTitle}>No Cards Yet</Text>
        <Text style={styles.emptySubtitle}>
          Scan cards to add them to your portfolio!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Collection</Text>
        <Text style={styles.count}>{cards.length} cards</Text>
      </View>
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id!.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
          />
        }
      />
    </View>
  );
}

function CardDetail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  count: {
    fontSize: 16,
    color: '#4CAF50',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  deleteText: {
    fontSize: 20,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
});