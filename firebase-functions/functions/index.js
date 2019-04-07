const functions = require('firebase-functions')
const admin     = require('firebase-admin')
const tools     = require('firebase-tools')
admin.initializeApp()

// Since this code will be running in the Cloud Functions environment
// we initialize Firestore without any arguments because it
// detects authentication from the environment.
const firestore = admin.firestore()
const auth      = admin.auth()

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

exports.deleteProfile = functions.firestore.document( 'Users/{user}' )
.onDelete(( doc, context) => {
    return Promise.all([
        firestore.doc( 'Statistics/UserCount' ).set({
            count: admin.firestore.FieldValue.increment( -1 )
         }, { merge: true }),
        deleteCollection( `Users/${context.params.user}/ContactList` ),
        deleteCollection( `Users/${context.params.user}/ContactMethods` )
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

exports.addProfile = functions.firestore.document( 'Users/{user}' )
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
    
    return Promise.all([
        firestore.doc( `Users/${context.auth.uid}` ).delete(),
        auth.deleteUser( context.auth.uid )
    ])
})
