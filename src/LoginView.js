
import React from "react";
import { View, StyleSheet, Text, TextInput, TouchableOpacity, AsyncStorage} from "react-native";
import { Redirect } from "react-router-native";
import {url} from "../config"
export default class Login extends React.Component {
    state = {
        name: "",
        isLoggedIn: false,
    };
    constructor(props) {
        super(props);
        this.onUserNameChange = this.onChangeText.bind(this, "name");
    }
    onChangeText(name, val) {
        this.setState({ [name]: val });
    }
    onSubmitEditing = () => {
        const {name} = this.state
        fetch(`${url}/insertName/${name}`)
        AsyncStorage.setItem("@TwillioSample:user", name, error => {
            let isLoggedIn = true;
            if (error) {
                isLoggedIn = false;
                console.error(error);
            }
            this.setState({ isLoggedIn });
        });
    };
    render() {
        if (this.state.isLoggedIn) {
            return <Redirect push={false} to={this.props.afterLogin} />;
        }
        const textInputProps = {
            underlineColorAndroid: "#fff",
            style: styles.textInput,
            placeholderTextColor: "#fff",
            onSubmitEditing: this.onSubmitEditing
        };
        return (
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <TextInput
                        {...textInputProps}
                        value={this.state.name}
                        onChangeText={this.onUserNameChange}
                        placeholder={"User name"}
                    />
                    <TouchableOpacity onPress={this.onSubmitEditing} centered style={styles.submitButton}>
                        <Text style={styles.submitText}>SUBMIT</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e8382d",
        justifyContent: "center",
        padding: 50
    },
    innerContainer: {
        backgroundColor: "rgba(255,255,255,0.2)",
        minHeight: 270,
        padding: 20
    },
    textInput: {
        color: "white",
        height: 45,
        marginBottom: 20
    },
    submitButton: {
        backgroundColor: "#fff",
        borderRadius: 3,
        padding: 10
    },
    submitText: {
        color: "#e8382d",
        textAlign: "center"
    },
});