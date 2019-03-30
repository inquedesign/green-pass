'use strict';

import React from 'react'

import { StyleSheet,
         Dimensions,
         Text,
         ImageBackground,
         TouchableOpacity } from 'react-native'

import { COLORS,
         FONT_SIZES,
         COMPONENT_HEIGHT,
         BORDER_RADIUS    } from '../styles'

import type {PressEvent} from 'react-native'

type ButtonProps = $ReadOnly<{|
    /**
    * Text to display inside the button
    */
    label: string,

    /**
    * Handler to be called when the user taps the button
    */
    onPress: (event?: PressEvent) => mixed,

    /**
    * Color of the text (iOS), or background color of the button (Android)
    */
    color?: ?string,

    /**
    * TV preferred focus (see documentation for the View component).
    */
    hasTVPreferredFocus?: ?boolean,

    /**
    * TV next focus down (see documentation for the View component).
    *
    * @platform android
    */
    nextFocusDown?: ?number,

    /**
    * TV next focus forward (see documentation for the View component).
    *
    * @platform android
    */
    nextFocusForward?: ?number,

    /**
    * TV next focus left (see documentation for the View component).
    *
    * @platform android
    */
    nextFocusLeft?: ?number,

    /**
    * TV next focus right (see documentation for the View component).
    *
    * @platform android
    */
    nextFocusRight?: ?number,

    /**
    * TV next focus up (see documentation for the View component).
    *
    * @platform android
    */
    nextFocusUp?: ?number,

    /**
    * Text to display for blindness accessibility features
    */
    accessibilityLabel?: ?string,

    /**
    * Used to locate this view in end-to-end tests.
    */
    testID?: ?string,
|}>;


export default class Button extends React.PureComponent<ButtonProps> {
    render() {
        const {
            label,
            accessibilityLabel,
            backgroundImage,
            aspectRatio,
            color,
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
        if ( backgroundImage ) {
            buttonStyles.push({ backgroundColor: 'transparent' })
        }
        if ( color ) {
            textStyles.push({ color: color })
        }
        if ( aspectRatio ) {
            parentStyles.push({ aspectRatio: aspectRatio })
        }
        const accessibilityStates = []
        return (
            <TouchableOpacity style={ parentStyles }
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
                    resizeMode='repeat'
                    source={ backgroundImage }>

                    <Text style={ textStyles }>
                        { label }
                    </Text>
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
    }
});
