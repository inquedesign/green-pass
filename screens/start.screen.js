import React from 'react'

import { Navigation  } from 'react-native-navigation'
import { StyleSheet,
         View        } from 'react-native'
import { Text        } from '../components/text.component'
import { Button      } from '../components/button.component'
import { STYLES,
         FONT_SIZES,
         REM         } from '../styles'

import SplashScreen from 'react-native-splash-screen'
//import firebase     from 'react-native-firebase'

//const instructions = Platform.select({
//    android: 'Double tap R on your keyboard to reload,\nCmd+M or shake for dev menu',
//    ios    : 'Press Cmd+R to reload,\nCmd+D or shake for dev menu'
//})

export default class StartScreen extends React.Component {
    constructor() {
        super()
        this.state = {}
    }

    /*async*/ componentDidMount() {
        // TODO: You: Do firebase things
        // const { user } = await firebase.auth().signInAnonymously();
        // console.warn('User -> ', user.toJSON());
        
        // await firebase.analytics().logEvent('foo', { bar: '123'});
        SplashScreen.hide()
    }

    goToCreateAccount() {
        Navigation.push(this.props.componentId, {
            component: { name: 'AccountCreationScreen' }
        })
    }

    goToLogin() {}

    render() {
        return (
            <View style={ STYLES.container }>
                <View style={ STYLES.content }>
                    <Text style={ LOCAL_STYLES.header }>
                        GreenPass connects {'\n'} Cannabis enthusiasts
                    </Text>
                    <Text style={ LOCAL_STYLES.body }>
                        To get started, we need to {'\n'} make your profile
                    </Text>
                    <Button style={ STYLES.spaceAfter }
                        label="Create an Account"
                        accessibilityLabel="Create an account"
                        onPress={ this.goToCreateAccount.bind(this) } />
                    <Button
                        label="Login"
                        accessibilityLabel="Login"
                        onPress={ this.goToLogin.bind(this) } />
                </View>
            </View>
            //      {firebase.admob.nativeModuleExists && <Text style={styles.module}>admob()</Text>}
            //      {firebase.analytics.nativeModuleExists && <Text style={styles.module}>analytics()</Text>}
            //      {firebase.auth.nativeModuleExists && <Text style={styles.module}>auth()</Text>}
            //      {firebase.config.nativeModuleExists && <Text style={styles.module}>config()</Text>}
            //      {firebase.crashlytics.nativeModuleExists && <Text style={styles.module}>crashlytics()</Text>}
            //      {firebase.database.nativeModuleExists && <Text style={styles.module}>database()</Text>}
            //      {firebase.firestore.nativeModuleExists && <Text style={styles.module}>firestore()</Text>}
            //      {firebase.functions.nativeModuleExists && <Text style={styles.module}>functions()</Text>}
            //      {firebase.iid.nativeModuleExists && <Text style={styles.module}>iid()</Text>}
            //      {firebase.invites.nativeModuleExists && <Text style={styles.module}>invites()</Text>}
            //      {firebase.links.nativeModuleExists && <Text style={styles.module}>links()</Text>}
            //      {firebase.messaging.nativeModuleExists && <Text style={styles.module}>messaging()</Text>}
            //      {firebase.notifications.nativeModuleExists && <Text style={styles.module}>notifications()</Text>}
            //      {firebase.perf.nativeModuleExists && <Text style={styles.module}>perf()</Text>}
            //      {firebase.storage.nativeModuleExists && <Text style={styles.module}>storage()</Text>}
        )
    }
}

const LOCAL_STYLES = StyleSheet.create({
    header: {
        fontSize: FONT_SIZES.LARGE,
        marginBottom: 18 * REM
    },
    body: {
        marginBottom: 42 * REM
    }
});
