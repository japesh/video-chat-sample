import React from "react";
import {View, Text, StyleSheet} from "react-native"
import {NativeRouter, Route, Switch} from 'react-router-native'
import VideoChatView from "./VideoChatView"
import AuthenticateView from "./AuthenticateView"
import LoginView from "./LoginView"
import SplashScreen from 'react-native-splash-screen'
export default class Routes extends React.Component {
    componentDidMount() {
        SplashScreen.hide();
    }
    render() {
        return <NativeRouter>
            <View style={styles.container}>
                <Switch>
                    <Route path="/login">
                        <LoginView afterLogin="/"/>
                    </Route>
                    <Route path="/">
                        <AuthenticateView loginPath="/login">
                            <VideoChatView/>
                        </AuthenticateView>
                    </Route>
                </Switch>
            </View>
        </NativeRouter>
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})
