import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { favoritesStyles } from "@/assets/styles/favorites.styles";

function NoFavoritesFound() {
  const router = useRouter();

  return (
    <View style={favoritesStyles.emptyState}>
      <View style={favoritesStyles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={80} color={COLORS.textLight} />
      </View>
      <Text style={favoritesStyles.emptyTitle}>No favorites yet</Text>
      <Pressable
        style={favoritesStyles.exploreButton}
        onPress={() => router.push("/")}
        android_ripple={{ color: "#ddd" }}
      >
        <Ionicons name="search" size={18} color={COLORS.white} />
        <Text style={favoritesStyles.exploreButtonText}>Explore Recipes</Text>
      </Pressable>
    </View>
  );
}

export default NoFavoritesFound;
