import { useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { authStyles } from "../../assets/styles/auth.styles";
import { Image } from "expo-image";
import { COLORS } from "../../constants/colors";

const VerifyEmail = ({ email, onBack }) => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerification = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      Alert.alert("Error", err.errors?.[0]?.message || "Verification failed");
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[authStyles.container, { paddingHorizontal: 20 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 30,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Image */}
          <View style={{ marginBottom: 20 }}>
            <Image
              source={require("../../assets/images/i3.png")}
              style={{ width: 180, height: 180 }}
              contentFit="contain"
            />
          </View>

          {/* Title */}
          <Text style={[authStyles.title, { textAlign: "center" }]}>
            Verify Your Email
          </Text>
          <Text
            style={[
              authStyles.subtitle,
              { textAlign: "center", marginBottom: 25 },
            ]}
          >
            We sent a verification code to{" "}
            <Text style={{ fontWeight: "600", color: COLORS.primary }}>
              {email}
            </Text>
          </Text>

          {/* Code Input */}
          <View style={[authStyles.inputContainer, { marginBottom: 20 }]}>
            <TextInput
              style={[
                authStyles.textInput,
                {
                  textAlign: "center",
                  fontSize: 22,
                  letterSpacing: 5,
                  borderWidth: 1.5,
                  borderColor: COLORS.primary,
                  borderRadius: 12,
                  paddingVertical: 12,
                },
              ]}
              placeholder="123456"
              placeholderTextColor={COLORS.textLight}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              autoCapitalize="none"
            />
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              authStyles.authButton,
              {
                backgroundColor: COLORS.primary,
                borderRadius: 12,
                paddingVertical: 14,
                width: "100%",
              },
              loading && authStyles.buttonDisabled,
            ]}
            onPress={handleVerification}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={[authStyles.buttonText, { fontSize: 18 }]}>
              {loading ? "Verifying..." : "Verify Email"}
            </Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={[authStyles.linkText, { fontSize: 16 }]}>
              ← Back to Sign Up
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default VerifyEmail;
