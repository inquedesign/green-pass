import React    from 'react'
import firebase from 'react-native-firebase'

import { StyleSheet  } from 'react-native'
import { Text,
         Container   } from '../components'
import { STYLES,
         SCREEN_HEIGHT,
         STANDARD_SPACE,
         FONT_SIZES,
         COLORS      } from '../styles'


export default class ExploreScreen extends React.PureComponent {
    constructor( props ) {
        super( props )
        
        this.state = {
            userCount: null,
        }
    }

    componentDidMount() {
        this.userCountUnsubscribe = firebase.firestore().doc( 'Statistics/UserCount' ).onSnapshot(
            docref => {
                if ( docref.data() && docref.data().count ) {
                    this.setState({ userCount: docref.data().count })
                }
            }
        )
    }
    
    componentWillUnmount() {
        if ( this.userCountUnsubscribe ) this.userCountUnsubscribe()
    }

    render() {
        return (
            <Container>
                <Text style={ STYLES.header }>
                    Explore needs more
                </Text>

                <Text style={[ LOCAL_STYLES.text, STYLES.spaceAfter ]}>
                    When we hit 10,000 users, we will unlock this feature, which will show you nearby potenial Buds!
                </Text>

                <Text style={ LOCAL_STYLES.counter }>
                    { this.state.userCount ?
                        this.state.userCount + ' users' : ''
                    }
                </Text>
            </Container>
        )
    }
}

const LOCAL_STYLES = StyleSheet.create({
    text: {
        width: '90%',
        maxWidth: .35 * SCREEN_HEIGHT,
    },
    counter: {
        marginVertical: STANDARD_SPACE,
        fontFamily: 'HWTArtz',
        fontSize: FONT_SIZES.XLARGE,
        color: COLORS.PRIMARY
    }
})
