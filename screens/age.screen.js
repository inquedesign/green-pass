import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { Navigation } from 'react-native-navigation'
import { View       } from 'react-native'
import { Text       } from '../components/text.component'
import { Button     } from '../components/button.component'
import { YearPicker } from '../components/yearPicker.component'
import { STYLES     } from '../styles'


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
            component: { name: 'UsernameScreen' }
        })
    }

    render() {
        return (
            <View style={ STYLES.container }>
                <View style={ STYLES.content }>
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
                </View>
            </View>
        )
    }
}
