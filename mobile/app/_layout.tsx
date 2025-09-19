import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import SafeAreaScreen from "@/components/SafeAreaScreen";

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <SafeAreaScreen>
        <Slot />
      </SafeAreaScreen>
    </ClerkProvider>
  );
}
