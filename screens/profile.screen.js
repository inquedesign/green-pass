import React from 'react'
import UserService from '../services/user.service'

import { Navigation  } from 'react-native-navigation'
import { StyleSheet,
         View,
         Image       } from 'react-native'
import { Text        } from '../components/text.component'
import { Button      } from '../components/button.component'
import { STYLES, REM      } from '../styles'
import { SCREENS     } from '../util/constants'

import SplashScreen from 'react-native-splash-screen'


export default class ProfileScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
        
        this.state = {
            username: '',
            age: 0,
            gender: ''
        }

        if ( this.props.profile ) {
            // Get user profile info for user uid in props.profile
        }
        else {
            // Get this user's profile info
            UserService.getById()
            .then(( userData ) => {
                data = userData.data()
                const age = new Date().getFullYear() - data.birthYear
                this.setState({ username: data.username, age: age, gender: data.gender })
            })
        }
    }

    // TODO: Loading placeholder while data is fetched
    componentDidMount() {
        SplashScreen.hide()
    }

    //goToCreateAccount() {
    //    Navigation.push(this.props.componentId, {
    //        component: { name: SCREENS.ACCOUNT_CREATION_SCREEN }
    //    })
    //}
//
    //goToStart() {
    //    Navigation.pop(this.props.componentId)
    //}

    render() {
        return (
            <View style={[ STYLES.container, LOCAL_STYLES.container ]}>
                <View style={ STYLES.content }>
                    <Image style={[ STYLES.avatar, STYLES.spaceAfter ]}>
                    </Image>
                    <Text style={ STYLES.spaceAfter }>
                        { this.state.username } is a { this.state.age } year old { this.state.gender } from Palmer, AK.
                    </Text>
                    {
                        this.props.profile &&
                        <Button style={ STYLES.spaceAfter }
                            label="Accept"
                            accessibilityLabel="Accept the terms of serice"
                            onPress={ () => {} } />
                    }
                    {
                        this.props.profile &&
                        <Button
                            label="Decline"
                            accessibilityLabel="Decline the terms of service"
                            onPress={ () => {} } />
                    }
                </View>
            </View>
        )
    }
}

const LOCAL_STYLES = {
    container: {
        justifyContent: 'flex-start',
        marginTop: 40 * REM
    }
}