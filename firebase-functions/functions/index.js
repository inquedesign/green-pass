const functions = require('firebase-functions')
const admin     = require('firebase-admin')
const tools     = require('firebase-tools')
admin.initializeApp()

// Since this code will be running in the Cloud Functions environment
// we initialize Firestore without any arguments because it
// detects authentication from the environment.
const firestore = admin.firestore()

exports.syncContactList = functions.firestore.document('Users/{user}/ContactList/{contact}')
.onWrite(( change, context ) => {
    let data = null

    // Updates won't happen, because security rule prevents it, so handle add/remove
    if ( change.after.exists ) { // Added
        data = { buds: admin.firestore.FieldValue.arrayUnion( context.params.contact ) }
    }
    else { // Removed
        data = { buds: admin.firestore.FieldValue.arrayRemove( context.params.contact ) }
    }

    return firestore.collection( 'Users' ).doc( context.params.user ).get()
    .then( docref => {
        if ( docref.exists ) {
            return firestore.collection( 'Users' ).doc( context.params.user )
            .set( data, { merge: true } )
        }
    })
})

exports.deleteProfile = functions.firestore.document('Users/{user}')
.onDelete(( doc, context) => {
    return Promise.all([
        tools.firestore
        .delete( `Users/${context.params.user}/ContactList`, {
            project  : functions.config().auth.project,
            token    : functions.config().auth.token,
            recursive: true,
            yes      : true
        }),
        tools.firestore
        .delete( `Users/${context.params.user}/ContactMethods`, {
            project  : functions.config().auth.project,
            token    : functions.config().auth.token,
            recursive: true,
            yes      : true
        })
    ])
})