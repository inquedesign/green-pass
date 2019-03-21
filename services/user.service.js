import React    from 'react'
import firebase from 'react-native-firebase'

import { Navigation  } from 'react-native-navigation'

const FIRESTORE = firebase.firestore().collection('Users')
const AUTH      = firebase.auth()

export default class UserService {

    static createAccount( email, password ) {
        return AUTH.createUserWithEmailAndPassword(
            email,
            password
        )
    }
    
    static login( email, password ) {
        return AUTH.signInWithEmailAndPassword(
            email,
            password
        )
    }

    static update( dataToUpdate ) {
        if ( AUTH.currentUser ) {
            FIRESTORE
            .doc( AUTH.currentUser.uid )
            .set( dataToUpdate, { merge: true } )
        }
        else {
        //    Navigation.push(this.props.componentId, {
        //        component: { name: 'LoginScreen' }
        //    })
        }
    }
    
    static getById( uid ) {
        if ( !AUTH.currentUser ) {
            return Promise.reject('UserService.getById: User is not logged in.')
        }
        
        if ( !uid ) uid = AUTH.currentUser.uid
    
        return FIRESTORE.doc( uid ).get()
    }
}

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
