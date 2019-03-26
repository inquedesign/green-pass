import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { Navigation } from 'react-native-navigation'
import { View       } from 'react-native'
import { Text,
         TextInput,
         Button,
         Container  } from '../components'
import { STYLES     } from '../styles'
import { SCREENS    } from '../util/constants'


export default class UsernameScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
        this.state = {
            username: ''
        }
    }

    componentDidMount() {
        splash.hide()
    }

    onSubmit() {
        if ( this.state.username.length === 0 ) return

        UserService.updateUser({ username: this.state.username })
        Navigation.push(this.props.componentId, {
            component: { name: SCREENS.AVATAR_SCREEN }
        })
    }

    render() {
        return (
            <Container>
                <Text style={ STYLES.header }>
                    Username
                </Text>
                <Text style={ STYLES.spaceAfter }>
                    I want my username to be:
                </Text>
                <TextInput style={ STYLES.spaceAfter }
                    accessibilityLabel="Enter a username to show others"
                    placeholder='Username'
                    autoComplete='username'
                    textContentType='username'
                    onChangeText={ (text) => this.setState({ username: text }) }/>
                <Button
                    label="Submit"
                    accessibilityLabel="Submit your username"
                    onPress={ this.onSubmit.bind(this) }/>
            </Container>
        )
    }
}
