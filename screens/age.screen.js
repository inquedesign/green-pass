import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { Navigation } from 'react-native-navigation'
import { View       } from 'react-native'
import { Text,
         Button,
         DatePicker,
         Container  } from '../components'
import { STYLES     } from '../styles'
import { SCREENS    } from '../util/constants'


export default class AgeScreen extends React.PureComponent {
    componentDidMount() {
        splash.hide()
        this.state = {
            date: null
        }
    }

    onSubmit() {
        if ( !this.state.date ) return

        UserService.update({ birthDate: this.state.date })
        Navigation.push(this.props.componentId, {
            component: { name: SCREENS.USERNAME_SCREEN }
        })
    }

    render() {
        return (
            <Container>
                <Text style={ STYLES.header }>
                    Age Verification
                </Text>

                <Text style={ STYLES.spaceAfter }>
                    I was born in:
                </Text>

                <DatePicker
                    style={ STYLES.spaceAfter }
                    onDateChange={( date ) => { this.setState({ date: date }) }}/>

                <Button
                    label="Submit"
                    accessibilityLabel="Submit your birth year"
                    onPress={ this.onSubmit.bind(this) } />
            </Container>
        )
    }
}
