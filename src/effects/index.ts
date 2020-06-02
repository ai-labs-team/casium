import { CommandDispatcher, SubscriptionDispatcher } from '../environment';
import { MessageConstructor } from '../message';
import { mergeMaps } from '../util';

import browser from './browser';
import cookies from './cookies';
import http from './http';
import localStorage from './local_storage';

export default (
  mergeMaps([http, browser, cookies, localStorage]) as
  Map<MessageConstructor, CommandDispatcher | SubscriptionDispatcher>
);
