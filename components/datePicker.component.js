import React from 'react';
import DP    from 'react-native-datepicker'

import { StyleSheet       } from 'react-native';
import { COLORS,
         FONT_SIZES,
         BORDER_RADIUS,
         COMPONENT_HEIGHT } from '../styles'

export default class DatePicker extends React.PureComponent {
    constructor( props ) {
        super( props )

        const currentDate = new Date()
        const maxDate = new Date()
        maxDate.setFullYear( currentDate.getFullYear() - 21 )
        const minDate = new Date()
        minDate.setFullYear( currentDate.getFullYear() - 100 )

        this.maxDate = `${maxDate.getMonth()+1}-${maxDate.getDate()+1}-${maxDate.getFullYear()}`
        this.minDate = `${minDate.getMonth()+1}-${minDate.getDate()+1}-${minDate.getFullYear()}`

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
                format='MM-DD-YYYY'
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
    dateTouchBody: {
        width          : '100%',
        height         : HEIGHT,
        borderWidth    : 1,
        borderRadius   : BORDER_RADIUS,
        borderColor    : COLORS.PRIMARY,
        backgroundColor: COLORS.BACKGROUND,
    },
    dateInput: {
        width          : '100%',
        height         : '100%',
        textAlign      : 'center',
        borderWidth: 0
    },
    placeholderText: {
        fontFamily: 'HWTArtz',
        fontSize  : FONT_SIZES.MEDIUM,
        color     : COLORS.PRIMARY
    },
    dateText: {
        fontFamily: 'HWTArtz',
        fontSize  : FONT_SIZES.MEDIUM,
        color     : COLORS.PRIMARY,
    }
})