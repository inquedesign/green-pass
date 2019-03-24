import React from 'react';
import { StyleSheet,
         Text as ReactText } from 'react-native';

import { COLORS,
         FONT_SIZES } from '../styles'

export default class Text extends React.PureComponent {
    render() {
        return (
            <ReactText { ...this.props } style={[ defaults.text, this.props.style ]}>
                { this.props.children }
            </ReactText>
        )
    }
}

const defaults = StyleSheet.create({
    text: {
        fontSize: FONT_SIZES.MEDIUM,
        fontWeight: '200',
        color: COLORS.PRIMARY,
        textAlign: 'center'
    }
})