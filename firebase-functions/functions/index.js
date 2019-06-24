const Mongodb  = require( 'mongodb' ).MongoClient
const mongoUrl = 'mongodb://GreenPass:uspexOZxIHR0XHYz@cluster0-shard-00-00-z4dj4.gcp.mongodb.net:27017,cluster0-shard-00-01-z4dj4.gcp.mongodb.net:27017,cluster0-shard-00-02-z4dj4.gcp.mongodb.net:27017/greenpass?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'
let mongoClient = null

const functions = require('firebase-functions')
const admin     = require('firebase-admin')
const tools     = require('firebase-tools')
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
                firestore.doc( `PushTokens/${context.params.contact}` ).get(),
                firestore.collection( 'PushTokens' )
                .where( 'user', '==', context.params.contact ).get(),
                firestore.doc( `Users/${context.params.user}` ).get()
            ])
            .then( results => {
                const requestIsMutual   = results[0].exists
                const user              = results[3].data().username

                let payload =  null
                if ( requestIsMutual ) {
                    payload =  {
                        notification: {
                            tag: 'request',
                            title: `A new Bud.`,
                            body : `Congratulations! You are now buds with ${user}`,
                            sound: 'default'
                        },
                        data: {
                            userid: context.params.user
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
                    payload =  {
                        notification: {
                            tag: 'request',
                            title: 'Bud Request',
                            body : `${user} wants to be your bud! Check them out!`,
                            sound: 'default'
                        },
                        data: {
                            userid: context.params.user
                        }
                    }

                    tasks.push(
                        getDatabase()
                        .then( client => {
                            let budRequests = client.collection( BUD_REQUESTS_COLLECTION )

                            return budRequests.insertOne({
                                requester: context.params.user,
                                requestee: context.params.contact
                            })
                        })
                    )
                }

                if ( results[1].exists ) {
                    const registrationToken = results[1].data().token
                    return messaging.sendToDevice( registrationToken, payload )
                }
                if ( results[2].docs.length > 0 ) {
                    const registrationTokens = results[2].docs.map( doc => doc.data().token )
                    return messaging.sendToDevice( registrationTokens, payload )
                }
            })
        )
    }
    else { // Removed
        data = { buds: admin.firestore.FieldValue.arrayRemove( context.params.contact ) }

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
        console.log('Error sending message:', error);
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
        project  : functions.config().auth.project,
        token    : functions.config().auth.token,
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

        if ( change.after.exists && !change.before.exists ) { // Added
            let user = change.after.data()

            // Add to mongo
            return users.insertOne({
                _id      : context.params.user,
                username : user.username,
                birthDate: user.birthDate,
                gender   : user.gender,
                avatar   : user.avatar
            })
        }
        else if ( change.after.exists && change.before.exists ) { // Updated
            let user = change.after.data()
            let prev = change.before.data()

            if (
                user.username === prev.username &&
                user.birthDate === prev.birthDate &&
                user.gender === prev.gender &&
                user.avatar === prev.avatar
            ) return

            // Update record in mongo, create if necessary
            return users.updateOne(
                { _id: context.params.user },
                { $set: {
                    username : user.username,
                    birthDate: user.birthDate,
                    gender   : user.gender,
                    avatar   : user.avatar
                }},
                { upsert: true })
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
    .then( client => {
        let contactMethods = client.collection( CONTACT_METHODS_COLLECTION )

        if ( change.after.exists ) { // Added or updated
            return contactMethods.updateOne(
                { _id: context.params.user },
                { $set: {
                    [context.params.method]: change.after.data()
                }},
                { upsert: true }
            )
        }
        else { // Removed
            return contactMethods.updateOne(
                { _id: context.params.user },
                { $unset: {
                    [context.params.method]: null
                }}
            )
        }
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
            if ( !change.after.data().user ) return null

            return pushTokens.updateOne(
                { _id: change.after.id },
                { $set: {
                    user : change.after.data().user,
                    token: change.after.data().token
                }},
                { upsert: true }
            )
        }
        else { // Removed
            if ( !change.before.data().user ) return null

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
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )
    
    return auth.deleteUser( context.auth.uid )
})

exports.onDeleteAccount = functions.auth.user()
.onDelete(( user, context ) => {

    // TODO: New code for mongo backend
    //return deleteUser( user.uid )
    
    // TODO: Deprecate this code
    return Promise.all([
        firestore.doc( `Users/${user.uid}` ).delete(),
        firestore.doc( `PushTokens/${user.uid}` ).delete(),
    ])
})

/***********************************
* New Api for mongo backend below  *
***********************************/

// Returns profile[] of every user in bud list
exports.getBuds = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

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
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

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
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( BUD_REQUESTS_COLLECTION ).findOne({
            $or: [
                { requester: data.user, requestee: data.bud  },
                { requester: data.bud,  requestee: data.user }
            ]
        })
        .then( response => {
            return response
        })
    })
})

// Returns the bud list for the active user as { buds: userid[] }
//exports.getBudList = functions.https.onCall(( data, context ) => {
//    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )
//
//    return getDatabase()
//    .then( db => {
//        return db.collection( BUD_LISTS_COLLECTION ).findOne({
//            _id: context.auth.uid
//        }, { projection: { _id: 0 } })
//    })
//})

// Returns a single requested user profile, by user id
exports.getProfile = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( USERS_COLLECTION ).findOne({ _id: data.user })
    })
})

// Performs a prefix search of usernames, returning all profiles with a match.
exports.findByUserName = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( USERS_COLLECTION )
            .find({ username: {
                $regex: `^${data.searchString}.*$`
            }})
            .toArray()
    })
})


// TODO: exports.findByLocation = functions.https.onCall(( data, context ) => {
//})

// Returns contact methods for requested user, if they are authorized to view them
exports.getContactMethods = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

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
                if ( count < 2 ) throw new functions.https.HttpsError( 'permission-denied', 'Must be buds to view contact info.', 'permission-denied' )
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
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    // Limit submitted fields to those supported
    const fields = [
        'username',
        'birthDate',
        'gender',
        'avatar'
    ]

    data = Object.subset( data, fields )

    // TODO: update firestore, too
    //firestore.doc( `Users/${context.auth.uid}` )
    //    .set( data, { merge: true } )

    return getDatabase()
    .then( db => {
        return Promise.all([
            db.collection( USERS_COLLECTION )
            .updateOne(
                { _id: context.auth.uid },
                { $set: data },
                { upsert: true }
            ),
            getProfileListenerTokens( context.auth.uid ),
            getBudTokens( context.auth.uid ),
            getRequestTokens( context.auth.uid )
        ])
        .then( results => {
            const profileListeners = results[1].map( token => token.token )
            const buds             = results[2].map( token => token.token )
            const requests         = results[3].map( token => token.token )

            // Ensure unique entries with 2 lines of code
            let pushTokens = new Set( profileListeners.concat( buds ).concat( requests ) )
            pushTokens = Array.from( pushTokens )

            let messages = []

            for( let i = 0; i < pushTokens.length; i += 100 ) {
                let tokens = pushTokens.slice( i, i + 100 )
                let message = {
                    tokens: tokens,
                    data: {
                        type: 'profile-update',
                        user: context.auth.uid,
                        data: JSON.stringify( data )
                    }
                }

                messages.push(
                    messaging.sendMulticast( message )
                    .then( response => { handleMessagingErrors( response, tokens ) } )
                )
            }

            return Promise.all( messages )
        })
    })
    .then(() => {
        return null
    })
})

// Adds contact method to user's list of contact methods
exports.updateContactMethods = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    const supportedMethods = [
        'facebook',
        'twitter',
        'whatsapp',
        'snapchat',
        'reddit',
        'instagram',
        'text' 
    ]

    // TODO: update firebase
    //let batch = firestore.batch()
    //supportedMethods.forEach( key => {
    //    if ( data[key] ) {
    //        const doc = firestore.doc( `Users/${context.auth.uid}` ).collection('ContactMethods').doc( key )
    //        batch = batch.set( doc, data[key], { merge: true } )
    //    }
    //})
    //return batch.commit()

    data = Object.subset( data, supportedMethods )

    return getDatabase()
    .then( db => {
        return Promise.all([
            db.collection( CONTACT_METHODS_COLLECTION )
            .updateOne(
                { _id: context.auth.uid },
                { $set: data },
                { upsert: true }
            ),
            getProfileListenerTokens( context.auth.uid ),
            db.collection( BUD_LISTS_COLLECTION ).findOne({ _id: context.auth.uid }),
        ])
        .then( results => {
            const buds       = new Set( results[2].buds )
            const pushTokens = results[1]
            .filter(
                listener => { return buds.has( listener.user ) || listener.user === context.auth.uid }
            )
            .map( token => token.token )
            
            let messages = []

            for( let i = 0; i < pushTokens.length; i += 100 ) {
                let tokens = pushTokens.slice( i, i + 100 )
                let message = {
                    tokens: tokens,
                    data: {
                        type: 'contact-methods-update',
                        user: context.auth.uid,
                        data: JSON.stringify( data )
                    }
                }

                messages.push(
                    messaging.sendMulticast( message )
                    .then( response => { handleMessagingErrors( response, tokens ) } )
                )
            }

            return Promise.all( messages )
        })
    })
    .then(() => {
        return null
    })
})

// If a bud request requests exists from target, then both users will be added to each other's lists
// Otherwise, a bud request will be created
// Target user will receive a notification
exports.addBud = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )
    if ( context.auth.uid === data.user ) throw new functions.https.HttpsError( 'invalid-argument' )

    return getDatabase()
    .then( db => {
        return Promise.all([
            db.collection( BUD_REQUESTS_COLLECTION )
            .findOne({
                requester: data.user,
                requestee: context.auth.uid
            }),
            db.collection( USERS_COLLECTION ).find({ _id: { $in: [ context.auth.uid, data.user ] } }).toArray(),
            db.collection( BUD_LISTS_COLLECTION ).findOne({ _id: context.auth.uid }),
            db.collection( PUSH_TOKENS_COLLECTION ).find({ user:  data.user }).toArray(),
            getBudTokensForUsers([ context.auth.uid, data.user ])
        ])
        .then( results => {
            let request    = results[0]
            let budList    = results[2]
            let userTokens = results[3]
            let listeners  = results[4]
            let user1
            let user2

            results[1].forEach( user => {
                if ( user._id === context.auth.uid ) user1 = user
                else user2 = user
            })
            
            // Already buds
            if ( budList.buds.includes( data.user ) ) throw new functions.https.HttpsError( 'invalid-argument' )

            // TODO: update firebase, too
            //return firestore.doc( `Users/${context.auth.uid}` ).collection( 'ContactList' ).doc( data.user )
            //.set({ id: data.user })
            if ( request ) { // remove request and add users to budlists
                return Promise.all([
                    db.collection( BUD_REQUESTS_COLLECTION ).deleteOne( request ),
                    db.collection( BUD_LISTS_COLLECTION ).bulkWrite(
                        [{
                            updateOne: {
                                filter: { _id: request.requester },
                                update: { $addToSet: { buds: request.requestee } },
                                upsert: true
                            }
                        },
                        {
                            updateOne: {
                                filter: { _id: request.requestee },
                                update: { $addToSet: { buds: request.requester } },
                                upsert: true
                            }
                        }],
                        { ordered: false }
                    )
                ])
                .then(() => {
                    const messages = []

                    userTokens.forEach( token => {
                        messages.push({
                            token: token.token,
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
                                body : `Congratulations! You are now buds with ${user1.username}`,
                            },
                            data: {
                                userid: user1._id
                            }
                        })
                    })
                    
                    listeners.forEach( token => {
                        messages.push({
                            token: token.token,
                            data: {
                                type: 'bud-added',
                                data: JSON.stringify( token.user === user1._id ? user2 : user1 ) // Profile
                            }
                        })
                    })

                    if ( messages.length > 0 ) {
                        return messaging.sendAll( messages )
                        .then( response =>
                            handleMessagingErrors(
                                response,
                                userTokens.concat( listeners ).map( token => token.token )
                            )
                         )
                    }
                })
                .then(() => {
                    //return { type: 'added', user: user2 }
                    return null
                })
            }
            else if ( user2 ) { // Add a bud request
                const request = { requester: context.auth.uid, requestee: data.user }
                return db.collection( BUD_REQUESTS_COLLECTION )
                .insertOne( request )
                .then(() => {
                    const messages = []

                    userTokens.forEach( token => {
                        messages.push({
                            token: token.token,
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
                                body : `${user1.username} wants to be your bud! Check them out!`,
                            },
                            data: {
                                userid: user1._id
                            }
                        })
                    })
                    
                    listeners.forEach( token => {
                        messages.push({
                            token: token.token,
                            data: {
                                type: 'bud-request',
                                data: JSON.stringify({
                                    user   : token.user === user1._id ? user2 : user1,
                                    request: request
                                })
                            }
                        })
                    })

                    if ( messages.length > 0 ) {
                        return messaging.sendAll( messages )
                        .then( response =>
                            handleMessagingErrors(
                                response,
                                userTokens.concat( listeners ).map( token => token.token )
                            )
                        )
                    }
                })
                .then(() => {
                    return null
                })
            }
            else {
                throw new functions.https.HttpsError( 'invalid-argument' )
            }
        })
    })
})

// Removes users from each other's lists, and removes any associated bud requests
exports.removeBud = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    // TODO: update firebase, too
    //return firestore.batch()
    //.delete( firestore.doc( `Users/${context.auth.uid}` ).collection( 'ContactList' ).doc( data.user ) )
    //.delete( firestore.doc( `Users/${data.user}` ).collection( 'ContactList' ).doc( context.auth.uid ) )
    //.commit()

    return getDatabase()
    .then( db => {
        return Promise.all([
            db.collection( BUD_LISTS_COLLECTION ).bulkWrite(
                [{
                    updateOne: {
                        filter: { _id: context.auth.uid },
                        update: { $pull: { buds: data.user } }
                    }
                },
                {
                    updateOne: {
                        filter: { _id: data.user },
                        update: { $pull: { buds: context.auth.uid } }
                    }
                }],
                { ordered: false }
            ),
            db.collection( BUD_REQUESTS_COLLECTION ).bulkWrite(
                [{
                    deleteOne: {
                        filter: {
                            requester: context.auth.uid,
                            requestee: data.user
                        }
                    }
                },
                {
                    deleteOne: {
                        filter: {
                            requester: data.user,
                            requestee: context.auth.uid
                        }
                    }
                }],
                { ordered: false }
            ),
            getBudTokensForUsers([ context.auth.uid, data.user ])
        ])
        .then( results => {
            let listeners = results[2]
            
            const messages = []
            
            listeners.forEach( token => {
                messages.push({
                    token: token.token,
                    data: {
                        type: 'bud-removed',
                        user: token.user === context.auth.uid ? data.user : context.auth.uid // userid
                    }
                })
            })

            if ( messages.length > 0 ) {
                return messaging.sendAll( messages )
                .then( response => handleMessagingErrors( response, listeners.map( token => token.token ) ) )
            }
        })
    })
    .then(() => {
        return null
    })
})

exports.updatePushToken = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    // TODO: update firestore, too
    //firestore.doc( `PushTokens/${context.auth.uid}` )
    //    .set( { token: data.token }, { merge: true } )

    return getDatabase()
    .then( db => {
        return db.collection( PUSH_TOKENS_COLLECTION )
        .updateOne(
            { _id: data.deviceId },
            { $set: {
                user : context.auth.uid,
                token: data.token
            }},
            { upsert: true }
        )
    })
    .then(() => {
        return null
    })
})

exports.removePushToken = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    // TODO: update firestore, too
    //firestore.doc( `PushTokens/${context.auth.uid}` ).delete()

    return getDatabase()
    .then( db => {
        return db.collection( PUSH_TOKENS_COLLECTION )
        .deleteOne({ _id: data.deviceId })
    })
    .then(() => {
        return null
    })
})

exports.updateLocation = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )
    if ( !data.lon || data.lon < -180 || data.lon > 180 ||
         !data.lat || data.lat < -90  || data.lat > 90 ) {
        throw new functions.https.HttpsError( 'invalid-argument' )
    }

    return getDatabase()
    .then( db => {
        return db.collection( USERS_COLLECTION )
        .updateOne(
            { _id: context.auth.uid },
            { $set: {
                location: {
                    type       : 'Point',
                    coordinates: [ data.lon, data.lat ]
                }
            }}
        )
    })
    .then(() => {
        // TODO: notify users
    })
    .then(() => {
        return null
    })
})

// Registers at most 1 listener per device
exports.registerProfileListener = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( PROFILE_LISTENERS_COLLECTION )
        .updateOne(
            { _id: data.user },
            { $addToSet: { listeners: data.deviceId } },
            { upsert: true }
        )
    })
    .then(() => {
        return null
    })
})

exports.unregisterProfileListener = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( PROFILE_LISTENERS_COLLECTION )
        .updateOne(
            { _id: data.user },
            { $pull: { listeners: data.deviceId } }
        )
    })
    .then(() => {
        return null
    })
})

// Registers at most 1 listener per device
exports.registerBudListener = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( BUD_LISTENERS_COLLECTION )
        .updateOne(
            { _id: context.auth.uid },
            { $addToSet: { listeners: data.deviceId } },
            { upsert: true }
        )
    })
    .then(() => {
        return null
    })
})

exports.unregisterBudListener = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( BUD_LISTENERS_COLLECTION )
        .updateOne(
            { _id: context.auth.uid },
            { $pull: { listeners: data.deviceId } }
        )
    })
    .then(() => {
        return null
    })
})

// Registers at most 1 listener per device
exports.registerLocationListener = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( LOCATION_LISTENERS_COLLECTION )
        .updateOne(
            { _id: data.deviceId },
            { user: context.auth.uid },
            { upsert: true }
        )
    })
    .then(() => {
        return null
    })
})

exports.unregisterLocationListener = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) throw new functions.https.HttpsError( 'unauthenticated' )

    return getDatabase()
    .then( db => {
        return db.collection( LOCATION_LISTENERS_COLLECTION )
        .deleteOne({ _id: data.deviceId })
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

        return Promise.all([
            users.deleteOne({ _id: userid }),
            budLists.deleteOne({ _id: userid }),
            budLists.updateMany(
                { buds: userid },           // If bud list contains this user,
                { $pull: { buds: userid } } // Remove this user from bud list
            ),
            budRequests.deleteMany({ // Remove all requests associated with user
                $or: [
                    { requester: userid },
                    { requestee: userid }
                ]
            }),
            contactMethods.deleteOne({ _id: userid }),
            pushTokens.deleteMany({ user: userid })
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
            { $lookup: { // Find push token for each device
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
}

// Returns PushToken[]
function getBudTokens( userid ) {
    return getDatabase()
    .then( db => {
        return db.collection( BUD_LISTS_COLLECTION )
        .aggregate([
            { $match: { _id: userid } },
            { $unwind: '$buds' }, // Create document for each bud in list
            // TODO: add another lookup phase
            { $lookup: { // Find registered listeners for each user
                from: BUD_LISTENERS_COLLECTION,
                localField: 'buds',
                foreignField: '_id',
                as: 'listeners' // Stored as [{ _id, listeners: [deviceId] }]
            }},
            { $unwind: '$listeners' },
            { $unwind: '$listeners.listeners' }, // Create document for each deviceId
            { $lookup: { // Find push token for each device
                from: PUSH_TOKENS_COLLECTION,
                localField: 'listeners.listeners',
                foreignField: '_id',
                as: 'token' // Stored as single element array
            }},
            { $unwind: '$token' }, // Get document out of array
            { $replaceRoot: { newRoot: '$token' } } // Return just the token document
        ])
        .toArray()
    })
}

// users is userid[]
// returns pushToken[]
function getBudTokensForUsers( users ) {
    return getDatabase()
    .then( db => {
        return db.collection( BUD_LISTENERS_COLLECTION )
        .aggregate([
            { $match: { _id: { $in: users } } },
            { $unwind: '$listeners' }, // Create document for each bud in list
            { $lookup: { // Find push token for each device
                from: PUSH_TOKENS_COLLECTION,
                localField: 'listeners',
                foreignField: '_id',
                as: 'token' // Stored as array
            }},
            { $unwind: '$token' }, // Get tokens out of array
            { $replaceRoot: { newRoot: '$token' } } // Return just the tokens
        ])
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
            { $lookup: { // Find registered listeners for each user
                from: BUD_LISTENERS_COLLECTION,
                localField: 'requestee',
                foreignField: '_id',
                as: 'listeners' // Stored as [{ _id, listeners: [deviceId] }]
            }},
            { $unwind: '$listeners' },
            { $unwind: '$listeners.listeners' }, // Create document for each deviceId
            { $lookup: { // Find push token for each device
                from: PUSH_TOKENS_COLLECTION,
                localField: 'listeners.listeners',
                foreignField: '_id',
                as: 'token' // Stored as single element array
            }},
            { $unwind: '$token' }, // Get document out of array
            { $replaceRoot: { newRoot: '$token' } } // Return just the token document
        ])
        .toArray()
    })
}

// users is userid[]
// Returns PushToken[]
function getLocationListenerTokensForUsers( users ) {
    return getDatabase()
    .then( db => {
        return db.collection( LOCATION_LISTENERS_COLLECTION )
        .aggregate([
            { $match: { user: { $in: users } } },
            { $lookup: { // Find push token for user
                from: PUSH_TOKENS_COLLECTION,
                localField: '_id',
                foreignField: '_id',
                as: 'token' // Stored as single element array
            }},
            { $unwind: '$token' }, // Get document out of array
            { $replaceRoot: { newRoot: '$token' } } // Return just the token document
        ])
        .toArray()
    })
}

function handleMessagingErrors( result, tokens ) {
    if ( result.failureCount == 0 ) return;

    const work = []

    result.responses.forEach(( response, index ) => {
        if ( response.error ) {
            if (
                response.error.code === 'messaging/invalid-registration-token' ||
                response.error.code === 'messaging/registration-token-not-registered'
            ) {
                work.push( getDatabase()
                    .then( db => {
                        db.collection( PUSH_TOKENS_COLLECTION )
                        .deleteOne({ token: tokens[ index ].token })
                    })
                )
            }
            else console.error( response.error.message )
        }
    })

    return Promise.all( work )
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

//function sendBudStatusUpdate( user1, user2, updateType, tokens ) {
//    const messages = []
//
//    tokens.forEach( token => {
//        if ( token.user === user1._id ) {
//            messages.push({
//                token: token.token,
//                data: {
//                    type: updateType,
//                    data: JSON.stringify( user2 ) // Profile
//                }
//            })
//        }
//        else {
//            if ( updateType === 'bud-added' ) messages.push({
//                // TODO: userTokens.forEach
//                token: token.token,
//                notification: {
//                    tag: 'request',
//                    title: `A new Bud.`,
//                    body : `Congratulations! You are now buds with ${user1.username}`,
//                    sound: 'default'
//                },
//                data: {
//                    userid: user1._id
//                }
//            })
//
//            if ( updateType === 'bud-added' ) messages.push({
//                // TODO: userTokens.forEach
//                token: token.token,
//                notification: {
//                    tag: 'request',
//                    title: `A new Bud.`,
//                    body : `Congratulations! You are now buds with ${user1.username}`,
//                    sound: 'default'
//                },
//                data: {
//                    userid: user1._id
//                }
//            })
//
//            messages.push({
//                // TODO: budListeners.forEach
//                token: token.token,
//                data: {
//                    type: updateType,
//                    data: JSON.stringify( user1 ) // Profile
//                }
//            })
//        }
//    })
//
//
//    return messaging.sendAll( messages )
//}
// TODO: manage multiple registration tokens per user, one per device