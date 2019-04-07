import { SCREENS } from './util/constants'

export const INITIAL_LAYOUT = {
    stack: {
        children: [
            { component: { name: SCREENS.START_SCREEN } }
        ]
    }
}

export const MAIN_LAYOUT = {
    bottomTabs: {
        children: [
            {
                stack: {
                    children: [{
                        component: {
                            id: SCREENS.PROFILE_SCREEN,
                            name: SCREENS.PROFILE_SCREEN
                        }
                    }],
                    options: {
                        bottomTab: {
                            icon: require('./assets/icons/Profile.png'),
                            text: 'PROFILE'
                        }
                    }
                }
            },
            {
                stack: {
                    children: [{
                        component: {
                            name: SCREENS.BUDS_SCREEN
                        }
                    }],
                    options: {
                        bottomTab: {
                            icon: require('./assets/icons/Buds.png'),
                            text: 'BUDS'
                        }
                    }
                }
            },
            {
                component: {
                    name: SCREENS.EXPLORE_SCREEN,
                    options: {
                        bottomTab: {
                            icon: require('./assets/icons/Explore.png'),
                            text: 'EXPLORE'
                        }
                    }
                }
            }
        ],
        options: {
            bottomTabs: {
                currentTabId: SCREENS.PROFILE_SCREEN
            }
        }
    }
}
