import React from 'react';
import { StyleSheet,
         Text as ReactText } from 'react-native';

import { COLORS } from '../styles'

export class Text extends React.Component {
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
        fontWeight: '200',
        color: COLORS.PRIMARY,
        textAlign: 'center'
    }
})