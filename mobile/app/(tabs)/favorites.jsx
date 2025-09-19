import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  RefreshControl,
  Platform,
} from "react-native";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../constants/api";
import { favoritesStyles } from "../../assets/styles/favorites.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import NoFavoritesFound from "../../components/NoFavoritesFound";
import LoadingSpinner from "../../components/LoadingSpinner";

const FavoritesScreen = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/favorites/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch favorites");

      const favorites = await response.json();

      // ✅ transform for RecipeCard compatibility
      const transformedFavorites = favorites.map((favorite) => ({
        ...favorite,
        id: favorite.recipeId,
      }));

      setFavoriteRecipes(transformedFavorites);
    } catch (error) {
      console.log("Error loading favorites", error);
      Alert.alert("Error", "Failed to load favorites");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading your favorites..." />;
  }

  return (
    <SafeAreaView
      style={[
        favoritesStyles.container,
        { paddingTop: Platform.OS === "android" ? 40 : 0 }, // handle status bar on Android
      ]}
    >
      {/* Header */}
      <View style={favoritesStyles.header}>
        <Text style={favoritesStyles.title}>Favorites</Text>
        <TouchableOpacity
          style={favoritesStyles.logoutButton}
          onPress={handleSignOut}
          android_ripple={{ color: "#ddd", borderless: true }}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Favorites Grid */}
      <FlatList
        data={favoriteRecipes}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={favoritesStyles.row}
        contentContainerStyle={favoritesStyles.recipesGrid}
        ListEmptyComponent={<NoFavoritesFound />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]} // Android refresh spinner color
          />
        }
      />
    </SafeAreaView>
  );
};

export default FavoritesScreen;
