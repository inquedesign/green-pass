import React       from 'react'
import splash      from 'react-native-splash-screen'
import UserService from '../services/user.service'

import { Navigation   } from 'react-native-navigation'
import { View         } from 'react-native'
import { Text,
         Button,
         Container,
         AvatarPicker } from '../components'
import { STYLES,
         COLORS       } from '../styles'
import { SCREENS      } from '../util/constants'


export default class AvatarScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
    }

    componentDidMount() {
        splash.hide()
    }

    onSubmit() {
        if ( !this.avatar ) return
        
        UserService.updateUser({ avatar: this.avatar })
        Navigation.push(this.props.componentId, {
            component: { name: SCREENS.CONTACT_INFO_SCREEN }
        })
    }

    render() {
        return (
            <Container>
                    <Text style={ STYLES.header }>
                        My Avatar
                    </Text>
                    <Text style={ STYLES.spaceAfter }>
                        Choose someone who represents you.
                    </Text>
                    <AvatarPicker style={ STYLES.spaceAfter }
                        onChangeAvatar={( avatar ) => { this.avatar = avatar }}/>
                    <Button
                        label="Continue"
                        accessibilityLabel="Submit your avatar"
                        onPress={ this.onSubmit.bind(this) }/>
            </Container>
        )
    }
}
