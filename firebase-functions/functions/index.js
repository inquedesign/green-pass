const Mongodb  = require( 'mongodb' ).MongoClient
const mongoUrl = 'mongodb://GreenPass:uspexOZxIHR0XHYz@cluster0-shard-00-00-z4dj4.gcp.mongodb.net:27017,cluster0-shard-00-01-z4dj4.gcp.mongodb.net:27017,cluster0-shard-00-02-z4dj4.gcp.mongodb.net:27017/greenpass?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'
let mongoClient = null

const functions  = require('firebase-functions').runWith({ timeoutSeconds: 120 })
const config     = require('firebase-functions').config()
const HttpsError = require('firebase-functions').https.HttpsError
const admin      = require('firebase-admin')
const tools      = require('firebase-tools')
admin.initializeApp()

// Since this code will be running in the Cloud Functions environment
// we initialize Firestore without any arguments because it
// detects authentication from the environment.
const firestore = admin.firestore()
const messaging = admin.messaging()
const auth      = admin.auth()

const USERS_COLLECTION              = 'Users'
const BUD_LISTS_COLLECTION          = 'BudLists'
const BUD_REQUESTS_COLLECTION       = 'BudRequests'
const CONTACT_METHODS_COLLECTION    = 'ContactMethods'
const PUSH_TOKENS_COLLECTION        = 'PushTokens'
const PROFILE_LISTENERS_COLLECTION  = 'ProfileListeners'
const BUD_LISTENERS_COLLECTION      = 'BudListeners'
const LOCATION_LISTENERS_COLLECTION = 'LocationListeners'

const MAX_SEARCH_DISTANCE = 32000

/***** TODO: Deprecated code *****/

exports.syncContactList = functions.firestore.document('Users/{user}/ContactList/{contact}')
.onWrite(( change, context ) => {
    let data  = null
    let tasks = []

    // Updates won't happen, because security rule prevents it, so handle add/remove
    if ( change.after.exists && !change.before.exists ) { // Added
        data = { buds: admin.firestore.FieldValue.arrayUnion( context.params.contact ) }

        tasks.push(
            Promise.all([
                firestore.doc( `Users/${context.params.contact}/ContactList/${context.params.user}` ).get(),
                firestore.doc( `Users/${context.params.user}` ).get(),
                firestore.doc( `PushTokens/${context.params.contact}` ).get(),
                getPushTokensForUsers([ context.params.contact ]),
            ])
            .then( results => {
                const requestIsMutual = results[0].exists
                const user            = results[1].data()
                const notifToken      = results[2].data()
                const dataToken       = results[3][0]

                console.log( "data token: " + JSON.stringify( dataToken, null, 4 ) )
                let messages = []
                let update   = null
                if ( requestIsMutual ) {
                    if ( notifToken ) {
                        messages.push({
                            token: notifToken.token,
                            android: {
                                notification: {
                                    tag: 'request',
                                    sound: 'default'
                                }
                            },
                            apns: {
                                payload: {
                                    aps: {
                                        sound: 'default'
                                    }
                                }
                            },
                            notification: {
                                title: `A new Bud.`,
                                body : `Congratulations! You are now buds with ${user.username}`,
                            },
                            data: {
                                userid: context.params.user
                            }
                        })
                    }

                    if ( dataToken ) {
                        update = {
                            data: {
                                type: 'bud-added',
                                data: JSON.stringify({ _id: context.params.user, ...user }) // Profile
                            }
                        }
                    }

                    // add buds in mongodb
                    tasks.push(
                        getDatabase()
                        .then( client => {
                            let budLists    = client.collection( BUD_LISTS_COLLECTION )
                            let budRequests = client.collection( BUD_REQUESTS_COLLECTION )

                            return Promise.all([
                                budLists.updateOne(
                                    { _id: context.params.user },
                                    { $addToSet: { buds: context.params.contact } },
                                    { upsert: true }
                                ),
                                budLists.updateOne(
                                    { _id: context.params.contact },
                                    { $addToSet: { buds: context.params.user } },
                                    { upsert: true }
                                ),
                                budRequests.deleteOne({
                                    requester: context.params.contact,
                                    requestee: context.params.user
                                })
                            ])
                        })
                    )
                }
                else {
                    let request = {
                        requester: context.params.user,
                        requestee: context.params.contact
                    }

                    console.log( 'token: ' + JSON.stringify( notifToken, null, 4 ))
                    if ( notifToken ) {
                        messages.push({
                            token: notifToken.token,
                            android: {
                                notification: {
                                    tag: 'request',
                                    sound: 'default'
                                }
                            },
                            apns: {
                                payload: {
                                    aps: {
                                        sound: 'default'
                                    }
                                }
                            },
                            notification: {
                                title: 'Bud Request',
                                body : `${user.username} wants to be your bud! Check them out!`,
                            },
                            data: {
                                userid: context.params.user
                            }
                        })
                    }

                    if ( dataToken ) {
                        update = {
                            data: {
                                type: 'bud-request',
                                data: JSON.stringify({
                                    user   : { _id: context.params.user, ...user },
                                    request: request
                                })
                            }
                        }
                    }

                    tasks.push(
                        getDatabase()
                        .then( client => {
                            return client.collection( BUD_REQUESTS_COLLECTION )
                            .insertOne( request )
                        })
                    )
                }

                if ( messages.length === 0 ) return;

                console.log( "messages: " + JSON.stringify( messages, null, 4 ) )
                return Promise.all([
                    messaging.sendAll( messages )
                    .then( response => {
                        return handleMessagingErrors( response, messages.map( message => message.token ) )
                    }),
                    update ? messaging.sendToDevice( dataToken.token, update )
                    .then( response => {
                        return handleMessagingErrors( response, [ dataToken.token ] )
                    }) : null
                ])
            })
        )
    }
    else { // Removed
        data = { buds: admin.firestore.FieldValue.arrayRemove( context.params.contact ) }

        // Notify user
        tasks.push(
            getPushTokensForUsers([ context.params.contact ])
            .then( response => {
                let token = response[0]

                console.log( JSON.stringify( token, null, 4 ))

                if ( !token ) return;

                return messaging.sendToDevice( token.token, {
                    data: {
                        type: 'bud-removed',
                        user: context.params.user // userid
                    }
                })
                .then( response => {
                    return handleMessagingErrors( response, [ token.token ] )
                })
            })
        )

        // remove from mongo
        tasks.push(
            getDatabase()
            .then( client => {
                let budLists    = client.collection( BUD_LISTS_COLLECTION )
                let budRequests = client.collection( BUD_REQUESTS_COLLECTION )

                return Promise.all([
                    budLists.updateOne(
                        { _id: context.params.user },
                        { $pull: { buds: context.params.contact } }
                    ),
                    budLists.updateOne(
                        { _id: context.params.contact },
                        { $pull: { buds: context.params.user } }
                    ),
                    budRequests.deleteOne({
                        requester: context.params.user,
                        requestee: context.params.contact
                    })
                ])
            })
        )
    }

    tasks.push(
        firestore.collection( 'Users' ).doc( context.params.user ).get()
        .then( docref => {
            if ( docref.exists ) {
                return firestore.collection( 'Users' ).doc( context.params.user )
                .set( data, { merge: true } )
            }
        })
    )
    
    return Promise.all( tasks )
    .catch( error => {
        console.error('Error sending message:', error);
    })

})

exports.onDeleteProfile = functions.firestore.document( 'Users/{user}' )
.onDelete(( doc, context) => {

    // Get all users who have this user listed as a buddy
    const cleanContactLists = firestore.collection( 'Users' ).where( 'buds', 'array-contains', context.params.user ).get()
    .then( results => {
        let batch = firestore.batch()

        // remove this user from each user's contact list
        results.forEach( doc => {
            batch = batch.delete( doc.ref.collection( 'ContactList' ).doc( context.params.user ) )
        })

        return batch.commit()
    })
    
    return Promise.all([
        firestore.doc( 'Statistics/UserCount' ).set({
            count: admin.firestore.FieldValue.increment( -1 )
         }, { merge: true }),
        deleteCollection( `Users/${context.params.user}/ContactList` ),
        deleteCollection( `Users/${context.params.user}/ContactMethods` ),
        cleanContactLists
    ])
})

function deleteCollection( path ) {
    return tools.firestore
    .delete( path, {
        project  : config.auth.project,
        token    : config.auth.token,
        recursive: true,
        yes      : true
    })
    .catch( error => {
        console.error( error.message )
    })
}

exports.onAddProfile = functions.firestore.document( 'Users/{user}' )
.onCreate(( doc, context ) => {
    return firestore.doc( 'Statistics/UserCount' )
    .set({
        count: admin.firestore.FieldValue.increment( 1 )
     }, {
        merge: true
    })
})

exports.mongoSyncProfile = functions.firestore.document( 'Users/{user}' )
.onWrite(( change, context ) => {
    return getDatabase()
    .then( client => {
        let users = client.collection( USERS_COLLECTION )
        let update

        if ( change.after.exists ) { // Created or updated
            let user = change.after.data()
            delete user.buds

            // Update record in mongo, create if necessary

            return Promise.all([
                users.updateOne(
                    { _id: context.params.user },
                    { $set: user },
                    { upsert: true }
                ),
                getProfileListenerTokens( context.params.user ),
                getBudTokens( context.params.user ),
                getRequestTokens( context.params.user ),
                getLocationListenerTokens( context.params.user )
            ])
            .then( results => {
                const tokens1 = results[1].map( token => token.token )
                const tokens2 = results[2].map( token => token.token )
                const tokens3 = results[3].map( token => token.token )
                const tokens4 = results[4].map( token => token.token )

                // Ensure unique entries with 2 lines of code
                let pushTokens = new Set( tokens1.concat( tokens2 ).concat( tokens3 ).concat( tokens4 ) )
                pushTokens = Array.from( pushTokens )

                console.log( "tokens: " + JSON.stringify( pushTokens, null, 4 ) )
                let messages = []

                for( let i = 0; i < pushTokens.length; i += 100 ) {
                    let tokens = pushTokens.slice( i, i + 100 )

                    messages.push(
                        messaging.sendToDevice( tokens, {
                            data: {
                                type: 'profile-update',
                                user: context.params.user,
                                data: JSON.stringify( user )
                            }
                        })
                        .then( response => { return handleMessagingErrors( response, tokens ) } )
                    )
                }

                return Promise.all( messages )
            })
        }
        else { // Removed
            // Remove from mongo
            return deleteUser( context.params.user )
        }
    })
    .catch( error => {
        console.log( error )
    })

})

exports.mongoSyncContactMethods = functions.firestore.document( 'Users/{user}/ContactMethods/{method}' )
.onWrite(( change, context ) => {
    return getDatabase()
    .then( db => {
        let contactMethods = db.collection( CONTACT_METHODS_COLLECTION )
        let update
        let data

        if ( change.after.exists ) { // Added or updated
            data = change.after.data()
            update = contactMethods.updateOne(
                { _id: context.params.user },
                { $set: {
                    [context.params.method]: data
                }},
                { upsert: true }
            )
        }
        else { // Removed
            data = null
            update = contactMethods.updateOne(
                { _id: context.params.user },
                { $unset: {
                    [context.params.method]: data
                }}
            )
        }

        return Promise.all([
            update,
            getProfileListenerTokens( context.params.user ),
            db.collection( BUD_LISTS_COLLECTION ).findOne({ _id: context.params.user }),
        ])
        .then( results => {
            const buds       = results[2] ? new Set( results[2].buds ) : new Set()
            const pushTokens = results[1].filter(
                token => { return buds.has( token._id ) }
            )
            .map( token => token.token )
            
            let messages = []

            for( let i = 0; i < pushTokens.length; i += 100 ) {
                let tokens = pushTokens.slice( i, i + 100 )

                messages.push(
                    messaging.sendToDevice( tokens, {
                        data: {
                            type: 'contact-methods-update',
                            user: context.params.user,
                            data: JSON.stringify({ [context.params.method]: data })
                        }
                    })
                    .then( response => { return handleMessagingErrors( response, tokens ) } )
                )
            }

            return Promise.all( messages )
        })
    })
    .catch( error => {
        console.log( error )
    })

})

exports.mongoSyncPushTokens = functions.firestore.document( 'PushTokens/{user}' )
.onWrite(( change, context ) => {
    return getDatabase()
    .then( client => {
        let pushTokens = client.collection( PUSH_TOKENS_COLLECTION )

        if ( change.after.exists ) { // Added or updated
            let data = change.after.data()

            return pushTokens.updateOne(
                { _id: change.after.id },
                { $set: {
                    token     : data.token,
                    foreground: data.foreground !== undefined ? data.foreground : true
                }},
                { upsert: true }
            )
        }
        else { // Removed
            return pushTokens.deleteOne({ _id: change.before.id })
        }
    })
    .then(() => {
        return null
    })
    .catch( error => {
        console.log( error )
    })
})

// Upload new functions, and sync databases
exports.mongoSync = functions.https.onRequest(( req, res ) => {
    const password = 'atemporarypassword'
    
    if ( req.body.pass === password ) {

        return getDatabase()
        .then( db => {
            return Promise.all([
                firestore.collection( 'Users' ).get(),
                firestore.collection( 'PushTokens' ).get()
            ])
            .then( results => {
                let users  = results[0]
                let tokens = results[1]

                let profiles = []
                let contactMethods = []
                let budLists = new Map()
                let budRequests = new Map()

                let updates = users.docs.map( user => {
                    return firestore.collection( `Users/${user.id}/ContactMethods` ).get()
                    .then( methods => {
                        let profile = Object.assign( {}, user.data() )
                        delete profile.buds

                        budLists.set( user.id, { buds: [] } )

                        if ( user.data().buds ) {
                            user.data().buds.forEach( bud => {
                                if ( budRequests.has( bud + user.id ) ) {
                                    budRequests.delete( bud + user.id )
                                    budLists.get( user.id ).buds.push( bud )
                                    budLists.get( bud ).buds.push( user.id )
                                }
                                else {
                                    budRequests.set( user.id + bud, { requester: user.id, requestee: bud } )
                                }
                            })
                        }

                        // For each user, get all contact methods
                        let contactInfo = {}
                        methods.forEach( method => {
                            contactInfo[method.id] = method.data()
                        })

                        contactMethods.push({
                            replaceOne: {
                                filter: { _id: user.id },
                                replacement: contactInfo,
                                upsert: true
                            }
                        })

                        profiles.push({
                            replaceOne: {
                                filter: { _id: user.id },
                                replacement: profile,
                                upsert: true
                            }
                        })
                    })
                })
                
                return Promise.all( updates )
                .then(() => {
                    return Promise.all([
                    db.collection( USERS_COLLECTION ).bulkWrite(
                        profiles,
                        { ordered: false }
                    ),
                    db.collection( CONTACT_METHODS_COLLECTION ).bulkWrite(
                        contactMethods,
                        { ordered: false }
                    ),
                    db.collection( BUD_LISTS_COLLECTION ).bulkWrite(
                        Array.from( budLists ).map( entry => {
                            return {
                                replaceOne: {
                                    filter: { _id: entry[0] },
                                    replacement: entry[1],
                                    upsert: true
                                }
                            }
                        }),
                        { ordered: false }
                    ),
                    db.collection( BUD_REQUESTS_COLLECTION ).bulkWrite(
                        Array.from( budRequests.values() ).map( entry => {
                            return {
                                replaceOne: {
                                    filter: entry,
                                    replacement: entry,
                                    upsert: true
                                }
                            }
                        }),
                        { ordered: false }
                    )
                ])
                })
                .then(() => {
                    res.send( "sync finished" )
                })
            })
        })
    }
})

/***** End Deprecated Code ****/


exports.deleteAccount = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError(
        'unauthenticated',
        'User not authenticated.',
        'unauthenticated'
    )
    
    return auth.deleteUser( context.auth.uid )
})

exports.onDeleteAccount = functions.auth.user()
.onDelete(( user, context ) => {
    return Promise.all([
        firestore.doc( `Users/${user.uid}` ).delete(), // TODO: Deprecate this code
        firestore.doc( `PushTokens/${user.uid}` ).delete(), // TODO: Deprecate this code
        getProfileListenerTokens( user.uid ),
        getBudTokens( user.uid ),
        getRequestTokens( user.uid ),
        getLocationListenerTokens( user.uid )
    ])
    .then( results => {
        let tokens1 = results[2].map( token => token.token )
        let tokens2 = results[3].map( token => token.token )
        let tokens3 = results[4].map( token => token.token )
        let tokens4 = results[5].map( token => token.token )
        let pushTokens = new Set( tokens1.concat(tokens2).concat(tokens3).concat(tokens4) )
        pushTokens = Array.from( pushTokens )
        
        let tasks = [ deleteUser( user.uid ) ] // Remove from Mongo

        // Notify Users
        for( let i = 0; i < pushTokens.length; i += 100 ) {
            let tokens = pushTokens.slice( i, i + 100 )

            tasks.push(
                messaging.sendToDevice( tokens, {
                    data: {
                        type: 'account-deleted',
                        user: user.uid
                    }
                })
                .then( response => { return handleMessagingErrors( response, tokens ) } )
            )
        }
        
        return Promise.all( tasks )
    })
})

/***********************************
* New Api for mongo backend below  *
***********************************/

// Returns profile[] of every user in bud list
exports.getBuds = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( BUD_LISTS_COLLECTION )
            .aggregate([
                { $match: { _id: context.auth.uid } },
                { $unwind: '$buds' }, // Create document for each bud in list
                { $lookup: { // Find bud in Users collection
                    from: USERS_COLLECTION,
                    localField: 'buds',
                    foreignField: '_id',
                    as: 'user' // Stored as single element array
                }},
                { $unwind: '$user' }, // Get user out of array
                { $replaceRoot: { newRoot: '$user' } } // Return just the user
            ])
            .toArray()
    })
})

// Returns profile[] of every user requesting to be buds
exports.getBudRequesters = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( BUD_REQUESTS_COLLECTION )
            .aggregate([
                { $match: { requestee: context.auth.uid } },
                { $lookup: { // Find requester in Users collection
                    from: USERS_COLLECTION,
                    localField: 'requester',
                    foreignField: '_id',
                    as: 'user' // Stored as single element array
                }},
                { $unwind: '$user' }, // Get user out of array
                { $replaceRoot: { newRoot: '$user' } }
            ])
            .toArray()
    })
})

// Returns the bud request record associated with these users, if it exists
exports.getBudRequest = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( BUD_REQUESTS_COLLECTION ).findOne({
            $or: [
                { requester: data.user, requestee: data.bud  },
                { requester: data.bud,  requestee: data.user }
            ]
        })
    })
})

// Returns a single requested user profile, by user id
exports.getProfile = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( USERS_COLLECTION ).findOne({ _id: data.user })
    })
})

// Performs a prefix search of usernames, returning all profiles with a match.
exports.findByUserName = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( USERS_COLLECTION )
        .find({ username: {
            $regex: `^${data.searchString}.*$`
        }})
        .toArray()
    })
})

exports.findByLocation = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError(
        'unauthenticated',
        'User not authenticated.',
        'unauthenticated'
    )

    if ( !data.lon || data.lon < -180 || data.lon > 180 ||
         !data.lat || data.lat < -90  || data.lat > 90 ) {
        throw new HttpsError(
            'invalid-argument',
            'Lat/Lon are malformed or non-existant',
            'data: ' + JSON.stringify( data, null, 4 )
        )
    }

    return findNearbyUsers( data )
    .then( nearbyUsers => {
        return updateLocationListeners( context.auth.uid, nearbyUsers )
        .then(() => {
            return nearbyUsers
        })
    })
})

exports.updateLocation = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError(
        'unauthenticated',
        'User not authenticated.',
        'unauthenticated'
    )

    if ( !data.lon || data.lon < -180 || data.lon > 180 ||
         !data.lat || data.lat < -90  || data.lat > 90 ) {
        throw new HttpsError(
            'invalid-argument',
            'Lat/Lon are malformed or non-existant',
            'data: ' + JSON.stringify( data, null, 4 )
        )
    }

    return Promise.all([
        getDatabase()
        .then( db => {
            return db.collection( USERS_COLLECTION )
            .findOneAndUpdate(
                { _id: context.auth.uid },
                { $set: {
                    location: {
                        type       : 'Point',
                        coordinates: [ data.lon, data.lat ]
                    }
                }},
                { upsert: true, returnOriginal: false }
            )
        }),
        getDatabase()
        .then( db => {
            return db.collection( USERS_COLLECTION )
            .aggregate([
                { $geoNear: {
                    query: { _id: { $ne: context.auth.uid } },
                    spherical: true,
                    maxDistance: MAX_SEARCH_DISTANCE,
                    distanceField: 'distance',
                    distanceMultiplier: 3958.76, // Convert distance to miles
                    near: {
                        type       : 'Point',
                        coordinates: [ data.lon, data.lat ]
                    },
                    key: 'location'
                }},
                { $lookup: {
                    from: PUSH_TOKENS_COLLECTION,
                    localField: '_id',
                    foreignField: '_id',
                    as: 'token' // Stored as array
                }},
                { $group: {
                    _id: null,
                    users: { $push: {
                        _id: '$_id',
                        username: '$username',
                        birthDate: '$birthDate',
                        gender: '$gender',
                        avatar: '$avatar',
                        location: '$location',
                        distance: '$distance'
                    }},
                    tokens: { $push: { $arrayElemAt: ['$token', 0] } }
                }}
            ],
            { allowDiskUse: true })
            .toArray()
        }),
        getLocationListenerTokens( context.auth.uid )
    ])
    .then( results => {
        let user             = results[0].value
        let users            = results[1][0]
        let nearbyUsers      = users ? users.users.slice( 0, 99 ) : []
        let nearbyUserTokens = users ? users.tokens.filter( token => token && token.foreground ) : []
        nearbyUserTokens = nearbyUserTokens.map( token => token.token )
        let listenerTokens = results[2].map( token => token.token )
        let pushTokens       = new Set( nearbyUserTokens.concat( listenerTokens ) )

        pushTokens = Array.from( pushTokens )
        nearbyUsers.unshift( user )
        
        let tasks = [ updateLocationListeners( context.auth.uid, nearbyUsers ) ]

        for( let i = 0; i < pushTokens.length; i += 100 ) {
            let tokens = pushTokens.slice( i, i + 100 )

            tasks.push(
                messaging.sendToDevice( tokens, {
                    data: {
                        type: 'location-update',
                        data: JSON.stringify( user )
                    }
                })
                .then( response => { return handleMessagingErrors( response, tokens ) } )
            )
        }

        return Promise.all( tasks )
        .then(() => {
            return nearbyUsers    
        })
    })
})

// Returns contact methods for requested user, if they are authorized to view them
exports.getContactMethods = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    return getDatabase()
    .then( db => {
        if ( data.user === context.auth.uid ) return db

        // Make sure they are buds before returning contact list
        return db.collection( BUD_LISTS_COLLECTION )
            .countDocuments({
                $or: [
                    { $and: [
                        { _id: context.auth.uid },
                        { buds: data.user }
                    ]},
                    { $and: [
                        { _id: data.user },
                        { buds: context.auth.uid }
                    ]}
                ]
            })
            .then( count => {
                if ( count < 2 ) throw new HttpsError( 'permission-denied', 'Must be buds to view contact info.', 'permission-denied' )
                return db
            })
    })
    .then( db => {
        return db.collection( CONTACT_METHODS_COLLECTION )
            .findOne({ _id: data.user }, { projection: { _id: 0 } })
    })
})

// Updates user profile, creating if necessary
exports.updateProfile = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    // Limit submitted fields to those supported
    const fields = [
        'username',
        'birthDate',
        'gender',
        'avatar'
    ]

    data = Object.subset( data, fields )

    // TODO: switch to mongo
    firestore.doc( `Users/${context.auth.uid}` )
    .set( data, { merge: true } )

    // TODO: uncomment this code to write directly to mongo
    //return getDatabase()
    //.then( db => {
    //    return Promise.all([
    //        db.collection( USERS_COLLECTION )
    //        .updateOne(
    //            { _id: context.auth.uid },
    //            { $set: data },
    //            { upsert: true }
    //        ),
    //        getProfileListenerTokens( context.auth.uid ),
    //        getBudTokens( context.auth.uid ),
    //        getRequestTokens( context.auth.uid )
    //    ])
    //    .then( results => {
    //        const profileListeners = results[1].map( token => token.token )
    //        const buds             = results[2].map( token => token.token )
    //        const requests         = results[3].map( token => token.token )
//
    //        // Ensure unique entries with 2 lines of code
    //        let pushTokens = new Set( profileListeners.concat( buds ).concat( requests ) )
    //        pushTokens = Array.from( pushTokens )
//
    //        let messages = []
//
    //        for( let i = 0; i < pushTokens.length; i += 100 ) {
    //            let tokens = pushTokens.slice( i, i + 100 )
    //            let message = {
    //                tokens: tokens,
    //                data: {
    //                    type: 'profile-update',
    //                    user: context.auth.uid,
    //                    data: JSON.stringify( data )
    //                }
    //            }
//
    //            messages.push(
    //                messaging.sendMulticast( message )
    //                .then( response => { handleMessagingErrors( response, tokens ) } )
    //            )
    //        }
//
    //        return Promise.all( messages )
    //    })
    //})
    //.then(() => {
    //    return null
    //})
})

// Adds contact method to user's list of contact methods
exports.updateContactMethods = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    const supportedMethods = [
        'facebook',
        'twitter',
        'whatsapp',
        'snapchat',
        'reddit',
        'instagram',
        'text' 
    ]

    // TODO: switch writes to mongo
    let batch = firestore.batch()
    supportedMethods.forEach( key => {
        if ( data[key] ) {
            const doc = firestore.doc( `Users/${context.auth.uid}` ).collection('ContactMethods').doc( key )
            batch = batch.set( doc, data[key], { merge: true } )
        }
    })
    return batch.commit()

    // TODO: uncomment to write directly to mongo
    //data = Object.subset( data, supportedMethods )
//
    //return getDatabase()
    //.then( db => {
    //    return Promise.all([
    //        db.collection( CONTACT_METHODS_COLLECTION )
    //        .updateOne(
    //            { _id: context.auth.uid },
    //            { $set: data },
    //            { upsert: true }
    //        ),
    //        getProfileListenerTokens( context.auth.uid ),
    //        db.collection( BUD_LISTS_COLLECTION ).findOne({ _id: context.auth.uid }),
    //    ])
    //    .then( results => {
    //        const buds       = results[2] ? new Set( results[2].buds ) : new Set()
    //        const pushTokens = results[1].filter(
    //            token => { return buds.has( token._id ) }
    //        )
    //        .map( token => token.token )
    //        
    //        let messages = []
//
    //        for( let i = 0; i < pushTokens.length; i += 100 ) {
    //            let tokens = pushTokens.slice( i, i + 100 )
    //            let message = {
    //                tokens: tokens,
    //                data: {
    //                    type: 'contact-methods-update',
    //                    user: context.auth.uid,
    //                    data: JSON.stringify( data )
    //                }
    //            }
//
    //            messages.push(
    //                messaging.sendMulticast( message )
    //                .then( response => { handleMessagingErrors( response, tokens ) } )
    //            )
    //        }
//
    //        return Promise.all( messages )
    //    })
    //})
    //.then(() => {
    //    return null
    //})
})

// If a bud request requests exists from target, then both users will be added to each other's lists
// Otherwise, a bud request will be created
// Target user will receive a notification
exports.addBud = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError(
        'unauthenticated',
        'User not authenticated.',
        'unauthenticated'
    )
    if ( context.auth.uid === data.user ) throw new HttpsError(
        'invalid-argument',
        'Cannot add self as bud.',
        'invalid-argument'
    )

    // TODO: switch to mongo
    return firestore.doc( `Users/${context.auth.uid}` ).collection( 'ContactList' ).doc( data.user )
    .set({ id: data.user })

    // TODO: uncomment to write directly to mongo
    //return getDatabase()
    //.then( db => {
    //    return Promise.all([
    //        db.collection( BUD_REQUESTS_COLLECTION )
    //        .findOne({
    //            requester: data.user,
    //            requestee: context.auth.uid
    //        }),
    //        db.collection( USERS_COLLECTION ).find({ _id: { $in: [context.auth.uid, data.user] } }).toArray(),
    //        db.collection( BUD_LISTS_COLLECTION ).findOne({ _id: context.auth.uid }),
    //        db.collection( PUSH_TOKENS_COLLECTION ).findOne({ _id: data.user }),
    //        getPushTokensForUsers([ data.user ])
    //    ])
    //    .then( results => {
    //        let request    = results[0]
    //        let user       = results[1][0]._id == context.auth.uid ? results[1][0] : results[1][1]
    //        let requestee  = results[1][0]._id == context.auth.uid ? results[1][1] : results[1][0]
    //        let budList    = results[2]
    //        let notifToken = results[3]
    //        let dataToken  = results[4][0]
//
    //        // Already buds
    //        if ( budList && budList.buds.includes( data.user ) ) {
    //            throw new HttpsError(
    //                'invalid-argument',
    //                'User has already been added as a bud.',
    //                'invalid-argument'
    //            )
    //        }
//
    //        if ( request ) { // remove request and add users to budlists
    //            return Promise.all([
    //                db.collection( BUD_REQUESTS_COLLECTION ).deleteOne( request ),
    //                db.collection( BUD_LISTS_COLLECTION ).bulkWrite(
    //                    [{
    //                        updateOne: {
    //                            filter: { _id: request.requester },
    //                            update: { $addToSet: { buds: request.requestee } },
    //                            upsert: true
    //                        }
    //                    },
    //                    {
    //                        updateOne: {
    //                            filter: { _id: request.requestee },
    //                            update: { $addToSet: { buds: request.requester } },
    //                            upsert: true
    //                        }
    //                    }],
    //                    { ordered: false }
    //                )
    //            ])
    //            .then(() => {
    //                let messages = []
    //                if ( notifToken ) {
    //                    messages.push({
    //                        token: notifToken.token,
    //                        android: {
    //                            notification: {
    //                                tag: 'request',
    //                                sound: 'default'
    //                            }
    //                        },
    //                        apns: {
    //                            payload: {
    //                                aps: {
    //                                    sound: 'default'
    //                                }
    //                            }
    //                        },
    //                        notification: {
    //                            title: `A new Bud.`,
    //                            body : `Congratulations! You are now buds with ${user.username}`,
    //                        },
    //                        data: {
    //                            userid: user._id
    //                        }
    //                    })
    //                }
//
    //                if ( dataToken ) {
    //                    messages.push({
    //                        token: dataToken.token,
    //                        data: {
    //                            type: 'bud-added',
    //                            data: JSON.stringify( user ) // Profile
    //                        }
    //                    })
    //                }
//
    //                return messages
    //            })
    //        }
    //        else if ( requestee ) { // Add a bud request
    //            const request = { requester: context.auth.uid, requestee: data.user }
    //            return db.collection( BUD_REQUESTS_COLLECTION )
    //            .insertOne( request )
    //            .then(() => {
    //                let messages = []
//
    //                if ( notifToken ) {
    //                    messages.push({
    //                        token: notifToken.token,
    //                        android: {
    //                            notification: {
    //                                tag: 'request',
    //                                sound: 'default'
    //                            }
    //                        },
    //                        apns: {
    //                            payload: {
    //                                aps: {
    //                                    sound: 'default'
    //                                }
    //                            }
    //                        },
    //                        notification: {
    //                            title: 'Bud Request',
    //                            body : `${user.username} wants to be your bud! Check them out!`,
    //                        },
    //                        data: {
    //                            userid: user._id
    //                        }
    //                    })
    //                }
//
    //                if ( dataToken ) {
    //                    messages.push({
    //                        token: dataToken.token,
    //                        data: {
    //                            type: 'bud-request',
    //                            data: JSON.stringify({
    //                                user   : user,
    //                                request: request
    //                            })
    //                        }
    //                    })
    //                }
//
    //                return messages
    //            })
    //        }
    //        else {
    //            throw new HttpsError(
    //                'invalid-argument',
    //                'User does not exist.',
    //                'invalid-argument'
    //            )
    //        }
    //    })
    //    .then( messages => {
    //        if ( messages.length === 0 ) return;
//
    //        return messaging.sendAll( messages )
    //        .then( response =>
    //            handleMessagingErrors( response, messages.map( message => message.token ) )
    //         )
    //    })
    //})
})

// Removes users from each other's lists, and removes any associated bud requests
exports.removeBud = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    // TODO: switch to mongo
    return firestore.batch()
    .delete( firestore.doc( `Users/${context.auth.uid}` ).collection( 'ContactList' ).doc( data.user ) )
    .delete( firestore.doc( `Users/${data.user}` ).collection( 'ContactList' ).doc( context.auth.uid ) )
    .commit()

    // TODO: uncomment to write directly to mongo
    //return getDatabase()
    //.then( db => {
    //    return Promise.all([
    //        db.collection( BUD_LISTS_COLLECTION ).bulkWrite(
    //            [{
    //                updateOne: {
    //                    filter: { _id: context.auth.uid },
    //                    update: { $pull: { buds: data.user } }
    //                }
    //            },
    //            {
    //                updateOne: {
    //                    filter: { _id: data.user },
    //                    update: { $pull: { buds: context.auth.uid } }
    //                }
    //            }],
    //            { ordered: false }
    //        ),
    //        db.collection( BUD_REQUESTS_COLLECTION ).bulkWrite(
    //            [{
    //                deleteOne: {
    //                    filter: {
    //                        requester: context.auth.uid,
    //                        requestee: data.user
    //                    }
    //                }
    //            },
    //            {
    //                deleteOne: {
    //                    filter: {
    //                        requester: data.user,
    //                        requestee: context.auth.uid
    //                    }
    //                }
    //            }],
    //            { ordered: false }
    //        ),
    //        getPushTokensForUsers([ data.user ])
    //    ])
    //    .then( results => {
    //        let token = results[2][0]
//
    //        if ( !token ) return;
//
    //        let message = {
    //            token: token.token,
    //            data: {
    //                type: 'bud-removed',
    //                user: context.auth.uid // userid
    //            }
    //        }
//
    //        return messaging.send( message )
    //        .catch( error => {
    //            if (
    //                error.code === 'messaging/invalid-registration-token' ||
    //                error.code === 'messaging/registration-token-not-registered'
    //            ) {
    //                return removeInvalidToken( token.token )
    //            }
    //            else {
    //                console.error( JSON.stringify( error, null, 4 ) )
    //                throw error
    //            }
    //        })
    //    })
    //})
    //.then(() => {
    //    return null
    //})
})

exports.updateAppState = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError(
        'unauthenticated',
        'User not authenticated.',
        'In firebase-functions:updateAppState\nUser: ' + JSON.stringify( context.auth, null, 4 )
    )

    if ( data.foreground === undefined ) return null

    // TODO: switch to mongo
    return firestore.doc( `PushTokens/${context.auth.uid}` )
    .set( { foreground: data.foreground }, { merge: true } )

    // TODO: uncomment to write directly to mongo
    //return getDatabase()
    //.then( db => {
    //    return db.collection( PUSH_TOKENS_COLLECTION )
    //    .updateOne(
    //        { _id: context.auth.uid },
    //        { $set: {
    //            foreground: data.foreground
    //        }}
    //    )
    //})
    //.then(() => {
    //    return null
    //})
})

exports.updatePushToken = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError(
        'unauthenticated',
        'User not authenticated.',
        'In firebase-functions:updatePushToken\nUser: ' + JSON.stringify( context.auth, null, 4 )
    )

    console.log( data.token )
    // TODO: switch to mongo
    return firestore.doc( `PushTokens/${context.auth.uid}` )
    .set( { token: data.token }, { merge: true } )

    // TODO: uncomment to write directly to mongo
    //return getDatabase()
    //.then( db => {
    //    return db.collection( PUSH_TOKENS_COLLECTION )
    //    .updateOne(
    //        { _id: context.auth.uid },
    //        {
    //            $set: {
    //                token: data.token
    //            },
    //            $setOnInsert: {
    //                foreground: true
    //            }
    //        },
    //        { upsert: true }
    //    )
    //})
    //.then(() => {
    //    return null
    //})
})

exports.removePushToken = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    // TODO: switch to mongo
    firestore.doc( `PushTokens/${context.auth.uid}` ).delete()

    // TODO: uncomment to write directly to mongo
    //return getDatabase()
    //.then( db => {
    //    return db.collection( PUSH_TOKENS_COLLECTION )
    //    .deleteOne({ _id: context.auth.uid })
    //})
    //.then(() => {
    //    return null
    //})
})

exports.registerProfileListeners = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( PROFILE_LISTENERS_COLLECTION )
        .updateMany(
            { _id: { $in: data.users } },
            { $addToSet: { listeners: context.auth.uid } },
            { upsert: true }
        )
    })
    .then(() => {
        return null
    })
})

exports.unregisterProfileListeners = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError(
        'unauthenticated',
        'User not authenticated.',
        'In firebase-functions:unregisterProfileListener\nUser: ' + JSON.stringify( context.auth, null, 4 )
    )

    return getDatabase()
    .then( db => {
        return db.collection( PROFILE_LISTENERS_COLLECTION )
        .updateMany(
            { _id: { $in: data.users } },
            { $pull: { listeners: context.auth.uid } }
        )
    })
    .then(() => {
        return null
    })
})

exports.registerLocationListeners = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( LOCATION_LISTENERS_COLLECTION )
        .updateMany(
            { _id: { $in: data.users } },
            { $addToSet: { listeners: context.auth.uid } },
            { upsert: true }
        )
    })
    .then(() => {
        return null
    })
})

exports.unregisterLocationListeners = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( LOCATION_LISTENERS_COLLECTION )
        .updateMany(
            { _id: { $in: data.users } },
            { $pull: { listeners: context.auth.uid } }
        )
    })
    .then(() => {
        return null
    })
})

exports.unregisterAllListeners = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new HttpsError( 'unauthenticated', 'User not authenticated.', 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return Promise.all([
            db.collection( LOCATION_LISTENERS_COLLECTION )
            .updateMany(
                { listeners: context.auth.uid },
                { $pull: { listeners: context.auth.uid } }
            ),
            db.collection( PROFILE_LISTENERS_COLLECTION )
            .updateMany(
                { listeners: context.auth.uid },
                { $pull: { listeners: context.auth.uid } }
            )
        ])
    })
    .then(() => {
        return null
    })    
})

function getDatabase() {
    if ( mongoClient && mongoClient.isConnected() ) {
        return Promise.resolve( mongoClient.db() )
    }
    else {
        return Mongodb.connect( mongoUrl, { useNewUrlParser: true } )
        .then( client => {
            mongoClient = client
            return mongoClient.db()
        })
    }
}

function deleteUser( userid ) {
    return getDatabase()
    .then( db => {
        let users          = db.collection( USERS_COLLECTION )
        let budLists       = db.collection( BUD_LISTS_COLLECTION )
        let budRequests    = db.collection( BUD_REQUESTS_COLLECTION )
        let contactMethods = db.collection( CONTACT_METHODS_COLLECTION )
        let pushTokens     = db.collection( PUSH_TOKENS_COLLECTION )
        let profileListeners  = db.collection( PROFILE_LISTENERS_COLLECTION )
        let locationListeners = db.collection( LOCATION_LISTENERS_COLLECTION )

        return Promise.all([
            users.deleteOne({ _id: userid }),
            budLists.bulkWrite(
                [{
                    deleteOne: {
                        filter: { _id: userid },
                    }
                },
                {
                    updateMany: {
                        filter: { buds: userid },           // If bud list contains this user,
                        update: { $pull: { buds: userid } } // Remove this user from bud list
                    }
                }],
                { ordered: false }
            ),
            budRequests.deleteMany({ // Remove all requests associated with user
                $or: [
                    { requester: userid },
                    { requestee: userid }
                ]
            }),
            contactMethods.deleteOne({ _id: userid }),
            pushTokens.deleteOne({ _id: userid }),
            profileListeners.bulkWrite(
                [{
                    deleteOne: {
                        filter: { _id: userid },
                    }
                },
                {
                    updateMany: {
                        filter: { listeners: userid },           // If listeners contains this user,
                        update: { $pull: { listeners: userid } } // Remove this user from listeners
                    }
                }],
                { ordered: false }
            ),
            locationListeners.bulkWrite(
                [{
                    deleteOne: {
                        filter: { _id: userid },
                    }
                },
                {
                    updateMany: {
                        filter: { listeners: userid },           // If listeners contains this user,
                        update: { $pull: { listeners: userid } } // Remove this user from listeners
                    }
                }],
                { ordered: false }
            )
        ])
    })
}

// Returns PushToken[]
function getProfileListenerTokens( userid ) {
    return getDatabase()
    .then( db => {
        return db.collection( PROFILE_LISTENERS_COLLECTION )
        .aggregate([
            { $match: { _id: userid } },
            { $unwind: '$listeners' }, // Create document for each listener
            { $lookup: { // Find push token for each user
                from: PUSH_TOKENS_COLLECTION,
                localField: 'listeners',
                foreignField: '_id',
                as: 'token' // Stored as single element array
            }},
            { $unwind: '$token' }, // Get document out of array
            { $replaceRoot: { newRoot: '$token' } } // Return just the token document
        ])
        .toArray()
    })
    .then( tokens => {
        return tokens.filter( token => token.foreground )
    })
}

// Returns PushToken[]
function getBudTokens( userid ) {
    return getDatabase()
    .then( db => {
        return db.collection( BUD_LISTS_COLLECTION )
        .aggregate([
            { $match: { _id: userid } },
            { $unwind: '$buds' }, // Create document for each bud in list
            { $lookup: { // Find push token for each user
                from: PUSH_TOKENS_COLLECTION,
                localField: 'buds',
                foreignField: '_id',
                as: 'token' // Stored as single element array
            }},
            { $unwind: '$token' }, // Get document out of array
            { $replaceRoot: { newRoot: '$token' } } // Return just the token document
        ])
        .toArray()
    })
    .then( tokens => {
        return tokens.filter( token => token.foreground )
    })
}

// returns pushToken[]
function getPushTokensForUsers( users ) {
    return getDatabase()
    .then( db => {
        return db.collection( PUSH_TOKENS_COLLECTION )
        .find({ $and: [
            { _id: { $in: users } },
            { foreground: true }
        ]})
        .toArray()
    })
}

// Returns PushToken[]
function getRequestTokens( userid ) {
    return getDatabase()
    .then( db => {
        return db.collection( BUD_REQUESTS_COLLECTION )
        .aggregate([
            { $match: { requester: userid } },
            { $lookup: { // Find push token for each user
                from: PUSH_TOKENS_COLLECTION,
                localField: 'requestee',
                foreignField: '_id',
                as: 'token' // Stored as single element array
            }},
            { $unwind: '$token' }, // Get document out of array
            { $replaceRoot: { newRoot: '$token' } } // Return just the token document
        ])
        .toArray()
    })
    .then( tokens => {
        return tokens.filter( token => token.foreground )
    })
}

// users is userid[]
// Returns PushToken[]
function getLocationListenerTokens( userid ) {
    return getDatabase()
    .then( db => {
        return db.collection( LOCATION_LISTENERS_COLLECTION )
        .aggregate([
            { $match: { _id: userid } },
            { $unwind: '$listeners' }, // Create document for each listener
            { $lookup: { // Find push token for each user
                from: PUSH_TOKENS_COLLECTION,
                localField: 'listeners',
                foreignField: '_id',
                as: 'token' // Stored as single element array
            }},
            { $unwind: '$token' }, // Get document out of array
            { $replaceRoot: { newRoot: '$token' } } // Return just the token document
        ])
        .toArray()
    })
    .then( tokens => {
        return tokens.filter( token => token.foreground )
    })
}

function handleMessagingErrors( serverResponse, tokens ) {
    console.log( JSON.stringify( serverResponse, null, 4 ) )
    if ( serverResponse.failureCount === 0 ) return;

    const responses = serverResponse.responses || serverResponse.results
    const tasks     = []

    responses.forEach(( response, index ) => {
        if ( response.error ) {
            if (
                response.error.code === 'messaging/invalid-registration-token' ||
                response.error.code === 'messaging/registration-token-not-registered'
            ) {
                tasks.push( removeInvalidToken( tokens[ index ] ) )
            }
            else console.error( JSON.stringify( response.error, null, 4 ) )
        }
    })

    return Promise.all( tasks )
}

function removeInvalidToken( token ) {
    // TODO: switch to mongo
    return firestore.collection( 'PushTokens' ).where( 'token', '==', token ).get()
    .then( querySnapshot => {
        let tasks = []
        querySnapshot.forEach( queryDocSnapshot => {
            tasks.push( queryDocSnapshot.ref.delete() )
        })
        return Promise.all( tasks )
    })

//    return getDatabase()
//    .then( db => {
//        db.collection( PUSH_TOKENS_COLLECTION )
//        .deleteOne({ token: token })
//    })
}

function findNearbyUsers( location ) {
    return getDatabase()
    .then( db => {
        return db.collection( USERS_COLLECTION )
        .find({
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [ location.lon, location.lat ]
                    },
                    $maxDistance: MAX_SEARCH_DISTANCE
                }
            }
        })
        .limit( 100 )
        .toArray()
    })
}

function updateLocationListeners( userid, users ) {
    return getDatabase()
    .then( db => {
        let updates = [{
            updateMany: {
                filter: { listeners: userid },
                update: { $pull: { listeners: userid }}
            }
        }]

        updates = updates.concat( users.map( user => {
            return {
                updateOne: {
                    filter: { _id: user._id },
                    update: { $addToSet: { listeners: userid } },
                    upsert: true
                }
            }
        }))

        return db.collection( LOCATION_LISTENERS_COLLECTION )
        .bulkWrite( updates )
    })
}

// Returns an object wich contains the fields in obj that are in properties
// obj: {}
// properties: string[]
Object.subset = function( obj, properties ) {
    let subset = {}

    Object.keys( obj ).forEach( key => {
        if ( properties.includes( key ) ) subset[key] = obj[key]
    })
    
    return subset
}
