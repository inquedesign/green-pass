import React    from 'react'
import firebase from 'react-native-firebase'

import { Navigation  } from 'react-native-navigation'

const FIRESTORE = firebase.firestore()
const USERS     = FIRESTORE.collection( 'Users' )
const AUTH      = firebase.auth()

let profileUnsubscribe = null
let budsUnsubscribe    = null
let profileListeners   = new Set()
let budsListeners      = new Set()
let profileUnsubscribers = new Set()

export default class UserService {

    static addProfileListener( user, callback ) {
        if ( user ) {
            const unsubscribe = USERS.doc( user ).onSnapshot(
                docref => {
                    const age = getAge( docref.data().birthDate )
                    callback({ id: docref.id, age: age, ...docref.data() })
                }
            )
            profileUnsubscribers.add( unsubscribe )
            return unsubscribe
        }

        profileListeners.add( callback )

        return callback
    }

    static removeProfileListener( callback ) {
        if ( profileUnsubscribers.has( callback ) ) {
            callback()
            profileUnsubscribers.delete( callback )
        }
        else profileListeners.delete( callback )
    }

    static getProfile() {
        if ( !AUTH.currentUser ) {
            clearProfile()
            error = new Error( 'User is not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        if ( !profileUnsubscribe ) {
            return new Promise(( resolve, reject ) => {
                profileUnsubscribe = USERS.doc( AUTH.currentUser.uid ).onSnapshot(
                    docref => {
                        let age = null
                        if ( docref.data() && docref.data().birthDate ) {
                            age = getAge( docref.data().birthDate )
                        }
                        UserService.profile = { id: docref.id, age: age, ...docref.data() }
                        profileListeners.forEach( callback => {
                            callback( UserService.profile )
                        })
                        resolve( UserService.profile )
                    },
                    error => {
                        reject( error )
                    }
                )
            })
        }

        return Promise.resolve( UserService.profile )
    }

    static createAccount( email, password ) {
        return AUTH.createUserWithEmailAndPassword(
            email,
            password
        )
        .then( credentials => {
            clearProfile()
            clearBuds()
            UserService.getProfile()
            return credentials
        })
    }

    static login( email, password ) {
        return AUTH.signInWithEmailAndPassword(
            email,
            password
        )
        .then( credentials => {
            clearProfile()
            clearBuds()
            UserService.getProfile()
            return credentials
        })
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

        const supportedMethods = [
            'facebook',
            'twitter',
            'whatsapp',
            'snapchat',
            'reddit',
            'instagram',
            'text' 
        ]

        let batch = FIRESTORE.batch()
        supportedMethods.forEach( key => {
            if ( contactMethods[key] ) {
                const doc = USERS.doc( AUTH.currentUser.uid ).collection('ContactMethods').doc( key )
                batch = batch.set( doc, contactMethods[key], { merge: true } )
            }
        })
        return batch.commit()
    }

    static getContactMethods( uid, callback ) {
        if ( !AUTH.currentUser ) return null
        if ( !uid ) uid = AUTH.currentUser.uid

        // NOTE: If there are more than 10 documents in 1 query, it will fail.
        // Right now, there are at most 7, so it's ok.
        return USERS.doc( uid ).collection( 'ContactMethods' ).onSnapshot(
            queryResults => {
                // queryResults.docs() == [{id, data() => document, ...}]
                callback(
                    queryResults.docs.map( docref => {
                        return { method: docref.id, info: docref.data() }
                    })
                )
            },
            error => {
                callback( [] )
            }
        )
    }
    
    static unsubscribe( unsubscribeFunction ) {
        if ( unsubscribeFunction ) unsubscribeFunction()
    }

    static getUserById( uid ) {
        if ( !AUTH.currentUser ) {
            error = new Error( 'User is not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }
        
        if ( !uid ) {
            error = new Error( 'No user id provided.' )
            return Promise.reject( error )
        }
    
        return USERS.doc( uid ).get()
        .then(( docref ) => {
            const age = getAge( docref.data().birthDate )
            return { id: docref.id, age: age, ...docref.data() }
        })
    }

    static getUserByUsername( searchString ) {
        if ( !AUTH.currentUser ) {
            error = new Error( 'User is not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return USERS.where( 'username', '==', searchString )
        .get()
        .then(( results ) => {
            return userDataFrom( results )
        })
    }

    static addBudsListener( callback ) {
        if ( !AUTH.currentUser ) return
        
        budsListeners.add( callback )

        return callback
    }

    static removeBudsListener( callback ) {        
        budsListeners.delete( callback )
    }

    static getBuds() {
        if ( !AUTH.currentUser ) {
            clearBuds()
            error = new Error( 'User is not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        if ( !budsUnsubscribe ) {
            return new Promise(( resolve, reject ) => {
                budsUnsubscribe = USERS.where( 'buds', 'array-contains', AUTH.currentUser.uid ).onSnapshot(
                    queryResults => {
                        UserService.buds = userDataFrom( queryResults )
                        budsListeners.forEach( callback => {
                            callback( UserService.buds )
                        })
                        resolve( UserService.buds )
                    },
                    error => {
                        reject( error )
                    }
                )
            })
        }

        return Promise.resolve( UserService.buds )
    }
    
    static addBud( uid ) {
        if ( !AUTH.currentUser ) {
            error = new Error( 'User is not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return USERS.doc( AUTH.currentUser.uid ).collection( 'ContactList' ).doc( uid )
        .set({ id: uid })
    }
    
    static removeBud( uid ) {
        if ( !AUTH.currentUser ) {
            error = new Error( 'User is not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return FIRESTORE.batch()
        .delete( USERS.doc( AUTH.currentUser.uid ).collection( 'ContactList' ).doc( uid ) )
        .delete( USERS.doc( uid ).collection( 'ContactList' ).doc( AUTH.currentUser.uid ) )
        .commit()
    }
}

UserService.profile = null
UserService.buds    = null

function userDataFrom( queryResults ) {
    return queryResults.docs.map( (docref) => {
        const age = getAge( docref.data().birthDate )
        return { id: docref.id, age: age, ...docref.data() }
    })
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

function clearProfile() {
    if ( profileUnsubscribe ) { 
        profileUnsubscribe()
        profileUnsubscribe = null
    }
    profileListeners.clear()
    profileUnsubscribers.forEach( unsubscribe => unsubscribe() )
    profileUnsubscribers.clear()
    UserService.profile = null
}

function clearBuds() {
    if ( budsUnsubscribe ) {
        budsUnsubscribe()
        budsUnsubscribe = null
    }
    budsListeners.clear()
    UserService.buds = null
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
