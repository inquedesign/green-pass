import React from 'react';
import DP    from 'react-native-datepicker'

import { StyleSheet       } from 'react-native';
import { Text,
         Button           } from './'
import { COLORS,
         FONT_SIZES,
         COMPONENT_HEIGHT } from '../styles'

export default class DatePicker extends React.PureComponent {
    constructor( props ) {
        super( props )

        const currentDate = new Date()
        const maxDate = new Date()
        maxDate.setFullYear( currentDate.getFullYear() - 21 )
        const minDate = new Date()
        minDate.setFullYear( currentDate.getFullYear() - 100 )

        this.maxDate = `${maxDate.getFullYear()}-${maxDate.getMonth()+1}-${maxDate.getDate()+1}`
        this.minDate = `${minDate.getFullYear()}-${minDate.getMonth()+1}-${minDate.getDate()+1}`

        this.state = {
            dateString: ''
        }
    }

    onDateChange( dateString ) {
        this.setState({ dateString: dateString })
        if ( this.props.onDateChange ) this.props.onDateChange( dateString )
    }

    render() {
        return (
            <DP
                style={[ { width: '100%' }, this.props.style ]}
                customStyles={ DEFAULTS }
                mode='date'
                placeholder='Select year of birth'
                format='YYYY-MM-DD'
                minDate={ this.minDate }
                maxDate={ this.maxDate }
                showIcon={ false }
                cancelBtnText='Cancel'
                confirmBtnText='Done'
                date={ this.state.dateString }
                onDateChange={ this.onDateChange.bind(this) }
            />
        )
    }
}

const HEIGHT = COMPONENT_HEIGHT

const DEFAULTS = StyleSheet.create({
    // Property names are important
    dateInput: {
        width          : '100%',
        height         : HEIGHT,
        textAlign      : 'center',
        borderWidth    : 1,
        borderRadius   : .5 * HEIGHT,
        borderColor    : COLORS.PRIMARY,
        backgroundColor: COLORS.BACKGROUND,
    },
    placeholderText: {
        fontSize: FONT_SIZES.MEDIUM,
        color   : COLORS.DISABLED
    },
    dateText: {
        fontSize  : FONT_SIZES.MEDIUM,
        fontWeight: '200',
        color     : COLORS.PRIMARY,
    }
})