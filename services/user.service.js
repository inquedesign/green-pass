import React               from 'react'
import firebase            from 'react-native-firebase'
import NotificationService from './notification.service'

import { Navigation    } from 'react-native-navigation'
import { initialLayout } from '../layouts'
import { SCREENS       } from '../util/constants'
//import { AccessToken,
//         LoginManager } from 'react-native-fbsdk';

const FIRESTORE = firebase.firestore()
const USERS     = FIRESTORE.collection( 'Users' )
const AUTH      = firebase.auth()
const FUNCTIONS = firebase.functions()

function login( credentials ) {
    NotificationService.configureNotifications()
    watchProfile.call(this)
    return credentials
}

function logout() {
    if ( !AUTH.currentUser ) return Promise.resolve()

    NotificationService.cancelNotifications()
    NotificationService.unsubscribePushNotifications()

    return AUTH.signOut()
    .then(() => {
        clearProfile.call(this)
        clearBuds.call(this)
        clearSocials.call(this)
    })
}

function clearProfile() {
    if ( this._profileUnsubscribe ) { 
        this._profileUnsubscribe()
        this._profileUnsubscribe = null
    }
    this._profileListeners.clear()
    this._userListeners.forEach( unsubscribe => unsubscribe() )
    this._userListeners.clear()
    this._profile = null
}

function clearBuds() {
    if ( this._budsUnsubscribe ) {
        this._budsUnsubscribe()
        this._budsUnsubscribe = null
    }
    this._budsListeners.clear()
    this._buds = null
}

function clearSocials() {
    this._socialListeners.forEach( unsubscribe => unsubscribe() )
    this._socialListeners.clear()
}

function watchProfile() {
    if ( !AUTH.currentUser ) {
        clearProfile.call(this)
        const error = new Error( 'Not logged in.' )
        error.name = "NOAUTH"
        return Promise.reject( error )
    }

    if ( !this._profileUnsubscribe ) {
        this._profileUnsubscribe = USERS.doc( AUTH.currentUser.uid ).onSnapshot(
            docref => {
                let age = null
                if ( docref.data() && docref.data().birthDate ) {
                    age = getAge( docref.data().birthDate )
                }
                this._profile = { id: docref.id, age: age, ...docref.data() }
                this._profileListeners.forEach( callback => {
                    callback( this._profile )
                })
            }
        )
    }

    return Promise.resolve( this._profile )
}

function userDataFrom( queryResults ) {
    return queryResults.docs.map( (docref) => {
        const age = getAge( docref.data().birthDate )
        return { id: docref.id, age: age, ...docref.data() }
    })
}

function getAge( birthDateString ) {
    if ( !Date.parse( birthDateString ) ) return 0
    
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


class UserServiceClass {
    constructor() {
        this._profile = null
        this._buds    = null
        this._profileUnsubscribe = null
        this._budsUnsubscribe    = null
        this._profileListeners   = new Set()
        this._budsListeners      = new Set()
        this._userListeners      = new Set()
        this._socialListeners    = new Set()
    }

    get currentUser() {
        return AUTH.currentUser
    }

    get profile() {
        return this._profile
    }
    
    get buds() {
        return this._buds
    }

    createAccount( email, password ) {
        return logout.call(this)
        .then(()=> {
            return AUTH.createUserWithEmailAndPassword(
                email,
                password
            )
        })
        .then( login.bind( this ) )
    }

    deleteAccount() {
        if ( !AUTH.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return FUNCTIONS.httpsCallable( 'deleteAccount' )()
        .then(() => {
            return this.logout()
        })
        .then(() => {
            alert( 'Account deleted' )
        })
    }

    login( email, password ) {
        return logout.call(this)
        .then(() => {
            return AUTH.signInWithEmailAndPassword(
                email,
                password
            )
        })
        .then( login.bind( this ) )
    }
    
    logout() {
        return logout.call(this)
        .then(() => {
            return Navigation.setRoot({ root: initialLayout( SCREENS.START_SCREEN ) })
        })
    }

    getUserById( userid ) {
        if ( !AUTH.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }
        
        if ( !userid ) {
            userid = AUTH.currentUser.uid
        }
    
        return USERS.doc( userid ).get()
        .then(( docref ) => {
            const age = getAge( docref.data().birthDate )
            return { id: docref.id, age: age, ...docref.data() }
        })
    }

    getUserByUsername( searchString ) {
        if ( !AUTH.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return USERS.where( 'username', '==', searchString )
        .get()
        .then(( results ) => {
            return userDataFrom( results )
        })
    }

    updateUser( dataToUpdate ) {
        if ( !AUTH.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        USERS
        .doc( AUTH.currentUser.uid )
        .set( dataToUpdate, { merge: true } )
    }
    
    updateContactMethods( contactMethods ) {
        if ( !AUTH.currentUser ) {
            const error = new Error( 'Not logged in.' )
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

    getContactMethods( userid, callback ) {
        if ( !AUTH.currentUser ) return null
        if ( !userid ) userid = AUTH.currentUser.uid

        const contactMethods = USERS.doc( userid ).collection( 'ContactMethods' )

        if ( callback ) {
            // NOTE: If there are more than 10 documents in 1 query, it will fail.
            // Right now, there are at most 7, so it's ok.
            const unsubsribe = contactMethods.onSnapshot(
                queryResults => {
                    // queryResults.docs() == [{id, data() => document, ...}]
                    let contactMethods = {}
                    queryResults.docs.forEach( docref => {
                        contactMethods[ docref.id ] = docref.data()
                    })
                    callback( contactMethods )
                },
                error => {
                    callback( {} )
                }
            )

            this._socialListeners.add( unsubsribe )
            return unsubsribe
        }
        else {
            return contactMethods.get()
            .then( queryResults => {
                // queryResults.docs() == [{id, data() => document, ...}]
                let contactMethods = {}
                queryResults.docs.forEach( docref => {
                    contactMethods[ docref.id ] = docref.data()
                })
                return contactMethods
            })
        }
    }
    
    addProfileListener( user, callback ) {
        if ( user ) {
            const unsubscribe = USERS.doc( user ).onSnapshot(
                docref => {
                    const age = getAge( docref.data().birthDate )
                    callback({ id: docref.id, age: age, ...docref.data() })
                }
            )
            this._userListeners.add( unsubscribe )
            return unsubscribe
        }

        this._profileListeners.add( callback )

        return callback
    }

    addBudsListener( callback ) {
        if ( !AUTH.currentUser ) return
        
        this._budsListeners.add( callback )

        return callback
    }

    unsubscribe( unsubscribeFunction ) {
        if ( this._userListeners.has( unsubscribeFunction ) ) {
            unsubscribeFunction()
            this._userListeners.delete( unsubscribeFunction )
        }
        else if ( this._profileListeners.has( unsubscribeFunction ) ) {
            this._profileListeners.delete( unsubscribeFunction )
        }
        else if ( this._budsListeners.has( unsubscribeFunction ) ) {
            this._budsListeners.delete( unsubscribeFunction )
        }
        else if ( this._socialListeners.has( unsubscribeFunction ) ) {
            unsubscribeFunction()
            this._socialListeners.delete( unsubscribeFunction )
        }
    }

    getBuds() {
        if ( !AUTH.currentUser ) {
            clearBuds.call(this)
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        if ( !this._budsUnsubscribe ) {
            return new Promise(( resolve, reject ) => {
                this._budsUnsubscribe = USERS.where( 'buds', 'array-contains', AUTH.currentUser.uid ).onSnapshot(
                    queryResults => {
                        this._buds = userDataFrom( queryResults )
                        this._budsListeners.forEach( callback => {
                            callback( this._buds )
                        })
                        resolve( this._buds )
                    },
                    error => {
                        reject( error )
                    }
                )
            })
        }

        return Promise.resolve( this._buds )
    }
    
    addBud( uid ) {
        if ( !AUTH.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return USERS.doc( AUTH.currentUser.uid ).collection( 'ContactList' ).doc( uid )
        .set({ id: uid })
    }
    
    removeBud( uid ) {
        if ( !AUTH.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return FIRESTORE.batch()
        .delete( USERS.doc( AUTH.currentUser.uid ).collection( 'ContactList' ).doc( uid ) )
        .delete( USERS.doc( uid ).collection( 'ContactList' ).doc( AUTH.currentUser.uid ) )
        .commit()
    }
    
    // facebookLogin() {
    //    return LoginManager.logInWithReadPermissions(['public_profile', 'email'])
    //    .then( result => {
    //        if ( result.isCancelled ) {
    //            const error = new Error('Request was canceled.')
    //            error.name = 'CANCELED'
    //            throw error
    //        }
//
    //        return AccessToken.getCurrentAccessToken()
    //    })
    //    .then( data => {
    //        if ( !data ) {
    //            throw new Error('There was a problem obtaining the access token.')
    //        }
//
    //        // create a new firebase credential with the token
    //        const credential = firebase.auth.FacebookAuthProvider.credential( data.accessToken )
//
    //        // login with credential
    //        return firebase.auth().signInWithCredential( credential )
    //    })
    //    .then( credentials => {
    //        initialize()
    //        return credentials
    //    })
    //}
}

const UserService = new UserServiceClass()

export default UserService

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
