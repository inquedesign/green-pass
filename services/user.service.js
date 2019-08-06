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
    registerProfileListeners   : FUNCTIONS.httpsCallable( 'registerProfileListeners' ),
    unregisterProfileListeners : FUNCTIONS.httpsCallable( 'unregisterProfileListeners' ),
    registerLocationListeners  : FUNCTIONS.httpsCallable( 'registerLocationListeners' ),
    unregisterLocationListeners: FUNCTIONS.httpsCallable( 'unregisterLocationListeners' ),
    unregisterAllListeners     : FUNCTIONS.httpsCallable( 'unregisterAllListeners' ),
    deleteAccount              : FUNCTIONS.httpsCallable( 'deleteAccount' ),
    getProfile                 : FUNCTIONS.httpsCallable( 'getProfile' ),
    updateProfile              : FUNCTIONS.httpsCallable( 'updateProfile' ),
    getContactMethods          : FUNCTIONS.httpsCallable( 'getContactMethods' ),
    updateContactMethods       : FUNCTIONS.httpsCallable( 'updateContactMethods' ),
    findByUserName             : FUNCTIONS.httpsCallable( 'findByUserName' ),
    getBuds                    : FUNCTIONS.httpsCallable( 'getBuds' ),
    getBudRequesters           : FUNCTIONS.httpsCallable( 'getBudRequesters' ),
    getBudRequest              : FUNCTIONS.httpsCallable( 'getBudRequest' ),
    addBud                     : FUNCTIONS.httpsCallable( 'addBud' ),
    removeBud                  : FUNCTIONS.httpsCallable( 'removeBud' ),
    findByLocation             : FUNCTIONS.httpsCallable( 'findByLocation' ),
    updateLocation             : FUNCTIONS.httpsCallable( 'updateLocation' ),
    updateAppState             : FUNCTIONS.httpsCallable( 'updateAppState' )
}

let linkListener = null

function login( credentials ) {
    NotificationService.configureNotifications()
    BGLocation.start()
    Promise.resolve( credentials )
}

function logout() {
    if ( !AUTH.currentUser ) return Promise.resolve()
    
    this._profile        = null
    this._buds           = null
    this._requests       = null
    this._nearbyUsers    = null
    this._contactMethods = null
    this._location       = null

    return Promise.all([
        BGLocation.stop(),
        NotificationService.cancelNotifications(),
        NotificationService.unsubscribePushNotifications(),
        this.unsubscribeAll()
    ])
    .then(() => {
        return AUTH.signOut()
    })
}

function getProfileData( document ) {
    if ( !document ) return {}

    if ( document._id ) document.id = document._id

    if ( document.birthDate ) document.age = getAge( document.birthDate )
    
    if ( !document.distance ) document.distance = UserService.getDistance( document.location )

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

function updateDistances() {
    if ( this.currentLocation ) this._profile.distance = 0
    else this._profile.distance = null

    return Promise.all([
        this.getBuds().then(() => {
            if ( this._buds ) this._buds.forEach( user => {
                user.distance = this.getDistance( user.location )
            })
        }),
        this.getBudRequesters().then(() => {
            if ( this._requests ) this._requests.forEach( user => {
                user.distance = this.getDistance( user.location )
            })
        }),
        this.getUsersNearby().then(() => {
            if ( this._nearbyUsers ) this._nearbyUsers.forEach( user => {
                user.distance = this.getDistance( user.location )
            })
        })
    ])
}

function processLink( url ) {
    if ( !url ) return;
    if ( !/mode=resetPassword/.test( url ) ) return;

    const email = url.replace( /.*https:\/\/greenpass.page.link\/reset\/([^&]+).*/, '$1' )
    const code  = url.replace( /.*oobCode=([^&]+).*/, '$1' )

    Navigation.push( SCREENS.INITIAL_LAYOUT, {
        component: {
            name: SCREENS.PASSWORD_RESET_SCREEN,
            passProps: {
                email: email,
                verificationCode: code
            }
        }
    })
}

// Takes an array
function registerProfileListeners( userids ) {
    return functions.registerProfileListeners({
        users   : userids,
    })
    .catch( error => {
        console.error( JSON.stringify( error, null, 4 ) )
    })
}

// Takes an array
function unregisterProfileListeners( userids ) {
    return functions.unregisterProfileListeners({
        users   : userids,
    })
    .catch( error => {
        console.error( JSON.stringify( error, null, 4 ) )
    })
}

// Takes an array
function registerLocationListeners( userids ) {
    return functions.registerLocationListeners({
        users   : userids,
    })
    .catch( error => {
        console.error( JSON.stringify( error, null, 4 ) )
    })
}

// Takes an array
function unregisterLocationListeners( userids ) {
    return functions.unregisterLocationListeners({
        users   : userids,
    })
    .catch( error => {
        console.error( JSON.stringify( error, null, 4 ) )
    })
}

function updateLocation( location ) {
    return new Promise(( resolve, reject ) => {
        if ( !AUTH.currentUser ) {
            reject( 'Update Location: user not logged in.' )
            return
        }

        if ( !location.longitude || !location.latitude ) {
            reject( 'Update Location: longitude or latitude is missing or malformed.' )
            return
        }

        const distanceMoved = this.getDistance({ coordinates: [ location.longitude, location.latitude ] })

        if ( distanceMoved != null && distanceMoved < .025 ) {
            resolve( this._nearbyUsers )
            return
        }

        this.currentLocation = { lat: location.latitude, lon: location.longitude }

        BGLocation.startTask( taskKey => {
            functions.updateLocation( Object.assign( {}, this.currentLocation ) )
            .then( nearbyUsers => {
                this._nearbyUsers = userDataFrom( nearbyUsers.data )
                return updateDistances.call( this )
            })
            .then(() => {
                this._profileListeners.forEach(( user, userid ) => {
                    if ( user == this.currentUser.uid ) return
                    user.forEach( callback => {
                        callback( null, null, null, null, this.currentLocation )
                    })
                })

                this._locationListeners.forEach( callback => {
                    callback( this._nearbyUsers )
                })

                this._budsListeners.forEach( callback => {
                    callback()
                })

                resolve( this._nearbyUsers )
                BGLocation.endTask( taskKey )
            })
            .catch( error => {
                console.warn( JSON.stringify( error, null, 4 ) )
            })
        })
    })
}

class UserServiceClass {
    get State() {
        return {
            active    : 'active',
            background: 'background'
        }
    }

    constructor() {
        this.BGLocationIsRunning = false
        this.currentState      = null
        this._location         = null
        this._profile          = null
        this._buds             = null
        this._nearbyUsers      = null
        this._requests         = null
        this._contactMethods   = null
        this._profileListeners = new Map()
        this._budsListeners    = new Map()
        this._locationListeners= new Map()

        // Refresh Data when entering foreground
        AppState.addEventListener('change', newState => {
            let oldState = this.currentState
            this.currentState = newState

            if ( !this.currentUser ) return // Not logged in

            switch( newState ) {
            case this.State.active:
                if ( oldState == this.State.active ) return

                functions.updateAppState({ foreground: true })
                this.refreshData()

                return
            case this.State.background:
                if ( oldState == this.State.background ) return

                functions.updateAppState({ foreground: false })

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
        })

        BGLocation.on( 'start', () => {
            this.BGLocationIsRunning = true
        })
        
        BGLocation.on( 'stop', () => {
            this.BGLocationIsRunning = false
        })

        this._nearbyUsers = new Promise(( resolve, reject ) => {
            let onLocation
            let onStationary
            let onFail

            const replaceListeners = () => {
                onLocation.remove()
                onStationary.remove()
                onFail.remove()
                BGLocation.on( 'location',   updateLocation.bind(this) )
                BGLocation.on( 'stationary', updateLocation.bind(this) )
                BGLocation.on( 'authorization', status => {
                    BGLocation.checkStatus( status => {
                        const enabled       = status.locationServicesEnabled
                        const authorization = status.authorization
                        if ( enabled === this.enabled && authorization === this.authorization ) return

                        this.enabled       = enabled    
                        this.authorization = authorization

                        if ( enabled && authorization != BGLocation.NOT_AUTHORIZED ) {
                            BGLocation.start()
                        }
                        else {
                            BGLocation.stop()
                            this.currentLocation = null
                            this._nearbyUsers = []
                        }
                    })
                })
            }

            const locationCallback = ( location ) => {
                replaceListeners()
                updateLocation.call( this, location )
                .then( nearbyUsers => {
                    resolve( nearbyUsers )
                })
            }

            onFail = BGLocation.on( 'authorization', status => {
                BGLocation.checkStatus( status => {
                    this.enabled       = status.locationServicesEnabled
                    this.authorization = status.authorization
                })

                if ( status != BGLocation.NOT_AUTHORIZED ) return;

                BGLocation.stop()
                replaceListeners()
                this._nearbyUsers = null
                resolve( this._nearbyUsers )
            })

            onLocation = BGLocation.on( 'location',   location => {
                locationCallback( location )
            })

            onStationary = BGLocation.on( 'stationary', location => {
                locationCallback( location )
            })
        })

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

                        this.getUsersNearby().then(() => {
                            if ( this._nearbyUsers ) {
                                let user = this._nearbyUsers.find( user => user.id == userid )
                                if ( user ) {
                                    Object.assign( user, profile )
                                    this._locationListeners.forEach( callback => {
                                        callback( this._nearbyUsers )
                                    })
                                }
                            }
                        })
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
                        
                        this.getUsersNearby()
                        .then(() => {
                            this._locationListeners.forEach( callback => {
                                callback( this._nearbyUsers )
                            })
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

                        this.getUsersNearby()
                        .then(() => {
                            this._locationListeners.forEach( callback => {
                                callback( this._nearbyUsers )
                            })
                        })
                    })
                } break
                case 'location-update': {
                    this.getUsersNearby()
                    .then( nearbyUsers => {
                        if ( !nearbyUsers ) return
                        const user  = getProfileData( data )
                        const index = nearbyUsers.findIndex( element => element.id === user.id )
                        if ( index > -1 ) {
                            if (
                                nearbyUsers.length >= 100 &&
                                user.distance > nearbyUsers[nearbyUsers.length-1].distance
                            ) {
                                // If user in list && last, refresh list
                                this._nearbyUsers = null
                                this.getUsersNearby()
                                .then( nearbyUsers => {
                                    if ( this.currentLocation ) {
                                        this._nearbyUsers.forEach( user => {
                                            user.distance = this.getDistance( user.location )
                                        })
                                    }

                                    this._locationListeners.forEach( callback => {
                                        callback( this._nearbyUsers )
                                    })
                                })
                            }
                            else {
                                // If user in list && !last, update position
                                let users = this._nearbyUsers
                                users.splice( index, 1 )
                                
                                updatePosition( user, users )

                                this._locationListeners.forEach( callback => {
                                    callback( this._nearbyUsers )
                                })
                            }
                        }
                        else if (
                            nearbyUsers.length < 100 ||
                            user.distance < nearbyUsers[nearbyUsers.length-1].distance
                        ) {
                            // If user !in list && !last, add listener, limit to 100
                            registerLocationListeners([ user.id ])

                            let users = this._nearbyUsers
                            if ( users.length >= 100 ) {
                                let farthest = users.pop()
                                unregisterLocationListeners([ farthest.id ])
                            }

                            updatePosition( user, users )

                            this._locationListeners.forEach( callback => {
                                callback( this._nearbyUsers )
                            })
                        }
                        // If user !in list && last, do nothing

                        function updatePosition( user, users ) {
                            let first  = 0
                            let last   = users.length - 1

                            if ( users.length === 0 ) {
                                users.push( user )
                            }
                            else {
                                while ( first < last ) {
                                    let middle = Math.floor( ( last + first ) / 2 )
                                    if ( user.distance > users[middle].distance ) {
                                        // Search upper half
                                        first = middle + 1
                                    }
                                    else {
                                        // Search lower half
                                        last = middle
                                    }
                                }

                                if ( user.distance < users[first].distance ) {
                                    // insert before
                                    users.splice( first, 0, user )
                                }
                                else {
                                    // insert after
                                    users.splice( first + 1, 0, user )
                                }
                            }
                        }

                        const profileListeners = this._profileListeners.get( user.id )
                        if ( profileListeners ) {
                            profileListeners.forEach( callback => {
                                callback( user )
                            })
                        }

                        if ( this._buds.has( user.id ) ) {
                            this._buds.set( user.id, user )
                            this._budsListeners.forEach( callback => {
                                callback()
                            })
                        }

                        if ( this._requests.has( user.id ) ) {
                            this._requests.set( user.id, user )
                            this._budsListeners.forEach( callback => {
                                callback()
                            })
                        }
                    })
                } break
                case 'account-deleted': {
                    Promise.all([ this.getBudRequesters(), this.getBuds(), this.getUsersNearby() ])
                    .then( results => {
                        this._buds.delete( userid )
                        this._requests.delete( userid )
                        if ( this._nearbyUsers ) {
                            this._nearbyUsers = this._nearbyUsers.filter( user => user.id !== userid )
                        }

                        const listeners = this._profileListeners.get( userid )
                        if ( listeners ) {
                            listeners.forEach( callback => {
                                callback( null, null, null, null, null, true )
                            })
                        }

                        this._budsListeners.forEach( callback => {
                            callback()
                        })

                        this._locationListeners.forEach( callback => {
                            callback( this._nearbyUsers )
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
    
    get currentLocation() {
        return this._location
    }

    set currentLocation( location ) {
        this._location = location
        if ( this.location ) this.getProfile()
        .then(() => {
            this._profile.location = { type: 'Point', coordinates: [location.lon, location.lat] }
        })
        .catch( error => {
            if ( error.name != 'NOAUTH' ) console.error( JSON.stringify( error, null, 4 ) )
        })
    }

    getLocation() {
        if ( this.currentLocation ) return Promise.resolve( this.currentLocation )
        else return new Promise(( resolve, reject ) => BGLocation.getCurrentLocation(
            location => {
                updateLocation.call( this, location )
                .then(() => {
                    resolve( this.currentLocation )
                })
            },
            error => {
                reject( error )
            }
        ))
    }

    getDistance( location ) {
        if ( !location || !this.currentLocation ) return null
        const lat1 = location.coordinates[1] * Math.PI / 180
        const lat2 = this.currentLocation.lat * Math.PI / 180
        const halfDeltaLon = (location.coordinates[0] - this.currentLocation.lon) * Math.PI / 360
        const halfDeltaLat = ( lat1 - lat2 ) / 2

        const a = Math.sin( halfDeltaLat ) * Math.sin( halfDeltaLat ) +
                  Math.sin( halfDeltaLon ) * Math.sin( halfDeltaLon ) *
                  Math.cos( lat1 ) * Math.cos( lat2 )
        const b = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1 - a) )
        const c = b * 3958.76
        return Math.round( c * 10 ) / 10
    }

    refreshUser() {
        if ( this.currentUser ) {
            return this.currentUser.reload()
            .then(() => {
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

        return Promise.all([
            this.getProfile(),
            this.getBuds(),
            this.getContactMethods(),
            this.getBudRequesters(),
            new Promise(( resolve, reject ) => {
                BGLocation.checkStatus( status => {
                    this.enabled       = status.locationServicesEnabled
                    this.authorization = status.authorization
                    this.BGLocationIsRunning = status.isRunning
                    if ( this.enabled === false || this.authorization === BGLocation.NOT_AUTHORIZED ) {
                        resolve()
                        return
                    }
                    if ( !this.BGLocationIsRunning ) {
                        // App was restarted
                        BGLocation.start()
                        resolve( null )
                    }
                    else {
                        // Refresh nearby users
                        this.getLocation()
                        .then( location => {
                            return functions.findByLocation({
                                lat: location.lat,
                                lon: location.lon
                            })
                        })
                        .then( nearbyUsers => {
                            this._nearbyUsers = userDataFrom( nearbyUsers.data )
                            resolve()
                        })
                    }
                })
            })
        ])
        .then(() => {
            return updateDistances.call( this )
        })
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
                            callback(
                                results[0],
                                results[1],
                                results[2],
                                results[3],
                                this.currentLocation
                            )
                        })
                    })
                }
                else {
                    user.forEach( callback => {
                        callback( this._profile, this._contactMethods )
                    })
                }
            })

            this._locationListeners.forEach( callback => {
                callback( this._nearbyUsers )
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
            return this.updateUser( Object.assign( {}, this._profile ) )
            .then(() => {
                this._profile.id = credentials.user.uid
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

        return functions.deleteAccount()
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
    
        return functions.getProfile({ user: userid })
        .then(response => {
            return getProfileData( response.data )
        })
    }

    // Returns Promise< Profile[] >
    getUsersByUsername( searchString, callback ) {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return functions.findByUserName({ searchString: searchString })
        .then( response => {
            return userDataFrom( response.data )
        })
    }

    // Returns Promise< Profile[] >
    getUsersNearby() {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }
        
        return Promise.resolve( this._nearbyUsers )
    }

    updateUser( dataToUpdate ) {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return functions.updateProfile( Object.assign( {}, dataToUpdate ) )
        .then(() => {
            return Promise.all([
                this.getProfile(),
                this.getUsersNearby()
            ])
        })
        .then(() => {
            Object.assign( this._profile, dataToUpdate )

            const listeners = this._profileListeners.get( this.currentUser.uid )
            if ( listeners ) {
                listeners.forEach( callback => {
                    callback( this._profile )
                })
            }

            if ( this._nearbyUsers ) {
                this._nearbyUsers[0] = this._profile
                this._locationListeners.forEach( callback => {
                    callback( this._nearbyUsers )
                })
            }
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
            if ( !this._contactMethods ) {
                userid = this.currentUser.uid

                this._contactMethods = functions.getContactMethods({ user: userid })
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

                return functions.getContactMethods({ user: userid })
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

        return functions.updateContactMethods( Object.assign( {}, methodsToUpdate ) )
        .then(() => {
            return this.getContactMethods()
        })
        .then( contactMethods => {
            Object.assign( this._contactMethods, methodsToUpdate )
            const listeners = this._profileListeners.get( this.currentUser.uid )
            if ( listeners ) {
                listeners.forEach( callback => {
                    callback( null, this._contactMethods )
                })
            }
        })
    }

    // Returns Promise< Profile[] >
    getBuds() {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        if ( !this._buds ) {
            this._buds = functions.getBuds()
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
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        if ( !this._requests ) {
            this._requests = functions.getBudRequesters()
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

        return functions.getBudRequest({ user: this.currentUser.uid, bud: userid })
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

        return functions.addBud({ user: userid })
        .then(() => {
            const profileListeners = this._profileListeners.get( userid )

            // Add to budlist if we are now buds
            if ( this._requests.has( userid ) ) {
                this._buds.set( userid, this._requests.get( userid ) )
                this._requests.delete( userid )

                this._budsListeners.forEach( callback => {
                    callback()
                })

                if ( profileListeners ) profileListeners.forEach( callback => {
                    callback( null, null, this._buds )
                })
            }
            else {
                if ( profileListeners ) profileListeners.forEach( callback => {
                    callback( null, null, null, { requester: this.currentUser.uid, requestee: userid })
                })
            }

            this.getUsersNearby()
            .then(() => {
                this._locationListeners.forEach( callback => {
                    callback( this._nearbyUsers )
                })
            })
        })
    }
    
    removeBud( userid ) {
        if ( !this.currentUser ) {
            const error = new Error( 'Not logged in.' )
            error.name = "NOAUTH"
            return Promise.reject( error )
        }

        return functions.removeBud({ user: userid })
        .then(() => {
            this._requests.delete( userid )
            this._buds.delete( userid )

            this._budsListeners.forEach( callback => {
                callback()
            })

            const profileListeners = this._profileListeners.get( userid )
            if ( profileListeners ) profileListeners.forEach( callback => {
                callback( null, null, this._buds )
            })

            this.getUsersNearby()
            .then(() => {
                this._locationListeners.forEach( callback => {
                    callback( this._nearbyUsers )
                })
            })
        })
    }
    
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

            if ( user != this.currentUser.uid ) registerProfileListeners([ user ])
        }

        return uuid
    }

    // callback is () => {}
    addBudsListener( callback ) {
        if ( !this.currentUser ) return
        
        const uuid = uuidv4()

        this._budsListeners.set( uuid, callback )

        return uuid
    }

    addLocationsListener( callback ) {
        if ( !this.currentUser ) return
        
        const uuid = uuidv4()

        this._locationListeners.set( uuid, callback )

        return uuid
    }

    unsubscribe( handle ) {
        this._profileListeners.forEach(( user, userid ) => {
            if ( user.has( handle ) ) {
                user.delete( handle )
                if ( user.size === 0 ) {
                    if ( userid != this.currentUser.uid ) unregisterProfileListeners([ userid ])
                    this._profileListeners.delete( userid )
                }
            }
        })

        if ( this._budsListeners.has( handle ) ) {
            this._budsListeners.delete( handle )
        }

        if ( this._locationListeners.has( handle ) ) {
            this._locationListeners.delete( handle )
        }
    }
    
    unsubscribeAll() {
        this._profileListeners.clear()
        this._budsListeners.clear()

        return functions.unregisterAllListeners()
    }

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
