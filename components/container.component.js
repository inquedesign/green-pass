import React    from 'react'
import firebase from 'react-native-firebase'

import { Navigation      } from 'react-native-navigation'
import { StyleSheet,
         ImageBackground,
         ScrollView,
         SafeAreaView,
         View            } from 'react-native'
import { SCREEN_WIDTH,
         SCREEN_HEIGHT,
         COLORS,
         BORDER_RADIUS,
         VH             } from '../styles'

 let CONSTANTS 

export default class Container extends React.PureComponent {
    constructor() {
        super()

        this.state = {
            enableScroll: false,
        }

        this.loggedIn   = !!firebase.auth().currentUser
    }
    
    render() {
        const { containerStyle, contentStyle } = this.props
        const containerStyles = [ defaults.centerContent ]
        const contentStyles = [ defaults.content ]
        if ( containerStyle ) containerStyles.push( containerStyle )
        if ( contentStyle ) contentStyles.push( contentStyle )
        
        return (
            <ImageBackground
                style={ defaults.background }
                resizeMode='repeat'
                source={ this.loggedIn ?
                    require('../assets/bg/White.png') :
                    require('../assets/bg/Green.png') }>

                <ScrollView style={ defaults.container }
                    contentContainerStyle={ containerStyles }
                    alwaysBounceVertical={ false }
                    enablescroll={ true }
                    showsHorizontalScrollIndicator={ false }
                    showsVerticalScrollIndicator={ false }
                    contentInsetAdjustmentBehavior='never'
                    automaticallyAdjustContentInsets={ false }
                    >
                    <View style={ contentStyles }>
                            { this.props.children }
                    </View>
                </ScrollView>

            </ImageBackground>
        )
    }
}

const defaults = StyleSheet.create({
    background: {
        width : '100%',
        height: '100%'
    },
    container: {
        width : '100%',
        height: '100%'
    },
    centerContent: {
        flexGrow      : 1,
        justifyContent: 'center',
        alignItems    : 'center'
    },  
    content: {
        width          : .45 * SCREEN_HEIGHT,
        maxWidth       : '80%',
        padding        : 15 * VH,
        alignItems     : 'center',
        backgroundColor: COLORS.BACKGROUND,
        borderRadius   : BORDER_RADIUS,
        marginVertical : 50 * VH
    }
})