import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Button,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import {PermissionsAndroid} from 'react-native';

import {
    TwilioVideoLocalView,
    TwilioVideoParticipantView,
    TwilioVideo
} from 'react-native-twilio-video-webrtc'
import {url} from "./config"
async function requestCameraPermission() {
    try {
        const isGranted = await PermissionsAndroid.checkPermission(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        console.warn("isGranted", isGranted)
        if (!isGranted) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    'title': 'Cool Photo App Camera Permission',
                    'message': 'Cool Photo App needs access to your camera ' +
                    'so you can take awesome pictures.'
                }
            )
            const isCameraGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    'title': 'Cool Photo App Camera Permission',
                    'message': 'Cool Photo App needs access to your camera ' +
                    'so you can take awesome pictures.'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                // console.log("You can use the camera")
            } else {
                // console.log("Camera permission denied")
            }
        }
    } catch (err) {
        console.warn(err.message)
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    callContainer: {
        flex: 1,
        position: "absolute",
        bottom: 0,
        top: 0,
        left: 0,
        right: 0
    },
    welcome: {
        fontSize: 30,
        textAlign: 'center',
        paddingTop: 40
    },
    input: {
        height: 50,
        borderWidth: 1,
        marginRight: 70,
        marginLeft: 70,
        marginTop: 50,
        textAlign: 'center',
        backgroundColor: 'white'
    },
    button: {
        marginTop: 100
    },
    localVideo: {
        flex: 1,
        width: 150,
        height: 250,
        position: "absolute",
        right: 10,
        bottom: 10
    },
    remoteGrid: {
        flex: 1,
        flexDirection: "row",
        flexWrap: 'wrap'
    },
    remoteVideo: {
        margin: 20,
        flex: 1
    },
    optionsContainer: {
        position: "absolute",
        left: 0,
        bottom: 0,
        right: 0,
        height: 100,
        backgroundColor: 'blue',
        flexDirection: "row",
        alignItems: "center"
    },
    optionButton: {
        width: 60,
        height: 60,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 100 / 2,
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: "center"
    }
});

export default class Example extends Component {
    state = {
        status: 'disconnected',
        videoTrack: undefined,
        userName: ''
    }

    componentWillMount() {
        requestCameraPermission();
    }

    disconnect() {
        this.setState(({isFetching}) => {
            if (!isFetching) {
                fetch(`${url}/completeRoom/${this.roomName}`)
                    .then((response) => response.json())
                    .then((response) => {
                        this.roomName = undefined;
                        this.setState({
                            status: "disconnected",
                            videoTrack: undefined
                        })
                        console.warn(response)
                    })
                    .catch((error) => {
                        this.setState({isFetching: false})
                        console.warn(error);
                    });
            }
            return {isFetching: true}
        })

    }

    _onConnectButtonPress = () => {
        this.setState(({isFetching}) => {
            if (!isFetching) {
                fetch(`${url}/requestAccessToken/${this.state.userName}`)
                    .then((response) => response.json())
                    .then((response) => {
                        this.setState({isFetching: false, status: "connecting"})
                        this.roomName = response.sid
                        this.twilioVideo.connect({roomName: response.sid, accessToken: response.jwt})
                        // console.warn("response received")
                        console.warn(response)
                    })
                    .catch((error) => {
                        this.setState({isFetching: false})
                        console.warn(error);
                    });
            }
            return {isFetching: true}
        })
    }

    _onEndButtonPress = () => {
        this.twilioVideo.disconnect()
    }


    _onFlipButtonPress = () => {
        this.twilioVideo.flipCamera()
    }

    _onRoomDidConnect = () => {
        this.setState({status: 'connected'})
    }

    _onRoomDidDisconnect = ({roomName, error}) => {
        console.warn("ERROR:_onRoomDidDisconnect ", error)

        this.disconnect();
    }

    _onRoomDidFailToConnect = (error) => {
        console.warn("ERROR:_onRoomDidFailToConnect ", error)
        this.disconnect();
    }

    _onParticipantAddedVideoTrack = ({participant, track}) => {
        console.warn("onParticipantAddedVideoTrack: ", participant, track)
        //    track.trackId
        this.setState({
            videoTrack: {...participant, ...track}
            ,
        });
    }

    _onParticipantRemovedVideoTrack = ({participant, track}) => {
        console.warn("onParticipantRemovedVideoTrack: ", participant, track)
        this.disconnect();
    }
    _getRefTwillio = (ref) => {
        this.twilioVideo = ref
    }

    render() {
        console.warn("this.state.status", this.state.status)
        const {videoTrack} = this.state;
        return (
            <View style={styles.container}>
                {
                    this.state.status === 'disconnected' &&
                    <View>
                        <Text style={styles.welcome}>
                            React Native Twilio Video
                        </Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize='none'
                            value={this.state.userName}
                            onChangeText={(text) => this.setState({userName: text})}>
                        </TextInput>
                        <Button
                            title="Connect"
                            style={styles.button}
                            onPress={this._onConnectButtonPress}>
                        </Button>
                    </View>
                }

                {
                    (this.state.status === 'connected' || this.state.status === 'connecting') &&
                    <View style={styles.callContainer}>
                        {
                            this.state.status === 'connected' &&
                            <View style={styles.remoteGrid}>
                                {
                                    videoTrack ? <TwilioVideoParticipantView
                                            style={styles.remoteVideo}
                                            key={videoTrack.trackId}
                                            trackIdentifier={{
                                                participantIdentity: videoTrack.identity,
                                                videoTrackId: videoTrack.trackId
                                            }}
                                        /> : <View>
                                            <Text>Waiting for Participant</Text>
                                        </View>
                                }
                            </View>
                        }
                        <View
                            style={styles.optionsContainer}>
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={this._onEndButtonPress}>
                                <Text style={{fontSize: 12}}>End</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={this._onFlipButtonPress}>
                                <Text style={{fontSize: 12}}>Flip</Text>
                            </TouchableOpacity>
                            <TwilioVideoLocalView
                                enabled={true}
                                style={styles.localVideo}
                            />
                        </View>
                    </View>
                }

                <TwilioVideo
                    ref={this._getRefTwillio}
                    onRoomDidConnect={ this._onRoomDidConnect }
                    onRoomDidDisconnect={ this._onRoomDidDisconnect }
                    onRoomDidFailToConnect={ this._onRoomDidFailToConnect }
                    onParticipantAddedVideoTrack={ this._onParticipantAddedVideoTrack }
                    onParticipantRemovedVideoTrack={ this._onParticipantRemovedVideoTrack }
                />
            </View>
        );
    }
}
