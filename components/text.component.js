import React from 'react';
import { StyleSheet,
         Text as ReactText } from 'react-native';

import COLORS from '../config/colors.json'

export class Text extends React.Component {
    render() {
        return (
            <ReactText {...this.props} style={[styles.defaults, this.props.style]}> {this.props.children} </ReactText>
        )
    }
}

const styles = StyleSheet.create({
    defaults: {
        fontWeight: '200',
        color: COLORS.PRIMARY,
        textAlign: 'center'
    }
})