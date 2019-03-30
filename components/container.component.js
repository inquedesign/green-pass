import React    from 'react'
import firebase from 'react-native-firebase'

import { Navigation      } from 'react-native-navigation'
import { StyleSheet,
         ImageBackground,
         SafeAreaView,
         View            } from 'react-native'
import { SCREEN_WIDTH,
         SCREEN_HEIGHT,
         COLORS,
         BORDER_RADIUS,
         VH             } from '../styles'

export default class Container extends React.PureComponent {
    constructor() {
        super()

        this.loggedIn = !!firebase.auth().currentUser
    }

    render() {
        return (
            <ImageBackground
                style={ STYLES.background }
                resizeMode='repeat'
                source={ this.loggedIn ?
                    require('../assets/bg/White.png') :
                    require('../assets/bg/Green.png') }>

                <View style={[ STYLES.container, this.props.style ]}>
                    <View style={ STYLES.content }>
                        { this.props.children }
                    </View>
                </View>
            </ImageBackground>
        )
    }
}

const STYLES = StyleSheet.create({
    background: {
        flex           : 0,
        justifyContent : 'center',
        alignItems     : 'center',
        width : '100%',
        height: '100%'
    },
    container: {
        width          : .45 * SCREEN_HEIGHT,
        maxWidth       : '80%',
        padding        : 15 * VH,
        alignItems     : 'center',
        backgroundColor: COLORS.BACKGROUND,
        borderRadius   : BORDER_RADIUS
    },
    content: {
        width          : '100%',
        alignItems     : 'center',
        backgroundColor: 'transparent',
    }
})