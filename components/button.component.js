'use strict';

import React from 'react'

import { StyleSheet,
         Dimensions,
         Text,
         View,
         TouchableOpacity } from 'react-native'

import { REM,
         COLORS,
         FONT_SIZES,
         COMPONENT_HEIGHT } from '../styles'

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
    * If true, disable all interactions for this component.
    */
    disabled?: ?boolean,

    /**
    * Used to locate this view in end-to-end tests.
    */
    testID?: ?string,
|}>;

/**
* Example usage:
*
* <Button
*   onPress={onPressLearnMore}
*   label="Learn More"
*   color="#841584"
*   accessibilityLabel="Learn more about this purple button"
* />
*/

export class Button extends React.Component<ButtonProps> {
    render() {
        const {
            label,
            accessibilityLabel,
            aspectRatio,
            color,
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
            textStyles.push({ color: color })
            buttonStyles.push({ borderColor: color })
        }
        if ( aspectRatio ) {
            parentStyles.push({ aspectRatio: aspectRatio })
        }
        const accessibilityStates = []
        if ( disabled ) {
            buttonStyles.push( styles.buttonDisabled )
            textStyles.push( styles.textDisabled )
            accessibilityStates.push( 'disabled' )
        }
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
                disabled={ disabled }
                onPress={ onPress }>
                <View style={ buttonStyles }>
                    <Text style={ textStyles } disabled={ disabled }>
                        { label }
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }
}

const FONT_SIZE = FONT_SIZES.MEDIUM

const defaults = StyleSheet.create({
    touchable: {
        height: COMPONENT_HEIGHT,
        width: '100%',
    },
    button: {
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderRadius: 16 * REM,
        borderColor: COLORS.PRIMARY
    },
    text: {
        textAlign: 'center',
        color: COLORS.PRIMARY,
        fontSize: FONT_SIZE,
        fontWeight: '200'
    },
    buttonDisabled: {
        borderColor: COLORS.DISABLED
    },
    textDisabled: {
        color: COLORS.DISABLED
    }
});
