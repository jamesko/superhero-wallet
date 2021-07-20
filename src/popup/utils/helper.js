import { isFQDN } from 'validator';
import { detect } from 'detect-browser';
import { Crypto, AmountFormatter } from '@aeternity/aepp-sdk';
import BigNumber from 'bignumber.js';
import { CONNECTION_TYPES } from './constants';

// eslint-disable-next-line no-console
export const handleUnknownError = (error) => console.warn('Unknown rejection', error);

export const aeToAettos = (v) => AmountFormatter.formatAmount(v, {
  denomination: AmountFormatter.AE_AMOUNT_FORMATS.AE,
  targetDenomination: AmountFormatter.AE_AMOUNT_FORMATS.AETTOS,
});
export const aettosToAe = (v) => AmountFormatter.formatAmount(v, {
  denomination: AmountFormatter.AE_AMOUNT_FORMATS.AETTOS,
  targetDenomination: AmountFormatter.AE_AMOUNT_FORMATS.AE,
});

export const convertToken = (balance, precision) => BigNumber(balance).shiftedBy(precision);

export const IN_FRAME = window.parent !== window;
export const IN_POPUP = !!window.opener && window.name.startsWith('popup-');

export const toURL = (url) => new URL(url.includes('://') ? url : `https://${url}`);

export const validateTipUrl = (urlAsString) => {
  try {
    const url = toURL(urlAsString);
    return ['http:', 'https:'].includes(url.protocol) && isFQDN(url.hostname);
  } catch (e) {
    return false;
  }
};

export const detectConnectionType = (port) => {
  const extensionProtocol = detect().name === 'firefox' ? 'moz-extension' : 'chrome-extension';
  const [senderUrl] = port.sender.url.split('?');
  const isExtensionSender = senderUrl.startsWith(`${extensionProtocol}://${browser.runtime.id}/popup/popup.html`)
    || detect().name === 'firefox';
  if (CONNECTION_TYPES.POPUP === port.name && isExtensionSender) {
    return port.name;
  }
  return CONNECTION_TYPES.OTHER;
};

export const fetchJson = async (...args) => {
  const response = await fetch(...args);
  return response.json();
};

export const postJson = (url, options) => fetchJson(url, {
  method: 'post',
  headers: { 'Content-Type': 'application/json' },
  ...options,
  body: options.body && JSON.stringify(options.body),
});

export const checkAddress = (value) => Crypto.isAddressValid(value, 'ak')
  || Crypto.isAddressValid(value, 'ct')
  || Crypto.isAddressValid(value, 'ok');

export const checkAddressOrChannel = (value) => checkAddress(value) || Crypto.isAddressValid(value, 'ch');

export const checkAensName = (value) => value.endsWith('.chain');

export const getAddressByNameEntry = (nameEntry, pointer = 'account_pubkey') => ((nameEntry.pointers && nameEntry.pointers.find(({ key }) => key === pointer)) || {}).id;

export const contractCall = async ({
  instance,
  method,
  params = [],
  decode = false,
  async = true,
}) => {
  let call;
  try {
    call = await instance.methods[method](...params);
  } catch (e) {
    if (e.message.indexOf('wrong_abi_version') > -1) {
      instance.setOptions({ backend: 'aevm' });
      return contractCall({
        instance, method, params, decode, async,
      });
    }
    throw e.message;
  }

  if (async) return decode ? call.decodedResult : call;
  return instance.methods[method](...params);
};

export const setContractInstance = async (tx, sdk, contractAddress = null) => {
  let contractInstance = false;
  try {
    let backend = 'fate';
    if (typeof tx.abi_version !== 'undefined' && tx.abi_version !== 3) {
      backend = 'aevm';
    }
    contractInstance = await sdk.getContractInstance(tx.source, {
      contractAddress,
      forceCodeCheck: true,
    });
    contractInstance.setOptions({ backend });
  } catch (e) {
    handleUnknownError(e);
  }
  return Promise.resolve(contractInstance);
};

export const escapeSpecialChars = (str) => str.replace(/(\r\n|\n|\r|\n\r)/gm, ' ').replace(/"/g, '');

export const checkHashType = (hash) => {
  const accountPublicKeyRegex = RegExp('^ak_[1-9A-HJ-NP-Za-km-z]{48,50}$');
  const transactionHashRegex = RegExp('^th_[1-9A-HJ-NP-Za-km-z]{48,50}$');
  const nameRegex = RegExp('^nm_[1-9A-HJ-NP-Za-km-z]{48,50}$');
  let valid = true;
  let endpoint = null;

  if (transactionHashRegex.test(hash)) {
    endpoint = 'transactions';
  } else if (accountPublicKeyRegex.test(hash)) {
    endpoint = 'account/transactions';
  } else if (nameRegex.test(hash) || hash.endsWith('.chain')) {
    endpoint = 'names';
  } else {
    valid = false;
  }

  return { valid, endpoint };
};

export const getTwitterAccountUrl = (url) => {
  const match = url.match(/https:\/\/twitter.com\/[a-zA-Z0-9_]+/g);
  return match ? match[0] : false;
};

export const isNotFoundError = (error) => error.statusCode === 404;

export const isAccountNotFoundError = (error) => isNotFoundError(error) && error?.response?.body?.reason === 'Account not found';

export const setBalanceLocalStorage = (balance) => {
  localStorage.rxjs = JSON.stringify({ ...JSON.parse(localStorage.rxjs || '{}'), balance });
};

export const getBalanceLocalStorage = () => (
  localStorage.rxjs ? JSON.parse(localStorage.rxjs).balance : {}
);

export const categorizeContractCallTxObject = (transaction) => {
  if (transaction.tx.type !== 'ContractCallTx') return null;
  switch (transaction.tx.function) {
    case 'transfer':
    case 'change_allowance':
    case 'create_allowance':
      return {
        to: transaction.tx.arguments[0].value,
        amount: transaction.tx.arguments[1].value,
        token: transaction.tx.contractId,
      };
    case 'tip_token':
      return {
        url: transaction.tx.arguments[0].value,
        note: transaction.tx.arguments[1].value,
        amount: transaction.tx.arguments[3].value,
        token: transaction.tx.arguments[2].value,
      };
    case 'retip_token':
      return {
        url: transaction.tx.arguments[0].value,
        amount: transaction.tx.arguments[2].value,
        token: transaction.tx.arguments[1].value,
      };
    default:
      return null;
  }
};
