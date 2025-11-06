import { registerRootComponent } from 'expo';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import "./global.css";
import App from './App';

function Root() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <App />
    </SafeAreaProvider>
  );
}

registerRootComponent(Root);
