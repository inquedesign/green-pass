import { SCREENS } from './util/constants'

export function initialLayout( startingScreen ) {
    return {
        stack: {
            id: SCREENS.ROOT_SCREEN,
            children: [
                { component: { name: startingScreen } }
            ]
        }
    }
}

export const MAIN_LAYOUT = {
    bottomTabs: {
        id: SCREENS.ROOT_SCREEN,
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
                            id: SCREENS.BUDS_SCREEN,
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
            }//,
            //{
            //    component: {
            //        name: SCREENS.EXPLORE_SCREEN,
            //        options: {
            //            bottomTab: {
            //                icon: require('./assets/icons/Explore.png'),
            //                text: 'EXPLORE'
            //            }
            //        }
            //    }
            //}
        ],
        options: {
            bottomTabs: {
                currentTabId: SCREENS.PROFILE_SCREEN
            }
        }
    }
}
