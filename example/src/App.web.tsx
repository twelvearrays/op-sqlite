import {Text, View} from 'react-native';
import {useEffect} from 'react';
import {testDbInit} from './web/db';

export default function App() {
  useEffect(() => {
    testDbInit();
  });

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Index js Loaded blah!</Text>
    </View>
  );
}
