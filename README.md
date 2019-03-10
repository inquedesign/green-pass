#### 1) Setup
- 1.1) Install NPM packages with `npm install`
- 1.2) **[iOS]** `cd ios` and run `pod install` - if you don't have CocoaPods you can follow [these instructions](https://guides.cocoapods.org/using/getting-started.html#getting-started) to install it.
- 1.3) **[Android]** No additional steps for android.

#### 4) Start the app

- 4.1) Start the react native packager, `npm start` from the root of your project.
- 4.2) **[iOS]** Build and run the iOS app, run `npm run ios` from the root of your project. The first build will take some time. This will automatically start up a simulator also for you on a successful build if one wasn't already started.
- 4.3) **[Android]** If you haven't already got an android device attached/emulator running then you'll need to get one running (make sure the emulator is with Google Play / APIs). When ready run `npm run android` from the root of your project.