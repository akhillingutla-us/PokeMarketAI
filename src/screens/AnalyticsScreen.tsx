import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getAllCards, getCardPriceHistory, getCardAIInsights, Card, PriceHistory, AIInsights } from '../services/backendAPI';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    if (selectedCard?.id) {
      loadPriceHistory(selectedCard.id);
      loadAIInsights(selectedCard.id);
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

  const loadAIInsights = async (cardId: number) => {
    try {
      setLoadingAI(true);
      const insights = await getCardAIInsights(cardId);
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
      setAiInsights(null);
    } finally {
      setLoadingAI(false);
    }
  };

  // Process price history for chart
const getChartData = () => {
  if (!priceHistory?.price_history?.conditions) {
    return null;
  }

  try {
    // Get Near Mint condition history
    const nearMint = priceHistory.price_history.conditions['Near Mint'];
    if (!nearMint?.history || nearMint.history.length === 0) {
      return null;
    }

    const history = nearMint.history;
    
    // Extract dates and prices
    const labels = history.map((entry: any) => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const data = history.map((entry: any) => entry.market);

    // Calculate Y-axis range with padding for better visualization
    const minPrice = Math.min(...data);
    const maxPrice = Math.max(...data);
    const range = maxPrice - minPrice;
    
    // If prices are stable (range < 1%), add 10% padding above and below
    const padding = range < (minPrice * 0.01) ? minPrice * 0.1 : range * 0.2;
    
    const yAxisMin = Math.max(0, minPrice - padding);
    const yAxisMax = maxPrice + padding;

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 3
      }],
      // Add min/max for better scaling
      yAxisMin,
      yAxisMax
    };
  } catch (error) {
    console.error('Error processing chart data:', error);
    return null;
  }
};

  const chartConfig = {
    backgroundColor: '#1e1e2e',
    backgroundGradientFrom: '#2a2a3e',
    backgroundGradientTo: '#1a1a2e',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.9})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '7',
      strokeWidth: '3',
      stroke: '#4CAF50',
      fill: '#4CAF50',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#3a3a4e',
      strokeWidth: 1,
    },
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
          Scan some cards to see AI-powered analytics!
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

  const getRecommendationColor = (rec: string) => {
    if (rec === 'BUY') return '#4CAF50';
    if (rec === 'SELL') return '#f44336';
    return '#FFD700';
  };

  const getRecommendationEmoji = (rec: string) => {
    if (rec === 'BUY') return '🚀';
    if (rec === 'SELL') return '💰';
    return '🤝';
  };

  const chartData = getChartData();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Portfolio Analytics</Text>
        <Text style={styles.subtitle}>Powered by Claude Sonnet 4</Text>
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
              <Text style={styles.setName}>{selectedCard.set_name}</Text>
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

          {/* PRICE CHART */}
          {loadingHistory ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Price History Chart</Text>
              <View style={styles.chartLoadingCard}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading chart data...</Text>
              </View>
            </View>
          ) : chartData ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Price History Chart</Text>
              <View style={styles.chartContainer}>
                <LineChart
                  data={chartData}
                  width={screenWidth - 40}
                  height={260}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withDots={true}
                  withInnerLines={true}
                  withOuterLines={true}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  fromZero={false}
                  segments={4}
                  yAxisLabel="$"
                  yAxisSuffix=""
                />
                <Text style={styles.chartFooter}>
                  Near Mint Condition • Last {chartData.labels.length} days
                </Text>
              </View>
            </View>
          ) : null}

          {/* AI INSIGHTS */}
          {loadingAI ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤖 Claude AI Analysis</Text>
              <View style={styles.aiLoadingCard}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.aiLoadingText}>Claude is analyzing market data...</Text>
                <Text style={styles.aiLoadingSubtext}>This may take a few seconds</Text>
              </View>
            </View>
          ) : aiInsights?.ai_insights ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤖 Claude AI Analysis</Text>
              
              {/* Recommendation Badge */}
              <View style={[
                styles.recommendationBadge,
                { backgroundColor: getRecommendationColor(aiInsights.ai_insights.recommendation) + '20' }
              ]}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationEmoji}>
                    {getRecommendationEmoji(aiInsights.ai_insights.recommendation)}
                  </Text>
                  <Text style={[
                    styles.recommendationText,
                    { color: getRecommendationColor(aiInsights.ai_insights.recommendation) }
                  ]}>
                    {aiInsights.ai_insights.recommendation}
                  </Text>
                </View>
                
                {/* Confidence Meter */}
                <View style={styles.confidenceContainer}>
                  <View style={styles.confidenceHeader}>
                    <Text style={styles.confidenceLabel}>AI Confidence</Text>
                    <Text style={styles.confidenceValue}>{aiInsights.ai_insights.confidence}%</Text>
                  </View>
                  <View style={styles.confidenceBarBg}>
                    <View 
                      style={[
                        styles.confidenceBarFill,
                        { 
                          width: `${aiInsights.ai_insights.confidence}%`,
                          backgroundColor: getRecommendationColor(aiInsights.ai_insights.recommendation)
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>

              {/* Prediction Card */}
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>🔮</Text>
                  <Text style={styles.insightTitle}>Price Prediction</Text>
                </View>
                <Text style={styles.insightText}>{aiInsights.ai_insights.prediction}</Text>
              </View>

              {/* Reasoning Card */}
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>💡</Text>
                  <Text style={styles.insightTitle}>Investment Analysis</Text>
                </View>
                <Text style={styles.insightText}>{aiInsights.ai_insights.reasoning}</Text>
              </View>
            </View>
          ) : null}

          {/* Trend Analysis */}
          {priceHistory?.trend_analysis?.trend && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Market Trend</Text>
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
                    <Text style={styles.statLabel}>Average</Text>
                    <Text style={styles.statValue}>
                      ${priceHistory.trend_analysis.average_price.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.trendStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Low</Text>
                    <Text style={styles.statValue}>
                      ${priceHistory.trend_analysis.lowest_price.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>High</Text>
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
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a15',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a15',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#4CAF50',
    opacity: 0.8,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    marginTop: 10,
  },
  cardChip: {
    backgroundColor: '#1a1a2e',
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
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  setName: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  priceRange: {
    fontSize: 14,
    color: '#aaa',
  },
  chartContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartFooter: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
  },
  chartLoadingCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  aiLoadingCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  aiLoadingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 15,
  },
  aiLoadingSubtext: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 5,
  },
  recommendationBadge: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  recommendationEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  recommendationText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  confidenceContainer: {
    marginTop: 10,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  confidenceBarBg: {
    height: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  insightText: {
    fontSize: 15,
    color: '#ddd',
    lineHeight: 22,
  },
  trendCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#2a2a3e',
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
  loadingText: {
    fontSize: 14,
    color: '#aaa',
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