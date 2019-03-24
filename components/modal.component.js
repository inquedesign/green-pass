import React       from 'react'

import { Modal as ReactModal } from 'react-native'
import { Container           } from './'

export default class Modal extends React.PureComponent {
    render() {
        return (
            <ReactModal
                visible={ this.props.visible }
                supportedOrientations={[ 'portrait' ]}
                onRequestClose={()=>{}}
                transparent={ false }
                animationType='fade'
                presentationStyle='fullScreen'>

                <Container>
                    { this.props.children }
                </Container>
            </ReactModal>
        )
    }
}
