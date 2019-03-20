import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { Navigation } from 'react-native-navigation'
import { View       } from 'react-native'
import { Text       } from '../components/text.component'
import { Button     } from '../components/button.component'
import { STYLES     } from '../styles'
import { SCREENS    } from '../util/constants'


export default class GenderScreen extends React.PureComponent {
    componentDidMount() {
        splash.hide()
    }

    setGender( gender ) {
        UserService.update({ gender: gender })
        Navigation.push(this.props.componentId, {
            component: { name: SCREENS.AGE_SCREEN }
        })
    }

    render() {
        return (
            <View style={ STYLES.container }>
                <View style={ STYLES.content }>
                    <Text style={ STYLES.header }>
                        The Basics
                    </Text>
                    <Text style={ STYLES.spaceAfter }>
                        I am a:
                    </Text>
                    <Button style={ STYLES.spaceAfter }
                        label="Male"
                        accessibilityLabel="Select if male"
                        onPress={ () => { this.setGender( 'male' ) } } />
                    <Button style={ STYLES.spaceAfter }
                        label="Female"
                        accessibilityLabel="Select if female"
                        onPress={ () => { this.setGender( 'female' ) } } />
                    <Button
                        label="Other"
                        accessibilityLabel="Select if you identify with some other gender"
                        onPress={ () => { this.setGender( 'other' ) } } />
                </View>
            </View>
        )
    }
}
