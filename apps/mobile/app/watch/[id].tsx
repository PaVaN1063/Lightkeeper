import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { IconButton } from '../../src/components/primitives';
import { Screen } from '../../src/components/Screen';
import { Txt } from '../../src/components/Txt';
import { WatchDetail } from '../../src/components/WatchDetail';
import { isWeb } from '../../src/hooks/useLayout';
import { useApp } from '../../src/store/AppStore';

export default function WatchDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { watches } = useApp();
  const watch = watches.find((w) => w.id === id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  return (
    <Screen maxWidth={720}>
      <View style={styles.header}>
        <IconButton icon="chevron-left" label="Back" onPress={back} />
        <IconButton icon={isWeb ? 'link' : 'share-2'} label={isWeb ? 'Copy link to this watch' : 'Share this watch'} />
      </View>
      <View style={{ marginTop: 18 }}>
        {watch ? (
          <WatchDetail watch={watch} onDeleted={back} />
        ) : (
          <View style={{ gap: 12 }}>
            <Txt variant="title">Watch not found</Txt>
            <Txt color="muted">It may have been deleted.</Txt>
            <Button label="Back to watches" onPress={() => router.replace('/(tabs)')} />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
