import React from 'react'
import UserService from '../services/user.service'

import { Navigation  } from 'react-native-navigation'
import { StyleSheet,
         View,
         Image       } from 'react-native'
import { Text,
         Button,
         Container   } from '../components'
import { STYLES, REM } from '../styles'
import { SCREENS     } from '../util/constants'

import SplashScreen from 'react-native-splash-screen'


export default class ProfileScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
        
        this.state = {
            id: null,
            username: null,
            age: null,
            gender: null
        }
    }

    // TODO: Loading placeholder while data is fetched
    componentDidMount() {
        if ( this.props.profile ) {
            const data = this.props.profile
            this.setState({ id: data.id, username: data.username, age: data.age, gender: data.gender })
        }
        else {
            // Get this user's profile info
            // TODO: add listener for changes
            UserService.getById()
            .then(( data ) => {
                this.setState({ id: data.id, username: data.username, age: data.age, gender: data.gender })
            })
        }
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
            <Container style={ LOCAL_STYLES.container }>
                <Image style={[ STYLES.avatar, STYLES.spaceAfter ]}>
                </Image>
                <Text style={ STYLES.spaceAfter }>
                {
                    this.state.id &&
                    `${this.state.username} is a ${this.state.age} year old ${this.state.gender} from Palmer, AK.`
                }
                </Text>

                {
                    false &&
                    <Button style={ STYLES.spaceAfter }
                        label="Accept"
                        accessibilityLabel="Accept the terms of serice"
                        onPress={ () => {} } />
                }
                {
                    this.props.profile &&
                    <Button
                        label="Become Buds"
                        accessibilityLabel="Ask this user to be your bud"
                        onPress={ () => {} } />
                }
            </Container>
        )
    }
}

const LOCAL_STYLES = {
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        marginVertical: 20 * REM
    }
}