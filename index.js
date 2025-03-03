/**
 * @format
 */

import {AppRegistry} from 'react-native';
import AppwithRedux from './store/index';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => AppwithRedux);
