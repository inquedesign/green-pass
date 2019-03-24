import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { Navigation } from 'react-native-navigation'
import { View       } from 'react-native'
import { Text,
         Button,
         Container  } from '../components'
import { YearPicker } from '../components/yearPicker.component'
import { STYLES     } from '../styles'
import { SCREENS    } from '../util/constants'


export default class AgeScren extends React.PureComponent {
    componentDidMount() {
        splash.hide()
        this.state = {
            year: null
        }
    }

    onSubmit() {
        if ( !this.state.year ) return

        UserService.update({ birthYear: this.state.year })
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
                <YearPicker style={ STYLES.spaceAfter }
                    onValueChange={( year ) => { this.setState({ year: year }) }}/>
                <Button
                    label="Submit"
                    accessibilityLabel="Submit your birth year"
                    onPress={ this.onSubmit.bind(this) } />
            </Container>
        )
    }
}
