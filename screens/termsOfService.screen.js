import React from 'react'

import { Navigation  } from 'react-native-navigation'
import { Text,
         Button,
         Container  } from '../components'
import { STYLES      } from '../styles'
import { SCREENS     } from '../util/constants'

import SplashScreen from 'react-native-splash-screen'


export default class TermsOfServiceScreen extends React.PureComponent {

    componentDidMount() {
        SplashScreen.hide()
    }

    goToCreateAccount() {
        Navigation.push(this.props.componentId, {
            component: { name: SCREENS.ACCOUNT_CREATION_SCREEN }
        })
    }

    goToStart() {
        Navigation.pop(this.props.componentId)
    }

    render() {
        return (
            <Container>
                <Text style={ STYLES.header }>
                    Terms of Service
                </Text>
                <Text style={ STYLES.spaceAfter }>
            {`This privacy policy discloses the privacy practices for the Greenpass app (“Greenpass”, “us”, “we”) with regards to collecting information from our users (“you”). This privacy policy applies solely to information collected by this app (“the app”, “the Service”). It will notify you of the following:

What personally identifiable information is collected from you through the app, how it is used and with whom it may be shared.

What choices are available to you regarding the use of your data.

The security procedures in place to protect the misuse of your information.

How you can correct any inaccuracies in the information.

Information Collection, Use, and Sharing.

In General, we may collect information that can identify you, including your name and email, as well as information regarding your interests. If you choose to log in using your Facebook account, we may collect information tied to that account to populate app data. We may also request information about your location via GPS. By using the Service, you are authorizing us to gather, parse and retain data related to the provision of the Service.

We are the sole owners of the information collected on this site. We only have access to/collect information that you voluntarily give us via entry into the app or other direct contacts from you. We will not sell or rent this information to anyone.

We collect information in a variety of ways to facilitate our services. This can include direct entry via forms, download through other websites that you connect us to (such as when logging in via Facebook), tracking codes such as cookies and pixel tags that save or track information about app usage, and automatically sent information such as IP address and device IDs.

We will use your information to respond to you, regarding the reason you contacted us. We will not share your information with any third party outside of our organization, other than as necessary to fulfill your request, e.g. to ship an order, or when requested to do so. We may share aggregated data based on information we collect with third parties at our discretion, but this information will not be specific to individual users and will not be personally identifying. Some of the information we collect, such as your name and profile information, may be publically displayed on the app as part of the app’s functions. This is to facilitate interactions and connections between users. The app will indicate when it is collecting information that is publically visible.

We may disclose personal information as required by law in response to subpoenas, court orders, and other investigative demands. We may also do so if we feel it is appropriate to assist in investigating or preventing illegal or harmful activities. We may also transfer your information in the event of a sale of the business, merger, or similar substantial corporate transaction.

Unless you ask us not to, we may contact you via email in the future to tell you about specials, new products or services, or changes to this privacy policy.

We do not knowingly collect, maintain, or use personal information from anyone under the age of 18.

If you are visiting our Service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located and our central database is operated. By using our services, you understand and agree that your information may be transferred to our facilities and those third parties with whom we share it as described in this privacy policy.

Your Access to and Control Over Information.

You may opt out of any future contacts from us at any time. You can do the following at any time by contacting us via the email address or phone number is given on our website:

See what data we have about you if any.

Change/correct any data we have about you.

Have us delete any data we have about you.

Express any concern you have about our use of your data.

You can also access and edit your profile information directly through the app using the view profile and edit profile functions.

You may freely choose not to provide us with certain information, but doing so may prevent you from using the app or certain features of it.

Security

We take precautions to protect your information. When you submit sensitive information via the website, your information is protected both online and offline.

Wherever we collect sensitive information (such as credit card data), that information is encrypted and transmitted to us in a secure way. You can verify this by looking for a closed lock icon at the bottom of your web browser, or looking for “https” at the beginning of the address of the web page.

While we use encryption to protect sensitive information transmitted online, we also protect your information offline. Only employees who need the information to perform a specific job (for example, billing or customer service) are granted access to personally identifiable information. The computers/servers in which we store personally identifiable information are kept in a secure environment.

However, no system can be completely secure. While we work to keep your information secure, we cannot ensure that information entered into the app will remain secure from sophisticated hacking.

Note that some pages on the app may include links to other websites which do not operate under this privacy policy.

DETAILED PRIVACY POLICY

By accessing the Greenpass mobile application (e.g., Greenpass iOS, Greenpass iOS Xtra, Greenpass Android) (“Greenpass App”) (collectively, the “Greenpass Service”), which are provided by Alopex Media, LLC, you expressly consent to the collection, use and disclosure of your Personal Data (as defined below) in accordance with this privacy policy (“Privacy Policy”). We have prepared this Privacy Policy to describe to you our practices regarding the Personal Data we collect from users of the Greenpass Service.

A Note About Minors. The Greenpass Service is intended for users 21 years and older only. We do not intentionally gather Personal Data about visitors who are under the age of 18.

A Note To Users Outside Of The United States. Your Personal Data may be processed in the country in which it was collected and in other countries, including the United States, where laws regarding processing of Personal Data may be less stringent than the laws in your country.

Types Of Data We Collect. “Personal Data” means data that allows someone to identify or contact you, including, for example, your name, address, telephone number, e-mail address, geo-location data, device identifier as well as any other non-public information about you that is associated with or linked to any of the foregoing data. “Anonymous Data” means data that is not associated with or linked to your Personal Data; Anonymous Data does not, by itself, permit the identification of individual persons. We collect Personal Data and Anonymous Data as described below.

Data You Provide to Us.

Profile. We may collect Personal Data from you, such as your photo, display name, status, relationship, looking for, ethnicity, age or date of birth, geo-location data, email address, password for the Greenpass Services, and and any other information you voluntarily add to your profile on the Greenpass App or is generated by your use of the Greenpass Service (“Profile Information”).

Account Information. We may require you to provide an email address and password to use all features of the Greenpass Services (“Account Information”). You may change the email address and password associated with the account according to the methods provided by the Greenpass Services.

Instant Message. When you send an instant message (which may include photos, location, audio or video) to other users of the Greenpass Service, we will retain the messages (“Instant Messages”) as required by the operation of the Greenpass Service.

Feedback/Support. If you provide us feedback or contact us via e-mail (e.g., for support), we will collect your name and e-mail address, as well as any other content included in the e-mail, in order to send you a reply. If you contact us for support, we may also collect and retain certain technical diagnostic data, e.g., your phone model.

Mailing List. If you provide us your email address for inclusion in our mailing lists, we will collect your email address. We may email you Greenpass news, Greenpass Services updates, the latest information on products and services, and third party offers that apply to you. You may opt out of such third party emails at the time of registration, or you will have the opportunity to “opt-out” by following the unsubscribe instructions provided in the e-mail you receive. You may not opt out of emails related to the operation of the Greenpass Services as this may be necessary for the normal operation of the Greenpass Services such as password recovery.

Surveys. When you participate in one of our surveys (which may be provided by a third party service provider), we may collect additional information that you provide through the survey. If the survey is provided by our third party service provider, such service provider’s privacy policy applies to their collection, use and disclosure of your information. Please review their privacy policy which will be posted in connection with the survey.

Purchases.

If you purchase a subscription service from us, we (or our third party service provider) will collect all information necessary to complete the transaction, including your name, credit card information, billing information, address, telephone number, and email address. If we use a third party service provider, the service provider may provide certain information back to us (e.g., your name, phone number, partial credit card number, and email address). Greenpass does not receive or process credit card information directly.

Invite a Friend. If you use the Buds feature on the Greenpass Service, we will pre-populate your email with our invite information, but we do not store your contacts or any Personal Data from you or your friend.

Partner Promotion. We may collect information you voluntarily provide when you enter into a Partner Promotion, as described below.

Other. We may also collect Personal Data at other points in the Greenpass Service that state that Personal Data is being collected. Greenpass will retain Profile Information and Instant Messages in the Greenpass App or on the servers for the Greenpass Service, for as long as needed to provide the Greenpass Service and to comply with our legal obligations, resolve disputes and enforce our agreements.

Data Collected via Technology.

Device Information. We will collect an ID that is unique to the mobile device on which you install the Greenpass App (“Device ID” and “Device”, respectively). For example, if you installed the Greenpass App on an Apple Device, we store your identifierForVendor. On an Android Device, this Device ID could include the IMEI, MEID, or ESN. We may create a hashed version of your Device ID and use your hashed Device ID to log you into the Greenpass Service. We may store your Device ID and/or your hashed Device ID with other information we collect about you, including your Profile Information and your instant message information. We will collect certain software and hardware information about your Device.

Distance Information. When you use the Greenpass App, we will collect your location to determine your distance from other users (“Distance Information”) through the GPS, Wi-Fi, and/or cellular technology in your Device (e.g., iPhone, iPad, iPod Touch or Android device). Your last known location is stored on our servers for the purpose of calculating Distance Information between you and other users.

Log Files. To make the Greenpass Service more useful to you, our servers (which may be hosted by a third party service provider) or analytic partners may collect information from you, including your browser type, operating system, Internet Protocol (IP) address (a number that is automatically assigned to your computer when you use the Internet, which may vary from session to session), domain name, and/or a date/time stamp for your visit. We also use cookies and URL information to gather information regarding the date and time of your visit and the information for which you searched and which you viewed. “Cookies” are small pieces of information that a website sends to your computer’s hard drive while you are viewing a web site. We may use both session Cookies (which expire once you close your web browser) and persistent Cookies (which stay on your computer until you delete them) to provide you with a more personal and interactive experience on the Greenpass Service. Persistent Cookies we place may be removed by following instructions provided by your operating platform. If you choose to disable Cookies, some areas or features of the Greenpass Service may not work properly.

Third Parties. Our advertisers and partners may also use their own cookies or other tracking technology which may collect information about you within the Greenpass Services. We do not control use of these tracking technologies used by advertisers and partners and expressly disclaim responsibility for information collected through them.

When you use or connect to a Greenpass Site or download the Greenpass App by or through a Third Party Platform (including Facebook) you allow us to access and/or collect certain information from your Third Party Platform profile/account. You additionally allow us to access information contained in cookies placed on your device by the Third Party Platform as permitted by the terms of your agreement and privacy settings with the Third Party Platform. We may share this information with the Third Party Platform for their use as permitted by the terms of your agreement and privacy settings with the Third Party Platform.

We will share some of the information we collect from you with vendors and other service providers who work with us to support the internal operations of our website and/or mobile application. For example, we use a third-party service for ad tracking and to help us prepare website and mobile application analytics.

Our third-party ad tracking and analytics company never sends emails, notifications, or other communications to our end users. Certain third-party ad tracking and analytics allows you to opt out third-party tracking and analytics. If you would like to opt out of these third-party ad tracking and analytics, please visit here. Your choice to opt out of ad tracking and analytics services does not limit our ability to email you or collect other information from you for other vendors, subject to the terms of this Privacy Policy.

Use of Your Data

General Use of Your Data. We use your Personal Data in the following ways and as described elsewhere in this Privacy Policy: (a) to identify you as a user on the Greenpass Service; (b) to improve the Greenpass Service; (c) to provide the services you request, including the Greenpass Service; (d) to respond to your inquiries related to support, employment opportunities or other requests; (e) to send you Promotional Emails (defined below) if you opted in to receiving them at the time of registration for the Greenpass Services or otherwise subsequently agreed to be included on our mailing lists; (f) to fulfill a product or service purchase; and (g) to conduct a Partner Promotion that you voluntarily entered into as described below.

Creation of Anonymous Data. We may create Anonymous Data records from Personal Data by excluding information (such as your name) that make the data personally identifiable to you. We use this Anonymous Data to analyze request and usage patterns so that we may enhance the Greenpass Service. Greenpass reserves the right to use Anonymous data for any purpose and disclose Anonymous Data to third parties in its sole discretion.

Disclosure Of Your Personal Data. We disclose Personal Data and Anonymous Data, as described below (and elsewhere in this Privacy Policy).

IMPORTANT NOTE ABOUT PROFILE INFORMATION. YOU UNDERSTAND THAT WHEN YOU USE THE GREENPASS APP, AS A DEFAULT, YOUR PROFILE INFORMATION (DEFINED ABOVE) IS PUBLIC AND OTHER USERS OF THE GREENPASS APP CAN SEE YOUR PROFILE INFORMATION. DO NOT INCLUDE INFORMATION IN YOUR PROFILE THAT YOU WANT TO KEEP PRIVATE. Greenpass App users can use the search feature in the Greenpass App to search for other users by different profile criteria, like age. Your Profile Information will be used for these searches. The Greenpass App user interface may include a feature to make certain items of Profile Information non-public, in which case we will respect your selection. However, even if you choose to make non-public certain items of your Profile Information if and as permitted by the user interface, sophisticated users who use the Greenpass App in an unauthorized manner may nevertheless be able to obtain this information. The Greenpass App may include a feature that allows you to designate certain users as “Favorites” or “Blocked”. Generally, this designation is only viewable by you; however, sophisticated users who use the Greenpass App in an unauthorized manner may be able to determine which users you have designated as Favorites or Blocked. YOU HEREBY CONSENT TO THE DISCLOSURE OF YOUR PROFILE INFORMATION AS DESCRIBED ABOVE.

IMPORTANT NOTE ABOUT DISTANCE INFORMATION. YOU UNDERSTAND THAT WHEN YOU USE THE GREENPASS APP, AS A DEFAULT, YOUR DISTANCE INFORMATION IS PUBLIC AND OTHER USERS OF THE GREENPASS APP CAN SEE YOUR DISTANCE INFORMATION WITHIN YOUR PROFILE. Greenpass App users can use the search feature in the Greenpass App to search for other users by distance. Your Distance Information will be used for these searches. Your Distance Information is public, but the Greenpass App may include a feature to hide or change the accuracy of your Distance Information, in which case we will respect your selection. However, even if you choose to hide the display of your Distance Information, sophisticated users who use the Greenpass App in an unauthorized manner may nevertheless be able to determine your location. YOU HEREBY CONSENT TO THE DISCLOSURE OF YOUR DISTANCE INFORMATION AS DESCRIBED ABOVE.

Third Parties. We may share your hashed Device ID, Profile Information, Distance Information and demographic information with our advertising and analytics partners. These third parties may also collect information directly from you as described in Section 3.2(d). Their privacy policy applies to their collection, use and disclosure of your information that we provide them and that they collect directly. Without limiting the foregoing, one of our many partners is Google Analytics and Flurry Analytics. Google Analytics and Flurry Analytics collect information anonymously and report website trends without identifying individual visitors. Google Analytics uses its own cookie to track visitor interactions. Website owners can view a variety of reports about how visitors interact with their website so they can improve their website and how people find it. Google’s privacy policy applies to their collection, use and disclosure of your information and you may review it at:http://www.google.com/policies/technologies/ads/, and http://www.google.com/policies/privacy/. Flurry Analytics privacy policy applies to their collection, use and disclosure of your information and their privacy policy is avaiable at http://www.flurry.com/privacy-policy.html. In addition, we may work with several mobile advertising partners, which may include but is not limited to the following (along with a link to their current privacy policy): MoPub (http://www.mopub.com/legal/mopub-ads-privacy-policy), Millennial Media (http://www.millennialmedia.com/privacy-policy/), and JumpTap (http://www.jumptap.com/advertisers/privacy-friendly/).

Third Party Service Providers. We may share your Personal Data with third party service providers to: provide you with the Greenpass Services; to conduct quality assurance testing; to provide technical support; and/or to provide other services to Greenpass. Except as otherwise stated in this Privacy Policy, these third party service providers are required by contract not to use your Personal Data other than to provide the services requested by Greenpass.

Partner Promotion. We may disclose information you voluntarily provide when you enter into a Partner Promotion, as described below.

Affiliates and Acquisitions. We may share some or all of your Personal Data with our parent company, any subsidiaries, joint ventures, or other companies under a common control (collectively, “Affiliates”) in which case we will require our Affiliates to honor this Privacy Policy. If another company acquires our company, business, or our assets, that company will possess the Personal Data collected by us and will assume the rights and obligations regarding your Personal Data as described in this Privacy Policy.

Other Disclosures. Regardless of any choices you make regarding your Personal Data (as described below), Greenpass may disclose Personal Data in response to subpoenas, warrants, or court orders, or in connection with any legal process, or to comply with relevant laws; to establish or exercise our rights to defend against legal claims; if we believe it is necessary to investigate, prevent, or take action regarding illegal activities, suspected fraud, safety of person or property, violation of our policies, or as otherwise required by law.

Partner Promotions. We may offer contests, sweepstakes, or other promotions with our third party partners from time to time (“Partner Promotion”). If additional or different privacy practices govern a Partner Promotion, then we will present you the additional or different terms prior to your entering the Partner Promotion, and such terms will apply to how we collect, use and disclose the information you provide through the Partner Promotion.

Third Party Websites. When you click on a link to any other website or location, you will leave the Greenpass Site and go to another site and another entity may collect Personal Data or Anonymous Data from you. We have no control over, do not review, and cannot be responsible for, these outside websites or their content. Please be aware that the terms of this Privacy Policy do not apply to these outside websites or content, or to any collection of data after you click on links to such outside websites. Not all third-websites allow you to opt out of their tracking and analytics.

Your Choices Regarding Your Personal Data; Changing Your Personal Data

Our Promotional Emails. We may periodically send you free newsletters, surveys, offers, and other promotional materials related to Greenpass and/or the Greenpass Service (“Promotional Emails”) if you opted in during registration for the Greenpass Service or you otherwise voluntarily provided us your email address to be included on our mailing lists. Additionally, we may send you targeted offers from third parties (“Third Party Emails”), if you opted into such emails during registration for the Greenpass Services or subsequently authorized the delivery of Third Party Emails. When you receive Promotional Emails from us, you may indicate a preference to stop receiving further Promotional Emails from us and you will have the opportunity to “opt-out” by following the unsubscribe instructions provided in the e-mail you receive. Despite your indicated e-mail preferences, we may send you service related communication, including notices of any updates to our Terms of Service or Privacy Policy. Our applications may also deliver notifications to your mobile device. You can disable these notifications in your device’s settings or by deleting the relevant application

Apple. If you are using the Greenpass App on an Apple iOS device, Apple Inc.’s iAd network states that users may opt out of behavioral targeting by visiting http://oo.apple.com from your iOS device.

Changes to your Personal Data. You may change certain fields of your Profile Information by editing your profile in the Greenpass App. You may request deletion of your Personal Data by us, but please note that we may be legally required to keep this information and not delete it (or to keep this information for a certain time, in which case we will comply with your deletion request only after we have fulfilled such requirements). When we delete any information, it will be deleted from the active database, but may remain in our archives. We may keep your Personal Data, Distance Information, Device ID, hashed Device ID, and your usage history (which includes a history of text or photos that have been censored, bans, as well as a history of profile photos uploaded) for administrative purposes.

Security Of Your Personal Data. Greenpass is committed to protecting the security of your Personal Data from unauthorized access, use, or disclosure. We use a variety of industry-standard security technologies and procedures to help protect your Personal Data from unauthorized access, use, or disclosure. No method of transmission over the Internet, or method of electronic storage, is entirely secure, however. Therefore, while Greenpass uses reasonable efforts to protect your Personal Data from unauthorized access, use, or disclosure, Greenpass cannot guarantee its absolute security.

Contact Information. Greenpass welcomes your comments or questions regarding this Privacy Policy.

Changes To This Privacy Policy. This Privacy Policy is subject to occasional revision, and if we make any material changes in the way we use your Personal Data, we will notify you by sending you an e-mail to the last e-mail address you provided to us (if any) and/or by prominently posting notice of the changes on the Greenpass Service. Any changes to this Privacy Policy will be effective upon the earlier of thirty (30) calendar days following our dispatch of an e-mail notice to you or thirty (30) calendar days following our posting of notice of the changes on the Greenpass Service. These changes will be effective immediately for new users of the Greenpass Service. If the last e-mail address that you provided us is not valid, or for any reason is not capable of delivering to you the notice described above, our dispatch of the e-mail containing such notice will nonetheless constitute effective notice of the changes described in the notice. In any event, changes to this Privacy Policy may affect our use of Personal Data that you provided us prior to our notification to you of the changes. If you do not wish to permit changes in our use of your Personal Data, you must notify us prior to the effective date of the changes that you wish to cease using the Greenpass Service. Continued use of the Greenpass Service, following notice of such changes shall indicate your acknowledgement of such changes and agreement to be bound by the terms and conditions of such changes.

No Rights of Third Parties. This Privacy Policy does not create rights enforceable by third parties or require disclosure of any personal information relating to users of the website.`}
                </Text>
                <Button style={ STYLES.spaceAfter }
                    label="Accept"
                    accessibilityLabel="Accept the terms of serice"
                    onPress={ this.goToCreateAccount.bind(this) } />
                <Button
                    label="Decline"
                    accessibilityLabel="Decline the terms of service"
                    onPress={ this.goToStart.bind(this) } />
            </Container>
        )
    }
}
