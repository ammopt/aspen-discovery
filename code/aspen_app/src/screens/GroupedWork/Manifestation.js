import { Center, Text, HStack, VStack, Badge, FlatList, Button, Box } from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';

// custom components and helper files
import { Record } from './Record';
import { LanguageContext, LibraryBranchContext, LibrarySystemContext, UserContext } from '../../context/initialContext';
import { LIBRARY } from '../../util/loadLibrary';
import { SafeAreaView } from 'react-native';
import { getManifestation, getVariation } from '../../util/api/item';
import { loadingSpinner } from '../../components/loadingSpinner';
import { loadError } from '../../components/loadError';
import ShowItemDetails from './CopyDetails';
import { navigateStack } from '../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../translations/TranslationService';

export const Variation = (props) => {
     const queryClient = useQueryClient();
     const navigation = useNavigation();
     const route = useRoute();
     const id = route.params.id;
     const format = props.format;
     const actions = props.data.formats[props.format];
     //const actions = formats.actions;
     const { user } = React.useContext(UserContext);
     const { library } = React.useContext(LibrarySystemContext);
     const { location } = React.useContext(LibraryBranchContext);
     const { language } = React.useContext(LanguageContext);
     const [isLoading, setLoading] = React.useState(false);

     console.log('*******************************');
     const cachedGroupedWork = queryClient.getQueryData(['groupedWork', id, library.baseUrl]);
     console.log('cachedGroupedWork ' + id);
     console.log('format ' + format);

     console.log(cachedGroupedWork);

     const { status, data, error, isFetching } = useQuery(['variation', id, format, library.baseUrl], () => getVariation(id, format, library.baseUrl));
     const relatedManifestation = useQuery(['manifestation', id, format, language, library.baseUrl], () => getManifestation(id, format, language, library.baseUrl));

     if (!_.isUndefined(data)) {
          console.log(data.variation);
     }
     return <>{isLoading || status === 'loading' || isFetching ? loadingSpinner() : status === 'error' ? loadError('Error', '') : <FlatList data={Object.keys(data.variation)} renderItem={({ item }) => <DisplayManifestation data={data.variation[item]} actions={actions} format={format} />} />}</>;
};

const DisplayManifestation = (payload) => {
     const queryClient = useQueryClient();
     const { library } = React.useContext(LibrarySystemContext);
     const { language } = React.useContext(LanguageContext);
     const route = useRoute();
     const id = route.params.id;
     const cachedGroupedWork = queryClient.getQueryData(['groupedWork', id, library.baseUrl]);
     const variation = payload.data;
     const actions = payload.actions.actions[0];
     const format = payload.format;
     const manifestationQuery = queryClient.getQueryData(['manifestation', id, format, library.baseUrl]);
     const relatedManifestation = manifestationQuery.manifestation;

     const details = {
          id: 0,
          totalCopies: 1,
          availableCopies: 1,
          shelfLocation: '',
          callNumber: '',
     };

     return (
          <Center
               mt={5}
               mb={0}
               bgColor="white"
               _dark={{ bgColor: 'coolGray.900' }}
               p={3}
               rounded="8px"
               width={{
                    base: '100%',
                    lg: '100%',
               }}>
               <HStack justifyContent="space-around" alignItems="center" space={2} flex={1}>
                    <VStack space={1} alignItems="center" maxW="40%" flex={1}>
                         <ShowItemDetails key={1} id={id} format="Book" title="title" libraryUrl={library.baseUrl} copyDetails={details} discoveryVersion="23.01.00" />
                    </VStack>
                    <Button.Group maxW="50%" alignItems="stretch">
                         <Button>{actions.title}</Button>
                    </Button.Group>
               </HStack>
               <Button
                    size="xs"
                    variant="outline"
                    onPress={() =>
                         navigateStack('BrowseTab', 'Editions', {
                              id: id,
                              format: format,
                         })
                    }>
                    {getTermFromDictionary(language, 'show_editions')}
               </Button>
          </Center>
     );
};

const Manifestation = (props) => {
     const navigation = useNavigation();
     const { user } = React.useContext(UserContext);
     const { library } = React.useContext(LibrarySystemContext);
     const { location } = React.useContext(LibraryBranchContext);

     let arrayToSearch = [];
     const { data, format, language, locations, showAlert, groupedWorkTitle, groupedWorkAuthor, groupedWorkISBN, itemDetails, groupedWorkId, linkedAccounts, openHolds, openCheckouts, updateProfile, userLanguage } = props;

     if (typeof data[format] !== 'undefined') {
          arrayToSearch = data[format];
     }

     let locationCount = 1;
     if (typeof locations !== 'undefined') {
          locationCount = locations.length;
     }

     let variation = arrayToSearch.filter(function (item) {
          return item.format === format;
     });

     variation = variation.filter(function (item) {
          return item.language === language;
     });

     let copyDetails = [];

     variation.map((item) => {
          let copyDetail = [];
          if (LIBRARY.version >= '22.09.00') {
               copyDetail = {
                    id: item.id,
                    format: item.format,
                    totalCopies: item.totalCopies,
                    availableCopies: item.availableCopies,
                    shelfLocation: item.shelfLocation,
                    callNumber: item.callNumber,
               };
          }

          copyDetails.push(copyDetail);
     });

     if (variation.length === 0) {
          return (
               <Center mt={5} mb={0} bgColor="white" _dark={{ bgColor: 'coolGray.900' }} p={3} rounded="8px">
                    <VStack
                         alignItems="center"
                         width={{
                              base: '100%',
                              lg: '75%',
                         }}>
                         <Text bold textAlign="center">
                              {getTermFromDictionary('en', 'no_matches_grouped_work')}
                         </Text>
                    </VStack>
               </Center>
          );
     }

     return variation.map((item, index) => {
          let volumes = [];
          let majorityOfItemsHaveVolumes = false;
          let hasItemsWithoutVolumes = false;
          if (LIBRARY.version >= '22.06.00') {
               volumes = item.volumes;
               majorityOfItemsHaveVolumes = item.majorityOfItemsHaveVolumes;
               hasItemsWithoutVolumes = item.hasItemsWithoutVolumes;
          }

          return (
               <SafeAreaView>
                    <Record
                         key={index}
                         available={item.available}
                         availableOnline={item.availableOnline}
                         actions={item.action}
                         edition={item.edition}
                         format={item.format}
                         publisher={item.publisher}
                         publicationDate={item.publicationDate}
                         status={item.status}
                         copiesMessage={item.copiesMessage}
                         source={item.source}
                         id={item.id}
                         title={groupedWorkTitle}
                         locationCount={locationCount}
                         locations={locations}
                         showAlert={showAlert}
                         itemDetails={itemDetails}
                         user={user}
                         groupedWorkId={groupedWorkId}
                         groupedWorkAuthor={groupedWorkAuthor}
                         groupedWorkISBN={groupedWorkISBN}
                         library={library}
                         linkedAccounts={linkedAccounts}
                         openCheckouts={openCheckouts}
                         openHolds={openHolds}
                         hasItemsWithoutVolumes={hasItemsWithoutVolumes}
                         majorityOfItemsHaveVolumes={majorityOfItemsHaveVolumes}
                         volumes={volumes}
                         discoveryVersion={LIBRARY.version}
                         updateProfile={updateProfile}
                         navigation={navigation}
                         recordData={item}
                         copyDetails={copyDetails}
                         libraryUrl={library.baseUrl}
                    />
               </SafeAreaView>
          );
     });
};

export default Manifestation;