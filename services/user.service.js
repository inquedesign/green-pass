import React    from 'react'
import firebase from 'react-native-firebase'

import { Navigation  } from 'react-native-navigation'

const FIRESTORE = firebase.firestore().collection('Users')
const AUTH      = firebase.auth()

export default class UserService {

    static createAccount( email, password ) {
        return AUTH.createUserWithEmailAndPassword(
            email,
            password
        )
    }

    static update( dataToUpdate ) {
        if ( AUTH.currentUser ) {
            FIRESTORE
            .doc( AUTH.currentUser.email )
            .set( dataToUpdate, { merge: true } )
        }
        else {
        //    Navigation.push(this.props.componentId, {
        //        component: { name: 'LoginScreen' }
        //    })
        }
    }
}
