import React    from 'react'
import firebase from 'react-native-firebase'

import { Navigation  } from 'react-native-navigation'

const FIRESTORE = firebase.firestore()
const USERS     = FIRESTORE.collection( 'Users' )
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

    static updateUser( dataToUpdate ) {
        if ( !AUTH.currentUser ) {
            error = new Error( 'User is not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        USERS
        .doc( AUTH.currentUser.uid )
        .set( dataToUpdate, { merge: true } )
    }
    
    static updateContactMethods( contactMethods ) {
        if ( !AUTH.currentUser ) {
            error = new Error( 'User is not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        let batch = FIRESTORE.batch()
        if ( contactMethods.text ) {
            const doc = USERS.doc( AUTH.currentUser.uid ).collection('ContactMethods').doc('text')
            batch = batch.set( doc, { number: contactMethods.text }, { merge: true } )
        }
        if ( contactMethods.facebook ) {
            const doc = USERS.doc( AUTH.currentUser.uid ).collection('ContactMethods').doc('facebook')
            batch = batch.set( doc, { username: contactMethods.facebook }, { merge: true } )
        }
        if ( contactMethods.instagram ) {
            const doc = USERS.doc( AUTH.currentUser.uid ).collection('ContactMethods').doc('instagram')
            batch = batch.set( doc, { username: contactMethods.instagram }, { merge: true } )
        }
        if ( contactMethods.snapchat ) {
            const doc = USERS.doc( AUTH.currentUser.uid ).collection('ContactMethods').doc('snapchat')
            batch = batch.set( doc, { username: contactMethods.snapchat }, { merge: true } )
        }
        return batch.commit()
    }

    static getById( uid ) {
        if ( !AUTH.currentUser ) {
            error = new Error( 'User is not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }
        
        if ( !uid ) uid = AUTH.currentUser.uid
    
        return USERS.doc( uid ).get()
        .then(( docref ) => {
            const age = getAge( docref.data().birthDate )
            return { id: docref.id, age: age, ...docref.data() }
        })
    }

    static getByUsername( searchString ) {
        if ( !AUTH.currentUser ) {
            error = new Error( 'User is not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return USERS.where( 'username', '==', searchString )
        .get()
        .then(( results ) => {
            return results.docs.map( (docref) => {
                const age = getAge( docref.data().birthDate )
                return { id: docref.id, age: age, ...docref.data() }
            })
        })
    }

    static getBuds() {
        if ( !AUTH.currentUser ) {
            error = new Error( 'User is not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return USERS.doc( AUTH.currentUser.uid ).collection( 'ContactList' )
        .get()
        .then(( results ) => results.docs )
    }
}

function getAge( birthDateString ) {
    const currentDate = new Date()
    const birthDate   = new Date( birthDateString )
    let age = currentDate.getFullYear() - birthDate.getFullYear()
    if ( currentDate.getMonth() < birthDate.getMonth() ||
       ( currentDate.getMonth() == birthDate.getMonth() &&
         currentDate.getDate()  < birthDate.getDate() )) {
        age = age - 1
    }

    return age
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
