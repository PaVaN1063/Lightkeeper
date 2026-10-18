import { Redirect } from 'expo-router';
import { useApp } from '../src/store/AppStore';

export default function Index() {
  const { session } = useApp();
  return <Redirect href={session === 'signed_out' ? '/welcome' : '/(tabs)'} />;
}
