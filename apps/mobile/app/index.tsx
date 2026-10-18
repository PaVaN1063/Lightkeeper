import { Redirect } from 'expo-router';
import { useApp } from '../src/store/AppStore';

export default function Index() {
  const { session, ready } = useApp();
  if (!ready) return null; // restoring the saved session
  return <Redirect href={session === 'signed_out' ? '/welcome' : '/(tabs)'} />;
}
