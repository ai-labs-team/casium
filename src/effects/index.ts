import { mergeMaps } from '../util';

import batch from './batch';
import browser from './browser';
import cookies from './cookies';
import http from './http';
import localStorage from './local_storage';

import routing from '../routing/effects';

export default mergeMaps([http, batch, browser, cookies, localStorage, routing]);
