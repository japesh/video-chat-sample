import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import {
    TwilioVideoLocalView,
    TwilioVideoParticipantView,
    TwilioVideo
} from 'react-native-twilio-video-webrtc'
import {url} from "../config"
import {requestCameraPermission} from "./Utility"
import LoadingView from "./LoadingView"
export default class Example extends Component {
    state = {
        status: 'disconnected',
        videoTrack: undefined
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
                            isFetching: false,
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
        console.warn("hello>>>>>>>>>>",url)
        this.setState(({isFetching}) => {
            if (!isFetching) {
                fetch(`${url}/requestAccessToken/${this.props.user}`)
                    .then((response) => response.json())
                    .then((response) => {
                        this.setState({isFetching: false, status: "connecting"})
                        this.roomName = response.sid
                        this.twilioVideo.connect({roomName: response.sid, accessToken: response.jwt})
                        // console.warn("response received")
                        console.warn("reponse",response)
                    })
                    .catch((error) => {
                        this.setState({isFetching: false})
                        console.warn("error",error);
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
        const {videoTrack, isFetching} = this.state;
        return (
            <View style={styles.container}>
                {
                    this.state.status === 'disconnected' &&
                    <View style={styles.buttonContainer}>
                        <Text style={styles.welcome}>
                            Welcome To Twilio Video Chat
                        </Text>
                        <TouchableOpacity
                            title="Connect"
                            style={styles.button}
                            onPress={this._onConnectButtonPress}>
                            <Text style={styles.buttonText}>Create a Call.</Text>
                        </TouchableOpacity>
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
                                        /> : <View style={styles.container}>
                                            <Text style={styles.welcome}>Waiting for Participant</Text>
                                        </View>
                                }
                            </View>
                        }
                        <View
                            style={styles.optionsContainer}>
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={this._onEndButtonPress}>
                                <Text style={styles.option}>End</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.optionButton}
                                onPress={this._onFlipButtonPress}>
                                <Text style={styles.option}>Flip</Text>
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
                {isFetching&&<LoadingView/>}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    buttonContainer:{
        flex:1,
        justifyContent:"space-around"
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
        backgroundColor: "#e8382d",
        borderRadius: 3,
        padding: 10
    },
    buttonText: {
        color: "#fff",
        textAlign: "center"
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
        backgroundColor: '#e8382d',
        flexDirection: "row",
        alignItems: "center"
    },
    option:{fontSize: 12},
    optionButton: {
        width: 60,
        height: 60,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 100 / 2,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: "center"
    }
});

