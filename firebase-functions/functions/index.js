const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Since this code will be running in the Cloud Functions environment
// we call initialize Firestore without any arguments because it
// detects authentication from the environment.
const firestore = admin.firestore();

exports.syncContactList = functions.firestore.document('Users/{user}/ContactList/{contact}')
    .onDelete(( change, context ) => {
        let data = null

        // Updates won't happen, because security rule prevents it, so handle add/remove
        if ( change.after.exists ) { // Added
            data = { buds: admin.firestore.FieldValue.arrayUnion( context.params.contact ) }
        }
        else { // Removed
            data = { buds: admin.firestore.FieldValue.arrayRemove( context.params.contact ) }
        }

        return firestore.collection('Users' ).doc( context.params.user ).set(data, { merge: true })
    })
