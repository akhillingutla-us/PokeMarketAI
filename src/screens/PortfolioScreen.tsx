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
              await loadCards();
              Alert.alert('Success', 'Card removed from collection');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete card');
            }
          },
        },
      ]
    );
  };

  // Calculate total portfolio value
  const totalValue = cards.reduce((sum, card) => {
    return sum + (card.market_price || 0);
  }, 0);

  const renderCard = ({ item }: { item: Card }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={styles.cardName}>{item.card_name}</Text>
          {item.market_price && (
            <Text style={styles.marketPrice}>${item.market_price.toFixed(2)}</Text>
          )}
        </View>
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
        
        {/* Price Range */}
        {item.low_price && item.high_price && (
          <View style={styles.priceRange}>
            <Text style={styles.priceRangeLabel}>Price Range:</Text>
            <Text style={styles.priceRangeValue}>
              ${item.low_price.toFixed(2)} - ${item.high_price.toFixed(2)}
            </Text>
          </View>
        )}

        {/* No price available message */}
        {!item.market_price && (
          <Text style={styles.noPriceText}>Price data unavailable</Text>
        )}
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
        <View style={styles.stats}>
          <Text style={styles.count}>{cards.length} cards</Text>
          {totalValue > 0 && (
            <Text style={styles.totalValue}>
              Total Value: ${totalValue.toFixed(2)}
            </Text>
          )}
        </View>
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
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontSize: 16,
    color: '#4CAF50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleSection: {
    flex: 1,
  },
  cardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  marketPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
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
  priceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#3a3a4e',
  },
  priceRangeLabel: {
    fontSize: 13,
    color: '#aaa',
  },
  priceRangeValue: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '600',
  },
  noPriceText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
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