import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { Navigation } from 'react-native-navigation'
import { View       } from 'react-native'
import { Text       } from '../components/text.component'
import { Button     } from '../components/button.component'
import { STYLES,
         COLORS     } from '../styles'
import { SCREENS    } from '../util/constants'


export default class AvatarScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
        this.state = {}
    }

    componentDidMount() {
        splash.hide()
    }

    onSubmit() {
        Navigation.push(this.props.componentId, {
            component: { name: SCREENS.CONTACT_INFO_SCREEN }
        })
    }

    render() {
        return (
            <View style={ STYLES.container }>
                <View style={ STYLES.content }>
                    <Text style={ STYLES.header }>
                        My Avatar
                    </Text>
                    <Text style={ STYLES.spaceAfter }>
                        Pick an avatar:
                    </Text>
                    <View style={[ STYLES.avatar, STYLES.spaceAfter ]}/>
                    <Button
                        label="Submit"
                        accessibilityLabel="Submit your avatar"
                        onPress={ this.onSubmit.bind(this) }/>
                </View>
            </View>
        )
    }
}
