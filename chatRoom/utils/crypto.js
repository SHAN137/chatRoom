import { getRandomBytes } from "expo-random";
import { secretbox, randomBytes, box, setPRNG } from "tweetnacl";
import { decode as decodeUTF8, encode as encodeUTF8 } from '@stablelib/utf8'
import { decode as decodeBase64, encode as encodeBase64 } from '@stablelib/base64'

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native'

setPRNG(function(x,n){
  let randomBytesArr = getRandomBytes(n);
  for(let i = 0; i < n; i++) {
    x[i] = randomBytesArr[i]
  }
})

export const PRIVATE_KEY = "PRIVATE_KEY"

const newNonce = () => randomBytes(box.nonceLength);
// const newNonce = () => getRandomBytes(box.nonceLength);
export const generateKeyPair = () => box.keyPair();

export const encrypt = (
  secretOrSharedKey,
  json,
  key?,
) => {
  const nonce = newNonce();
  const messageUint8 = encodeUTF8(JSON.stringify(json));
  const encrypted = key
    ? box(messageUint8, nonce, key, secretOrSharedKey)
    : box.after(messageUint8, nonce, secretOrSharedKey);

  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);

  const base64FullMessage = encodeBase64(fullMessage);
  return base64FullMessage;
};

export const decrypt = (
  secretOrSharedKey,
  messageWithNonce,
  key?,
) => {
  const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
  const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength);
  const message = messageWithNonceAsUint8Array.slice(
    box.nonceLength,
    messageWithNonce.length
  );

  const decrypted = key
    ? box.open(message, nonce, key, secretOrSharedKey)
    : box.open.after(message, nonce, secretOrSharedKey);

  if (!decrypted) {
    throw new Error('Could not decrypt message');
  }

  const base64DecryptedMessage = decodeUTF8(decrypted);
  return JSON.parse(base64DecryptedMessage);
};

export const stringToUint8Array = (content) => Uint8Array.from(
  content.split(',').map(item => parseInt(item))
)


export const getAuthPrivateKey = async() => {
  const authPrivateKeyString = await AsyncStorage.getItem(PRIVATE_KEY)
  if(!authPrivateKeyString) {
   
    return null;
  }
  return stringToUint8Array(authPrivateKeyString)
}