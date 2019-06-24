import React               from 'react'
import firebase            from 'react-native-firebase'
import DeviceInfo          from 'react-native-device-info'
import BGLocation          from '@mauron85/react-native-background-geolocation'
import NotificationService from './notification.service'

import { Platform,
         AppState      } from 'react-native'
import { Navigation    } from 'react-native-navigation'
import { initialLayout } from '../layouts'
import { SCREENS       } from '../util/constants'
//import { AccessToken,
//         LoginManager } from 'react-native-fbsdk';

const uuidv4 = require( 'uuid/v4' )

const FIRESTORE = firebase.firestore()
const USERS     = FIRESTORE.collection( 'Users' )
const AUTH      = firebase.auth()
const LINKS     = firebase.links()
const FUNCTIONS = firebase.functions()
const functions = {
    registerProfileListener  : FUNCTIONS.httpsCallable( 'registerProfileListener' ),
    unregisterProfileListener: FUNCTIONS.httpsCallable( 'unregisterProfileListener' ),
    registerBudListener      : FUNCTIONS.httpsCallable( 'registerBudListener' ),
    unregisterBudListener    : FUNCTIONS.httpsCallable( 'unregisterBudListener' ),
    deleteAccount            : FUNCTIONS.httpsCallable( 'deleteAccount' ),
    getProfile               : FUNCTIONS.httpsCallable( 'getProfile' ),
    updateProfile            : FUNCTIONS.httpsCallable( 'updateProfile' ),
    getContactMethods        : FUNCTIONS.httpsCallable( 'getContactMethods' ),
    updateContactMethods     : FUNCTIONS.httpsCallable( 'updateContactMethods' ),
    findByUserName           : FUNCTIONS.httpsCallable( 'findByUserName' ),
    getBuds                  : FUNCTIONS.httpsCallable( 'getBuds' ),
    getBudRequesters         : FUNCTIONS.httpsCallable( 'getBudRequesters' ),
    getBudRequest            : FUNCTIONS.httpsCallable( 'getBudRequest' ),
    addBud                   : FUNCTIONS.httpsCallable( 'addBud' ),
    removeBud                : FUNCTIONS.httpsCallable( 'removeBud' ),
    updateLocation           : FUNCTIONS.httpsCallable( 'updateLocation' )
}

let authListener = null
let linkListener = null

function login( credentials ) {
    NotificationService.configureNotifications()
    return credentials
}

function logout() {
    if ( !AUTH.currentUser ) return Promise.resolve()

    NotificationService.cancelNotifications()
    NotificationService.unsubscribePushNotifications()

    clearProfile.call( this )
    clearBuds.call( this )
    this._contactMethods = null
    this._requests       = null

    return AUTH.signOut()
}

// TODO: listeners may change when mechanism for watching database changes
function clearProfile() {
    this._profileListeners.forEach(( user, userid ) => {
        unregisterProfileListener( userid )
    })
    this._profileListeners.clear()
    this._profile = null
}

// TODO: listeners may change when mechanism for watching database changes
function clearBuds() {
    unregisterBudListener()
    this._budsListeners.clear()
    this._buds = null
}

function getProfileData( document ) {
    if ( !document ) return {}

    if ( document._id ) document.id = document._id

    if ( document.birthDate ) document.age = getAge( document.birthDate )

    return document
}

function userDataFrom( queryResults ) {
    return queryResults.map( document => {
        return getProfileData( document )
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

function processLink( url ) {
    if ( !url ) return;
    if ( !/mode=resetPassword/.test( url ) ) return;

    const email = url.replace( /.*https:\/\/greenpass.page.link\/reset\/([^&]+).*/, '$1' )
    const code  = url.replace( /.*oobCode=([^&]+).*/, '$1' )

    Navigation.push( SCREENS.ROOT_SCREEN, {
        component: {
            name: SCREENS.PASSWORD_RESET_SCREEN,
            passProps: {
                email: email,
                verificationCode: code
            }
        }
    })
}

function registerProfileListener( userid ) {
    FUNCTIONS.httpsCallable( 'registerProfileListener' )({
        user    : userid,
        deviceId: DeviceInfo.getUniqueID()
    })
    .catch( error => {
        console.error( JSON.stringify( error, null, 4 ) )
    })
}

function unregisterProfileListener( userid ) {
    FUNCTIONS.httpsCallable( 'unregisterProfileListener' )({
        user    : userid,
        deviceId: DeviceInfo.getUniqueID()
    })
    .catch( error => {
        console.error( JSON.stringify( error, null, 4 ) )
    })
}

function registerBudListener() {
    FUNCTIONS.httpsCallable( 'registerBudListener' )({
        deviceId: DeviceInfo.getUniqueID()
    })
    .catch( error => {
        console.error( JSON.stringify( error, null, 4 ) )
    })
}

function unregisterBudListener() {
    FUNCTIONS.httpsCallable( 'unregisterBudListener' )({
        deviceId: DeviceInfo.getUniqueID()
    })
    .catch( error => {
        console.error( JSON.stringify( error, null, 4 ) )
    })
}

function updateLocation( location, message ) {
    console.warn( message )
    if ( !AUTH.currentUser ) return
    if ( !location.longitude || !location.latitude ) return

    BGLocation.startTask( taskKey => {
        functions.updateLocation({ lat: location.latitude, lon: location.longitude })
        .then(() => {
            console.warn( 'location updated' )
            BGLocation.endTask( taskKey )
        })
    })
}

const State = {
    active    : 'active',
    background: 'background'
}

class UserServiceClass {
    constructor() {
        this.currentState             = null
        this._profile                 = null
        this._buds                    = null
        this._requests                = null
        this._contactMethods          = null
        this._profileListeners        = new Map()
        this._budsListeners           = new Set()

        // Because component unmount hooks never get called when app is killed,
        // listeners have to be deregistered everytime the app goes into background
        // in order to prevent database accumulation of orphaned listeners.
        AppState.addEventListener('change', newState => {
            let oldState = this.currentState
            this.currentState = newState

            switch( newState ) {
            case State.active:
                if ( oldState !== State.background ) return

                this.refreshData()

                this._profileListeners.forEach(( user, userid ) => {
                    registerProfileListener( userid )
                })
                
                if ( this._budsListeners.size > 0 ) {
                    registerBudListener()
                }

                return
            case State.background:
                if ( oldState !== State.active ) return

                this._profileListeners.forEach(( user, userid ) => {
                    unregisterProfileListener( userid )
                })
                
                if ( this._budsListeners.size > 0 ) {
                    unregisterBudListener()
                }

                return
            }
        })

        BGLocation.configure({
            locationProvider       : BGLocation.DISTANCE_FILTER_PROVIDER,
            desiredAccuracy        : BGLocation.PASSIVE_ACCURACY,
            stationaryRadius       : 50,
            distanceFilter         : 500,
            interval               : 5 * 60 * 1000,
            notificationsEnabled   : false,
            saveBatteryOnBackground: true,
            activityType           : BGLocation.Other,
            maxLocations           : 10,
            debug: true
        })

        BGLocation.on( 'location',   location => updateLocation( location, 'location' ) )
        BGLocation.on( 'stationary', location => updateLocation( location, 'stationary' ) )
        BGLocation.on( 'start', () => console.warn( 'geolocation started' ) )
        BGLocation.on( 'stop', () => console.warn( 'geolocation stopped' ) )
        BGLocation.on( 'error', error => console.error( JSON.stringify( error, null, 4 ) ) )
        BGLocation.start()

        firebase.messaging().hasPermission()
        .then( enabled => {
            if ( enabled ) return
            else return firebase.messaging().requestPermission()
        })
        .then(() => {
            firebase.messaging().onMessage( update => {
                const type   = update.data.type
                const data   = update.data.data ? JSON.parse( update.data.data ) : null
                const userid = update.data.user

                switch( type ) {
                case 'profile-update': {
                    const profileChanges = getProfileData( data )

                    Promise.resolve( userid === this.currentUser.uid ?
                        this.getProfile()
                        .then( profile => {
                            Object.assign( this._profile, profileChanges )
                            return this._profile
                        })
                        :
                        Promise.all([
                            this.getBuds(),
                            this.getBudRequesters()
                        ])
                        .then( results => {
                            let bud = null

                            if ( results[0].has( userid ) ) bud = results[0].get( userid )
                            else if ( results[1].has( userid ) ) bud = results[1].get( userid )

                            if ( bud ) {
                                Object.assign( bud, profileChanges )

                                this._budsListeners.forEach( callback => {
                                    callback()
                                })
                            }

                            return profileChanges
                        })
                    )
                    .then( profile => {
                        const listeners = this._profileListeners.get( userid )
                        if ( listeners ) {
                            listeners.forEach( callback => {
                                callback( profile, null )
                            })
                        }
                    })
                } break
                case 'contact-methods-update': {
                    if ( userid === this.currentUser.uid ) {
                        this.getContactMethods()
                        .then( contactMethods => {
                            Object.assign( this._contactMethods, data )
                        })
                    }

                    const listeners = this._profileListeners.get( userid )
                    if ( listeners ) {
                        listeners.forEach( callback => {
                            callback( null, data )
                        })
                    }
                } break
                case 'bud-added': {
                    return Promise.all([
                        this.getBudRequesters(),
                        this.getBuds()
                    ])
                    .then( results => {
                        const user = getProfileData( data )

                        results[0].delete( user.id )
                        results[1].set( user.id, user )

                        this.getContactMethods( user.id )
                        .then( contactMethods => {
                            const listeners = this._profileListeners.get( user.id )
                            if ( listeners ) {
                                listeners.forEach( callback => {
                                    callback( null, contactMethods, results[1] )
                                })
                            }
                        })

                        this._budsListeners.forEach( callback => {
                            callback()
                        })
                    })
                } break
                case 'bud-request': {
                    const user = getProfileData( data.user )

                    if ( data.request.requester !== this.currentUser.uid ) this.getBudRequesters()
                    .then( requests => {
                        requests.set( user.id, user )

                        this._budsListeners.forEach( callback => {
                            callback()
                        })
                    })

                    const listeners = this._profileListeners.get( user.id )
                    if ( listeners ) {
                        listeners.forEach( callback => {
                            callback( null, null, null, data.request )
                        })
                    }
                } break
                case 'bud-removed': {
                    Promise.all([ this.getBudRequesters(), this.getBuds() ])
                    .then( results => {
                        results[0].delete( userid )
                        results[1].delete( userid )

                        const listeners = this._profileListeners.get( userid )
                        if ( listeners ) {
                            listeners.forEach( callback => {
                                callback( null, null, results[1] )
                            })
                        }

                        this._budsListeners.forEach( callback => {
                            callback()
                        })
                    })
                } break
                }
            })
        })
    }

    get currentUser() {
        return AUTH.currentUser
    }

    refresh() {
        if ( this.currentUser ) {
            return this.currentUser.reload()
            .then(() => {
                this.refreshData()
                return this.currentUser
            })
            .catch( error => { return null })
        }
        return Promise.resolve( this.currentUser )
    }
    
    refreshData() {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        this._profile        = null
        this._buds           = null
        this._requests       = null
        this._contactMethods = null

        Promise.all([
            this.getProfile(),
            this.getBuds(),
            this.getContactMethods(),
            this.getBudRequesters()
        ])
        .then(() => {
            this._profileListeners.forEach(( user, userid ) => {
                if ( userid !== this.currentUser.uid ) {
                    Promise.all([
                        this.getUserById( userid ),
                        this.getContactMethods( userid ),
                        this.getBuds(),
                        this.getBudRequest( userid )
                    ])
                    .then( results => {
                        user.forEach( callback => {
                            callback( results[0], results[1], results[2], results[3] )
                        })
                    })
                }
                else {
                    user.forEach( callback => {
                        callback( this._profile, this._contactMethods, this._buds )
                    })
                }
            })
            this._budsListeners.forEach( callback => {
                callback()
            })
        })
    }

    createAccount( email, password ) {
        return logout.call(this)
        .then(() => {
            return AUTH.createUserWithEmailAndPassword(
                email,
                password
            )
        })
        .then( credentials => {
            // Due to age verification gateway, profile should always have a birthDate at least
            return this.updateUser( this._profile )
            .then(() => {
                return credentials
            })
        })
        .then( login.bind( this ) )
    }

    deleteAccount() {
        if ( !this.currentUser ) {
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

    // TODO: make sure profile is being refreshed with logout/login/create account
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

    // Returns current user's profile as Promise< Profile >
    getProfile() {
        if ( !this._profile ) {
            this._profile = this.getUserById()
            .then( result => {
                if ( result ) {
                    this._profile = result
                }
                else {
                    this._profile = {}
                }

                return this._profile
            })
        }

        return Promise.resolve( this._profile )
    }
    
    // Returns Promise< Profile >
    getUserById( userid ) {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }
        
        if ( !userid ) {
            userid = this.currentUser.uid
        }
    
        return FUNCTIONS.httpsCallable( 'getProfile' )({ user: userid })
        .then(response => {
            return getProfileData( response.data )
        })
    }

    // Returns Profile[]
    getUserByUsername( searchString, callback ) {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return FUNCTIONS.httpsCallable( 'findByUserName' )({ searchString: searchString })
        .then( response => {
            return userDataFrom( response.data )
        })
    }

    updateUser( dataToUpdate ) {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return FUNCTIONS.httpsCallable( 'updateProfile' )( dataToUpdate )
        .then(() => {
            return this.getProfile()
        })
        .then( profile => {
            Object.assign( this._profile, dataToUpdate )
        })
    }
    
    // Returns Promise< ContactMethods >
    getContactMethods( userid ) {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        if ( !userid ) {
            userid = this.currentUser.uid

            if ( !this._contactMethods ) {
                this._contactMethods = FUNCTIONS.httpsCallable( 'getContactMethods' )({ user: userid })
                .then( response => {
                    this._contactMethods = response.data ? response.data : {}
                    
                    return this._contactMethods
                })
            }

            return Promise.resolve( this._contactMethods )
        }
        else {
            return this.getBuds()
            .then( buds => {
                if ( !buds.has( userid ) ) return null

                return FUNCTIONS.httpsCallable( 'getContactMethods' )({ user: userid })
                .then( response => {
                    return response.data ? response.data : {}
                })
            })
            .catch( error => {
                return null
            })
        }
    }
    
    updateContactMethods( methodsToUpdate ) {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return FUNCTIONS.httpsCallable( 'updateContactMethods' )( methodsToUpdate )
        .then(() => {
            return this.getContactMethods()
        })
        .then( contactMethods => {
            Object.assign( this._contactMethods, methodsToUpdate )
        })
    }

    // TODO: handle update messages

    // Returns Promise< Profile[] >
    getBuds() {
        if ( !this.currentUser ) {
            // TODO: determine if needed
            //clearBuds.call(this)
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        if ( !this._buds ) {
            this._buds = FUNCTIONS.httpsCallable( 'getBuds' )()
            .then( response => {
                const buds = userDataFrom( response.data )
                this._buds = new Map()

                buds.forEach( bud => {
                    this._buds.set( bud.id, bud )
                })
                
                return this._buds
            })
        }

        return Promise.resolve( this._buds )
    }

    // Returns Promise< Profile[] >
    getBudRequesters() {
        if ( !this.currentUser ) {
            // TODO: determine if needed
            //clearBuds.call(this)
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        if ( !this._requests ) {
            this._requests = FUNCTIONS.httpsCallable( 'getBudRequesters' )()
            .then( response => {
                const budRequesters = userDataFrom( response.data )
                this._requests      = new Map()

                budRequesters.forEach( bud => {
                    this._requests.set( bud.id, bud )
                })

                return this._requests
            })
        }

        return Promise.resolve( this._requests )
    }
    
    // Returns { _id: ObjectId, requester: userid, requestee: userid }
    getBudRequest( userid ) {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return FUNCTIONS.httpsCallable( 'getBudRequest' )({ user: this.currentUser.uid, bud: userid })
        .then( response => {
            return response.data
        })
    }

    addBud( userid ) {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return FUNCTIONS.httpsCallable( 'addBud' )({ user: userid })
    }
    
    removeBud( userid ) {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return FUNCTIONS.httpsCallable( 'removeBud' )({ user: userid })
    }
    
    // TODO: mongo-ize
    // callback is ( profile, contactMethods ) => {}
    addProfileListener( user, callback ) {
        if ( !this.currentUser ) return

        if ( !user ) {
            user = this.currentUser.uid
        }

        const uuid = uuidv4()

        if ( this._profileListeners.has( user ) ) {
            this._profileListeners.get( user ).set( uuid, callback )
        }
        else {
            this._profileListeners.set( user, new Map([[ uuid, callback ]]) )
            registerProfileListener( user )
        }

        return uuid
    }

    // callback is ({ buds: profile[], requests: profile[], budlist: Set<userid> }) => {}
    addBudsListener( callback ) {
        if ( !this.currentUser ) return
        
        if ( this._budsListeners.size === 0 ) {
            registerBudListener()
        }

        this._budsListeners.add( callback )

        return callback
    }

    unsubscribe( handle ) {
        this._profileListeners.forEach(( user, userid ) => {
            if ( user.has( handle ) ) {
                user.delete( handle )
                if ( user.size === 0 ) {
                    unregisterProfileListener( userid )
                    this._profileListeners.delete( userid )
                }
            }
        })

        if ( this._budsListeners.has( handle ) ) {
            this._budsListeners.delete( handle )

            if ( this._budsListeners.size === 0 ) {
                unregisterBudListener()
            }
        }
    }
    
    unsubscribeAll() {
        this._profileListeners.forEach(( user, userid ) => {
            unregisterProfileListener( userid )
        })
        unregisterBudListener()

        this._profileListeners.clear()
        this._budsListeners.clear()
    }

    // TODO: implement listener for remote changes to buds, requests, budList

    sendPasswordResetEmail( email ) {
        return AUTH.sendPasswordResetEmail( email, {
            url: `https://greenpass.page.link/reset/${email}`,
            android: { packageName: 'com.alopexinteractiondesign.greenpass', installApp: true },
            iOS: { bundleId: 'com.alopexinteractiondesign.greenpass' },
            handleCodeInApp: true
        })
    }
    
    resetPassword( verificationCode, password ) {
        return AUTH.confirmPasswordReset( verificationCode, password )
    }
    
    handleDeepLinking() {
        if ( linkListener ) return

        if ( Platform.OS === 'android' ) {
            LINKS.getInitialLink().then( processLink )
        }

        linkListener = LINKS.onLink( processLink )
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
