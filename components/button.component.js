'use strict';

import React from 'react'

import { StyleSheet,
         Dimensions,
         Text,
         View,
         TouchableOpacity } from 'react-native'

import { REM } from '../styles'

import COLORS from '../config/colors'

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
            accessibilityLabel,
            color,
            onPress,
            label,
            hasTVPreferredFocus,
            nextFocusDown,
            nextFocusForward,
            nextFocusLeft,
            nextFocusRight,
            nextFocusUp,
            disabled,
            testID,
        } = this.props;
        const buttonStyles = [ styles.button, this.props.style ];
        const textStyles = [ styles.text ];
        if ( color ) {
            textStyles.push({ color: color });
            buttonStyles.push({ borderColor: color });
        }
        const accessibilityStates = [];
        if ( disabled ) {
            buttonStyles.push( styles.buttonDisabled );
            textStyles.push( styles.textDisabled );
            accessibilityStates.push( 'disabled' );
        }
        return (
            <TouchableOpacity style={styles.touchable}
                accessibilityLabel={accessibilityLabel}
                accessibilityRole="button"
                accessibilityStates={accessibilityStates}
                hasTVPreferredFocus={hasTVPreferredFocus}
                nextFocusDown={nextFocusDown}
                nextFocusForward={nextFocusForward}
                nextFocusLeft={nextFocusLeft}
                nextFocusRight={nextFocusRight}
                nextFocusUp={nextFocusUp}
                testID={testID}
                disabled={disabled}
                onPress={onPress}>
                <View style={buttonStyles}>
                    <Text style={textStyles} disabled={disabled}>
                        {label}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    touchable: {
        width: '80%',
        maxWidth: .3429 * Dimensions.get('window').height
    },
    button: {
        width: '100%',
        backgroundColor: COLORS.BACKGROUND,
        borderWidth: 1,
        borderRadius: 16 * REM,
        borderColor: COLORS.PRIMARY
    },
    text: {
        textAlign: 'center',
        paddingTop: 10 * REM,
        paddingBottom: 10 * REM,
        color: COLORS.PRIMARY,
        fontSize: 12 * REM,
        fontWeight: '200'
    },
    buttonDisabled: {
        borderColor: COLORS.DISABLED
    },
    textDisabled: {
        color: COLORS.DISABLED
    }
});
