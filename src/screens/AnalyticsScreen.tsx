import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAllCards, getCardPriceHistory, Card, PriceHistory } from '../services/backendAPI';

export default function AnalyticsScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    if (selectedCard?.id) {
      loadPriceHistory(selectedCard.id);
    }
  }, [selectedCard]);

  const loadCards = async () => {
    try {
      const fetchedCards = await getAllCards();
      setCards(fetchedCards);
      if (fetchedCards.length > 0) {
        setSelectedCard(fetchedCards[0]);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPriceHistory = async (cardId: number) => {
    try {
      setLoadingHistory(true);
      const history = await getCardPriceHistory(cardId);
      setPriceHistory(history);
    } catch (error) {
      console.error('Error loading price history:', error);
      setPriceHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No Cards Yet</Text>
        <Text style={styles.emptySubtitle}>
          Scan some cards to see analytics!
        </Text>
      </View>
    );
  }

  const getTrendColor = (trend: string) => {
    if (trend.includes('Upward')) return '#4CAF50';
    if (trend.includes('Downward')) return '#f44336';
    return '#FFD700';
  };

  const getTrendEmoji = (trend: string) => {
    if (trend.includes('Upward')) return '📈';
    if (trend.includes('Downward')) return '📉';
    return '➡️';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 Portfolio Analytics</Text>
        <Text style={styles.subtitle}>AI-Powered Market Insights</Text>
      </View>

      {/* Card Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Card</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.cardChip,
                selectedCard?.id === card.id && styles.cardChipSelected
              ]}
              onPress={() => setSelectedCard(card)}
            >
              <Text style={[
                styles.cardChipText,
                selectedCard?.id === card.id && styles.cardChipTextSelected
              ]}>
                {card.card_name}
              </Text>
              {card.market_price && (
                <Text style={styles.cardChipPrice}>
                  ${card.market_price.toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Selected Card Analytics */}
      {selectedCard && (
        <>
          {/* Price Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Value</Text>
            <View style={styles.priceCard}>
              <Text style={styles.cardName}>{selectedCard.card_name}</Text>
              <Text style={styles.currentPrice}>
                ${selectedCard.market_price?.toFixed(2) || 'N/A'}
              </Text>
              {selectedCard.low_price && selectedCard.high_price && (
                <Text style={styles.priceRange}>
                  Range: ${selectedCard.low_price.toFixed(2)} - ${selectedCard.high_price.toFixed(2)}
                </Text>
              )}
            </View>
          </View>

          {/* Trend Analysis */}
          {loadingHistory ? (
            <View style={styles.section}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading price history...</Text>
            </View>
          ) : priceHistory?.trend_analysis?.trend ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Price Trend</Text>
              <View style={[
                styles.trendCard,
                { borderLeftColor: getTrendColor(priceHistory.trend_analysis.trend) }
              ]}>
                <View style={styles.trendHeader}>
                  <Text style={styles.trendEmoji}>
                    {getTrendEmoji(priceHistory.trend_analysis.trend)}
                  </Text>
                  <Text style={[
                    styles.trendText,
                    { color: getTrendColor(priceHistory.trend_analysis.trend) }
                  ]}>
                    {priceHistory.trend_analysis.trend}
                  </Text>
                </View>
                <View style={styles.trendStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Week Change</Text>
                    <Text style={[
                      styles.statValue,
                      { color: priceHistory.trend_analysis.week_change_percent > 0 ? '#4CAF50' : '#f44336' }
                    ]}>
                      {priceHistory.trend_analysis.week_change_percent > 0 ? '+' : ''}
                      {priceHistory.trend_analysis.week_change_percent.toFixed(2)}%
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Average Price</Text>
                    <Text style={styles.statValue}>
                      ${priceHistory.trend_analysis.average_price.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.trendStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Lowest</Text>
                    <Text style={styles.statValue}>
                      ${priceHistory.trend_analysis.lowest_price.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Highest</Text>
                    <Text style={styles.statValue}>
                      ${priceHistory.trend_analysis.highest_price.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.dataPoints}>
                  📅 {priceHistory.trend_analysis.total_data_points} days of data
                </Text>
              </View>
            </View>
          ) : null}

          {/* Price History Chart - Coming Soon */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price History</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartText}>📈 Chart Coming Next!</Text>
              <Text style={styles.chartSubtext}>
                We'll display interactive price charts here
              </Text>
            </View>
          </View>

          {/* AI Insights - Coming Soon */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 AI Insights</Text>
            <View style={styles.insightCard}>
              <Text style={styles.insightText}>
                AI-powered predictions coming soon!
              </Text>
              <Text style={styles.insightSubtext}>
                Claude will analyze price trends and provide personalized recommendations
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  subtitle: {
    fontSize: 16,
    color: '#4CAF50',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  cardChip: {
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardChipSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#1f3a2e',
  },
  cardChipText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  cardChipTextSelected: {
    color: '#4CAF50',
  },
  cardChipPrice: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 2,
  },
  priceCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  cardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  currentPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  priceRange: {
    fontSize: 14,
    color: '#aaa',
  },
  trendCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  trendEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  trendText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trendStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  dataPoints: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 10,
    textAlign: 'center',
  },
  chartPlaceholder: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a3a4e',
    borderStyle: 'dashed',
  },
  chartText: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 5,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  insightText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  insightSubtext: {
    fontSize: 14,
    color: '#aaa',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
});