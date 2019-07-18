'use strict';

import React from 'react'

import { StyleSheet,
         View,
         Text,
         ImageBackground,
         TouchableOpacity } from 'react-native'

import { COLORS,
         FONT_SIZES,
         COMPONENT_HEIGHT,
         BORDER_RADIUS    } from '../styles'


export default class Button extends React.PureComponent {
    render() {
        const {
            label,
            accessibilityLabel,
            color,
            fontColor,
            fontStyle,
            backgroundImage,
            aspectRatio,
            disabled,
            onPress,
            hasTVPreferredFocus,
            nextFocusDown,
            nextFocusForward,
            nextFocusLeft,
            nextFocusRight,
            nextFocusUp,
            testID,
        } = this.props
        const buttonStyles = [ defaults.button ]
        const textStyles   = [ defaults.text ]
        const parentStyles = [ defaults.touchable, this.props.style ]
        if ( color ) {
            buttonStyles.push({ backgroundColor: color })
        }
        if ( fontColor ) {
            textStyles.push({ color: fontColor })
        }
        if ( aspectRatio ) {
            parentStyles.push({ aspectRatio: aspectRatio })
        }
        const accessibilityStates = []
        if( disabled ) {
            accessibilityStates.push( 'disabled' )
            parentStyles.push( defaults.disabled )
        }
        return (
            <TouchableOpacity style={ parentStyles }
                disabled={ disabled }
                accessibilityLabel={ accessibilityLabel }
                accessibilityRole="button"
                accessibilityStates={ accessibilityStates }
                hasTVPreferredFocus={ hasTVPreferredFocus }
                nextFocusDown={ nextFocusDown }
                nextFocusForward={ nextFocusForward }
                nextFocusLeft={ nextFocusLeft }
                nextFocusRight={ nextFocusRight }
                nextFocusUp={ nextFocusUp }
                testID={ testID }
                onPress={ onPress }>
                <ImageBackground style={ buttonStyles }
                    resizeMode={ this.props.resizeMode || 'repeat' }
                    source={ backgroundImage }>

                    { this.props.overlayColor &&
                    <View style={{
                        position: 'absolute',
                        height  : '100%',
                        width   : '100%',
                        opacity : .5,
                        backgroundColor: this.props.overlayColor,
                    }}>
                    </View>
                    }

                    { label &&
                    <Text style={[ textStyles, fontStyle ]}>
                        { label }
                    </Text>
                    }

                    { this.props.children }

                </ImageBackground>
            </TouchableOpacity>
        )
    }
}

const FONT_SIZE = FONT_SIZES.MEDIUM
const HEIGHT    = COMPONENT_HEIGHT

const defaults = StyleSheet.create({
    touchable: {
        height: HEIGHT,
        width : '100%',
        borderRadius   : BORDER_RADIUS,
        overflow: 'hidden'
    },
    button: {
        flex           : 0,
        alignItems     : 'center',
        justifyContent : 'center',
        width          : '100%',
        height         : '100%',
        backgroundColor: COLORS.PRIMARY,
    },
    text: {
        textAlign: 'center',
        color: COLORS.TERTIARY,
        fontFamily: 'HWTArtz',
        letterSpacing: 1.5,
        fontSize: FONT_SIZE
    },
    disabled: {
        opacity: .2
    }
});
