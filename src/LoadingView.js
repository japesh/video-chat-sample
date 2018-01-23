import React from "react"
import { View, StyleSheet, ActivityIndicator } from "react-native";
export default function LoadingView() {
    return <View pointerEvents="box-only" style={StyleSheet.absoluteFill}>
        <ActivityIndicator style={styles.activityIndicator} />
    </View>
}
const styles = StyleSheet.create({
    activityIndicator: {
        flex: 1
    }
})