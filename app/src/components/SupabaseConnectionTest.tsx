import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<
    "testing" | "connected" | "error"
  >("testing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      console.log("Testing Supabase connection...");
      console.log("URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
      console.log(
        "Anon Key:",
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "..."
      );

      // Test basic connection by trying to get the current user session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Supabase connection error:", error);
        setConnectionStatus("error");
        setErrorMessage(error.message);
        Alert.alert(
          "Connection Error",
          `Failed to connect to Supabase: ${error.message}`
        );
      } else {
        console.log("Supabase connected successfully!");
        console.log("Session data:", data);
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error("Unexpected error testing Supabase:", error);
      setConnectionStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      Alert.alert("Connection Error", "Failed to connect to Supabase");
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "#4CAF50";
      case "error":
        return "#F44336";
      default:
        return "#FF9800";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "✅ Connected to Supabase";
      case "error":
        return "❌ Connection Failed";
      default:
        return "🔄 Testing Connection...";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      <View
        style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}
      >
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {connectionStatus === "connected" && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            Supabase client is working correctly!
          </Text>
          <Text style={styles.detailsText}>
            URL: {process.env.EXPO_PUBLIC_SUPABASE_URL}
          </Text>
        </View>
      )}

      {connectionStatus === "error" && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {errorMessage}</Text>
          <Text style={styles.detailsText}>
            Please check your Supabase configuration
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  statusIndicator: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  successContainer: {
    backgroundColor: "#E8F5E8",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  successText: {
    color: "#2E7D32",
    fontWeight: "600",
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#C62828",
    fontWeight: "600",
    marginBottom: 8,
  },
  detailsText: {
    color: "#666",
    fontSize: 12,
  },
});
