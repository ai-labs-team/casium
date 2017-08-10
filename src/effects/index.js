import { mergeMaps } from '../util';

import http from './http';
import browser from './browser';
import cookies from './cookies';
import localStorage from './local_storage';

export default mergeMaps([http, browser, cookies, localStorage]);
