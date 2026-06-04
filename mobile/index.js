import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// LogBox ignore warnings
import { LogBox } from 'react-native';
LogBox.ignoreLogs([
  'Warning: ...',
  'ReactNativeFiberHostComponent',
  'Require cycle:',
  'VirtualizedLists should never be nested'
]);

AppRegistry.registerComponent(appName, () => App);
