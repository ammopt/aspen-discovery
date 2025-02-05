import React from 'react';
import { useQueryClient, useQuery, useQueries } from '@tanstack/react-query';
import { create } from 'apisauce';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { useNavigation, useNavigationState, useLinkTo, useIsFocused, StackActions } from '@react-navigation/native';
import { Center, Heading, Box, Spinner, VStack, Progress } from 'native-base';
import _ from 'lodash';
import { checkVersion } from 'react-native-check-version';
import { BrowseCategoryContext, LanguageContext, LibraryBranchContext, LibrarySystemContext, SystemMessagesContext, UserContext } from '../../context/initialContext';
import { LIBRARY, reloadBrowseCategories } from '../../util/loadLibrary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBrowseCategoryListForUser, PATRON } from '../../util/loadPatron';
import { ForceLogout } from './ForceLogout';
import { UpdateAvailable } from './UpdateAvailable';
import { getTermFromDictionary, getTranslatedTerm, getTranslatedTermsForAllLanguages, translationsLibrary } from '../../translations/TranslationService';
import { getLinkedAccounts, reloadProfile } from '../../util/api/user';
import { getLibraryInfo, getLibraryLanguages, getSystemMessages } from '../../util/api/library';
import { getLocationInfo, getSelfCheckSettings } from '../../util/api/location';
import { GLOBALS } from '../../util/globals';
import { navigateStack } from '../../helpers/RootNavigator';

const prefix = Linking.createURL('/');

Notifications.setNotificationHandler({
     handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
     }),
});

export const LoadingScreen = () => {
     const linkingUrl = Linking.useURL();
     const linkTo = useLinkTo();
     const navigation = useNavigation();
     const queryClient = useQueryClient();
     const isFocused = useIsFocused();
     //const state = useNavigationState((state) => state);
     const [progress, setProgress] = React.useState(0);
     const [isReloading, setIsReloading] = React.useState(false);
     const [hasError, setHasError] = React.useState(false);
     const [hasUpdate, setHasUpdate] = React.useState(false);
     const [incomingUrl, setIncomingUrl] = React.useState('');
     const [hasIncomingUrlChanged, setIncomingUrlChanged] = React.useState(false);

     const { user, updateUser, accounts, updateLinkedAccounts, cards, updateLibraryCards } = React.useContext(UserContext);
     const { library, updateLibrary } = React.useContext(LibrarySystemContext);
     const { location, updateLocation, updateScope, updateEnableSelfCheck, updateSelfCheckSettings } = React.useContext(LibraryBranchContext);
     const { category, updateBrowseCategories, updateBrowseCategoryList, updateMaxCategories } = React.useContext(BrowseCategoryContext);
     const { language, updateLanguage, updateLanguages, updateDictionary, dictionary } = React.useContext(LanguageContext);
     const { systemMessages, updateSystemMessages } = React.useContext(SystemMessagesContext);

     const [loadingText, setLoadingText] = React.useState('');

     React.useEffect(() => {
          const unsubscribe = navigation.addListener('focus', () => {
               // The screen is focused
               console.log('The screen is focused.');
               setIsReloading(true);
               setProgress(0);
               queryClient.queryCache.clear();
               navigation.dispatch(StackActions.popToTop());
          });

          // Return the function to unsubscribe from the event so it gets removed on unmount
          return unsubscribe;
     }, [navigation]);

     const { status: languagesQueryStatus, data: languagesQuery } = useQuery(['languages', LIBRARY.url], () => getLibraryLanguages(LIBRARY.url), {
          enabled: !!LIBRARY.url,
          onSuccess: (data) => {
               setProgress(10);
               updateLanguages(data);
          },
     });

     const { status: translationsQueryStatus, data: translationsQuery } = useQuery(['translations', LIBRARY.url], () => getTranslatedTermsForAllLanguages(languagesQuery, LIBRARY.url), {
          enabled: !!languagesQuery,
          onSuccess: (data) => {
               updateDictionary(translationsLibrary);
               setLoadingText(getTermFromDictionary(language ?? 'en', 'loading_1'));
          },
     });

     React.useEffect(() => {
          const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
               const url = response?.notification?.request?.content?.data?.url ?? prefix;
               if (url !== incomingUrl) {
                    console.log('Incoming url changed');
                    console.log('OLD > ' + incomingUrl);
                    console.log('NEW > ' + url);
                    setIncomingUrl(response?.notification?.request?.content?.data?.url ?? prefix);
                    setIncomingUrlChanged(true);
               } else {
                    setIncomingUrlChanged(false);
               }
          });

          return () => {
               responseListener.remove();
          };
     }, []);

     const { status: librarySystemQueryStatus, data: librarySystemQuery } = useQuery(['library_system', LIBRARY.url], () => getLibraryInfo(LIBRARY.url), {
          onSuccess: (data) => {
               setProgress(30);
               updateLibrary(data);
          },
     });

     const { status: userQueryStatus, data: userQuery } = useQuery(['user', LIBRARY.url, 'en'], () => reloadProfile(LIBRARY.url), {
          enabled: !!librarySystemQuery,
          onSuccess: (data) => {
               if (_.isUndefined(data) || _.isEmpty(data)) {
                    setHasError(true);
               } else {
                    setProgress(40);
                    updateUser(data);
                    updateLanguage(data.interfaceLanguage ?? 'en');
                    PATRON.language = data.interfaceLanguage ?? 'en';
                    setLoadingText(getTermFromDictionary(language ?? 'en', 'loading_2'));
               }
          },
     });
     const { status: browseCategoryQueryStatus, data: browseCategoryQuery } = useQuery(['browse_categories', LIBRARY.url], () => reloadBrowseCategories(5, LIBRARY.url), {
          enabled: !!userQuery,
          onSuccess: (data) => {
               setProgress(60);
               updateBrowseCategories(data);
               updateMaxCategories(5);
          },
     });
     const { status: browseCategoryListQueryStatus, data: browseCategoryListQuery } = useQuery(['browse_categories_list', LIBRARY.url, 'en'], () => getBrowseCategoryListForUser(LIBRARY.url), {
          enabled: !!browseCategoryQuery,
          onSuccess: (data) => {
               setProgress(70);
               updateBrowseCategoryList(data);
          },
     });

     const { status: libraryBranchQueryStatus, data: libraryBranchQuery } = useQuery(['library_location', LIBRARY.url, 'en'], () => getLocationInfo(LIBRARY.url), {
          enabled: !!browseCategoryListQuery,
          onSuccess: (data) => {
               setProgress(80);
               updateLocation(data);
          },
     });

     const { status: selfCheckQueryStatus, data: selfCheckQuery } = useQuery(['self_check_settings', LIBRARY.url, 'en'], () => getSelfCheckSettings(LIBRARY.url), {
          enabled: !!libraryBranchQuery,
          onSuccess: (data) => {
               setProgress(85);
               if (data.success) {
                    updateEnableSelfCheck(data.settings?.isEnabled ?? false);
                    updateSelfCheckSettings(data.settings);
               } else {
                    updateEnableSelfCheck(false);
               }
          },
     });

     const { status: linkedAccountQueryStatus, data: linkedAccountQuery } = useQuery(['linked_accounts', user ?? [], cards ?? [], LIBRARY.url, 'en'], () => getLinkedAccounts(user ?? [], cards ?? [], library.barcodeStyle, LIBRARY.url, 'en'), {
          enabled: !!userQuery && !!librarySystemQuery && !!selfCheckQuery,
          onSuccess: (data) => {
               setProgress(90);
               updateLinkedAccounts(data.accounts);
               updateLibraryCards(data.cards);
               setIsReloading(false);
          },
     });

     const { status: systemMessagesQueryStatus, data: systemMessagesQuery } = useQuery(['system_messages', LIBRARY.url], () => getSystemMessages(library.libraryId, location.locationId, LIBRARY.url), {
          enabled: !!userQuery && !!librarySystemQuery && !!libraryBranchQuery && !!linkedAccountQuery,
          onSuccess: (data) => {
               setProgress(100);
               updateSystemMessages(data);
               setIsReloading(false);
          },
     });

     if (hasError) {
          return <ForceLogout />;
     }

     if ((isReloading && librarySystemQueryStatus === 'loading') || userQueryStatus === 'loading' || browseCategoryQueryStatus === 'loading' || browseCategoryListQueryStatus === 'loading' || languagesQueryStatus === 'loading' || libraryBranchQueryStatus === 'loading' || translationsQueryStatus === 'loading' || linkedAccountQueryStatus === 'loading' || systemMessagesQueryStatus === 'loading') {
          return (
               <Center flex={1} px="3" w="100%">
                    <Box w="90%" maxW="400">
                         <VStack>
                              <Heading pb={5} color="primary.500" fontSize="md">
                                   {loadingText}
                              </Heading>
                              <Progress size="lg" value={progress} colorScheme="primary" />
                         </VStack>
                    </Box>
               </Center>
          );
     }

     if ((!isReloading && librarySystemQueryStatus === 'success') || userQueryStatus === 'success' || browseCategoryQueryStatus === 'success' || browseCategoryListQueryStatus === 'success' || languagesQueryStatus === 'success' || libraryBranchQueryStatus === 'success' || translationsQueryStatus === 'success' || linkedAccountQueryStatus === 'success' || systemMessagesQueryStatus === 'success') {
          if (hasIncomingUrlChanged) {
               let url = decodeURIComponent(incomingUrl).replace(/\+/g, ' ');
               url = url.replace('aspen-lida://', prefix);
               console.log('incomingUrl > ' + url);
               setIncomingUrlChanged(false);
               try {
                    console.log('Trying to open screen based on incomingUrl...');
                    Linking.openURL(url);
               } catch (e) {
                    console.log(e);
               }
          } else if (linkingUrl) {
               if (linkingUrl !== prefix && linkingUrl !== incomingUrl) {
                    setIncomingUrl(linkingUrl);
                    console.log('Updated incoming url');
                    const { hostname, path, queryParams, scheme } = Linking.parse(linkingUrl);
                    console.log('linkingUrl > ' + linkingUrl);
                    console.log(`Linked to app with hostname: ${hostname}, path: ${path}, scheme: ${scheme} and data: ${JSON.stringify(queryParams)}`);
                    try {
                         if (scheme !== 'exp') {
                              console.log('Trying to open screen based on linkingUrl...');
                              const url = linkingUrl.replace('aspen-lida://', prefix);
                              console.log('url > ' + url);
                              linkTo('/' + url);
                         } else {
                              if (path) {
                                   console.log('Trying to open screen based on linkingUrl to Expo app...');
                                   let url = '/' + path;
                                   if (!_.isEmpty(queryParams)) {
                                        const params = new URLSearchParams(queryParams);
                                        const str = params.toString();
                                        url = url + '?' + str + '&url=' + library.baseUrl;
                                   }
                                   console.log('url > ' + url);
                                   console.log('linkingUrl > ' + linkingUrl);
                                   linkTo('/' + url);
                              }
                         }
                    } catch (e) {
                         console.log(e);
                    }
               }
          }

          navigation.navigate('DrawerStack', {
               user: user,
               library: library,
               location: location,
               prevRoute: 'LoadingScreen',
          });
     }
};

async function checkStoreVersion() {
     try {
          const version = await checkVersion({
               bundleId: GLOBALS.bundleId,
               currentVersion: GLOBALS.appVersion,
          });
          if (version.needsUpdate) {
               return {
                    needsUpdate: true,
                    url: version.url,
                    latest: version.version,
               };
          }
     } catch (e) {
          console.log(e);
     }

     return {
          needsUpdate: false,
          url: null,
          latest: GLOBALS.appVersion,
     };
}

export default LoadingScreen;