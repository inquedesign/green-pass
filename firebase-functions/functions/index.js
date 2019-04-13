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
                firestore.doc( `Users/${context.params.user}` ).get()
            ])
            .then( results => {
                const requestIsMutual   = results[0].exists
                const registrationToken = results[1].data().token
                const user              = results[2].data().username

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
                }

                return messaging.sendToDevice( registrationToken, payload )
            })
        )
    }
    else { // Removed
        data = { buds: admin.firestore.FieldValue.arrayRemove( context.params.contact ) }
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

exports.deleteAccount = functions.https.onCall(( data, context ) => {
    if ( !context.auth ) return
    
    auth.deleteUser( context.auth.uid )
})

exports.onDeleteAccount = functions.auth.user()
.onDelete(( user, context ) => {

    return Promise.all([
        firestore.doc( `Users/${user.uid}` ).delete(),
        firestore.doc( `PushTokens/${user.uid}` ).delete(),
    ])
})
