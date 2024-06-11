import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private key = 'fgjiofjg44....8909ufgjfd'; // 24-character key

  encrypt(plainText: string): string {
    const keyUtf8 = CryptoJS.enc.Utf8.parse(this.key);
    const encrypted = CryptoJS.TripleDES.encrypt(plainText, keyUtf8, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  }

  decrypt(cipherText: string): string {
    const keyUtf8 = CryptoJS.enc.Utf8.parse(this.key);
    const decrypted = CryptoJS.TripleDES.decrypt(cipherText, keyUtf8, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  generateHmacMd5(message: string): string {
    const hmac = CryptoJS.HmacMD5(message, this.key);
    return hmac.toString(CryptoJS.enc.Hex);
  }
}
