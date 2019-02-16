import { mergeMaps } from '@casium/core/util';

import Cookies from '@casium/cookies';
import History from '@casium/history';
import Http from '@casium/http';
import Storage from '@casium/storage';

export default mergeMaps([
  Cookies,
  History,
  Http,
  Storage
]);
