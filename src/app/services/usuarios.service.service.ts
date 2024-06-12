import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../../models/user.model';
import { Token } from '../../models/token.model';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'text/xml',
      Accept: 'text/xml',
    }),
    responseType: 'text' as 'json', // To handle XML response as text
  };

  constructor(
    private http: HttpClient,
    private encryptionService: EncryptionService
  ) {}

  private encryptPayload(payload: any): any {
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        payload[key] = this.encryptionService.encrypt(payload[key]);
      }
    }
    return payload;
  }

  private generateHmac(message: string): string {
    return this.encryptionService.generateHmacMd5(message.trim());
  }

  private buildSoapEnvelope(bodyContent: string): string {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://atm.com/service/"> <soapenv:Header/> <soapenv:Body> ${bodyContent} </soapenv:Body> </soapenv:Envelope>`;
  }

  login(nombreUsuario: string, pin: string): Observable<Token> {
    const usuarioDto = this.encryptPayload({
      NombreUsuario: nombreUsuario,
      Pin: pin,
    });

    const bodyContent = `<ser:Login> <ser:usuarioDto> <ser:NombreUsuario>${usuarioDto.NombreUsuario}</ser:NombreUsuario> <ser:Pin>${usuarioDto.Pin}</ser:Pin> </ser:usuarioDto> </ser:Login>`;

    const soapEnvelope = this.buildSoapEnvelope(bodyContent);
    const hmac = this.generateHmac(soapEnvelope);

    const headers = this.httpOptions.headers.set('X-HMAC-Signature', hmac);

    return this.http
      .post(environment.apiUrl + '/UsuariosService.svc', soapEnvelope, {
        ...this.httpOptions,
        headers,
      })
      .pipe(
        map((response) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response as string, 'text/xml');

          const loginResult = xmlDoc.getElementsByTagName('LoginResult')[0];
          if (!loginResult) {
            throw new Error('Invalid XML response');
          }

          const okElement = loginResult.getElementsByTagName('Ok')[0];

          if (okElement && okElement.textContent === 'false') {
            throw new HttpErrorResponse({ status: 422 });
          }

          const dataElement = loginResult.getElementsByTagName('Data')[0];
          if (!dataElement) {
            throw new Error('Invalid XML response');
          }

          const tokenElement =
            dataElement.getElementsByTagName('access_token')[0];
          const tokenTypeElement =
            dataElement.getElementsByTagName('token_type')[0];
          const expiresInElement =
            dataElement.getElementsByTagName('expires_in')[0];
          const expElement = dataElement.getElementsByTagName('exp')[0];
          const refreshTokenElement =
            dataElement.getElementsByTagName('refresh_token')[0];

          if (
            !tokenElement ||
            !tokenTypeElement ||
            !expiresInElement ||
            !expElement
          ) {
            throw new Error('Invalid XML response');
          }

          const token = this.encryptionService.decrypt(
            (tokenElement ? tokenElement.textContent : '')!
          );
          const tokenType = this.encryptionService.decrypt(
            (tokenTypeElement ? tokenTypeElement.textContent : '')!
          );
          const expiresIn =
            expiresInElement && expiresInElement.textContent
              ? +this.encryptionService.decrypt(expiresInElement.textContent!)
              : 0;
          const exp =
            expElement && expElement.textContent
              ? +this.encryptionService.decrypt(expElement.textContent!)
              : 0;
          const refreshToken = this.encryptionService.decrypt(
            (refreshTokenElement ? refreshTokenElement.textContent : '')!
          );

          localStorage.setItem('token', token!);

          return {
            access_token: token,
            token_type: tokenType,
            expires_in: expiresIn,
            exp,
            refresh_token: refreshToken,
          } as Token;
        })
      );
  }

  getUserData(): Observable<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found in local storage');
    }

    const bodyContent = `<ser:GetUserData> </ser:GetUserData>`;

    const soapEnvelope = this.buildSoapEnvelope(bodyContent);
    const hmac = this.generateHmac(soapEnvelope);

    const headers = this.httpOptions.headers.set('X-HMAC-Signature', hmac);

    return this.http
      .post(environment.apiUrl + '/UsuariosService.svc', soapEnvelope, {
        ...this.httpOptions,
        headers,
      })
      .pipe(
        map((response) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response as string, 'text/xml');

          const getUserDataResult =
            xmlDoc.getElementsByTagName('GetUserDataResult')[0];
          if (!getUserDataResult) {
            throw new Error('Invalid XML response');
          }

          const dataElement = getUserDataResult.getElementsByTagName('Data')[0];
          if (!dataElement) {
            throw new Error('Invalid XML response');
          }

          const userIdElement = dataElement.getElementsByTagName('UserId')[0];
          if (!userIdElement) {
            throw new Error('Invalid XML response');
          }

          const userId = this.encryptionService.decrypt(
            userIdElement.textContent!
          );

          return {
            UserId: userId,
          } as User;
        })
      );
  }

  register(nombreUsuario: string, pin: string): Observable<any> {
    const usuarioDto = this.encryptPayload({
      NombreUsuario: nombreUsuario,
      Pin: pin,
    });

    const bodyContent = `<ser:Registro> <ser:usuarioDto> <ser:NombreUsuario>${usuarioDto.NombreUsuario}</ser:NombreUsuario> <ser:Pin>${usuarioDto.Pin}</ser:Pin> </ser:usuarioDto> </ser:Registro>`;

    const soapEnvelope = this.buildSoapEnvelope(bodyContent);
    const hmac = this.generateHmac(soapEnvelope);

    const headers = this.httpOptions.headers.set('X-HMAC-Signature', hmac);

    return this.http
      .post(environment.apiUrl + '/UsuariosService.svc', soapEnvelope, {
        ...this.httpOptions,
        headers,
      })
      .pipe(
        map((response) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response as string, 'text/xml');

          const registroResult =
            xmlDoc.getElementsByTagName('RegistroResult')[0];
          if (!registroResult) {
            throw new Error('Invalid XML response');
          }

          const okElement = registroResult.getElementsByTagName('Ok')[0];
          if (okElement && okElement.textContent === 'false') {
            throw new HttpErrorResponse({ status: 422 });
          }

          const dataElement = registroResult.getElementsByTagName('Data')[0];
          if (!dataElement) {
            throw new Error('Invalid XML response');
          }

          const userIdElement =
            dataElement.getElementsByTagName('UsuarioId')[0];
          const nombreUsuarioElement =
            dataElement.getElementsByTagName('NombreUsuario')[0];
          const pinElement = dataElement.getElementsByTagName('Pin')[0];

          if (!userIdElement || !nombreUsuarioElement || !pinElement) {
            throw new Error('Invalid XML response');
          }

          return {
            UsuarioId: this.encryptionService.decrypt(
              userIdElement.textContent!
            ),
            NombreUsuario: this.encryptionService.decrypt(
              nombreUsuarioElement.textContent!
            ),
            Pin: this.encryptionService.decrypt(pinElement.textContent!),
          };
        })
      );
  }

  cambiarPin(nuevoPin: string): Observable<any> {
    const payload = this.encryptPayload({
      nuevoPin: nuevoPin,
    });

    const bodyContent = `<ser:CambiarPin> <ser:nuevoPin>${payload.nuevoPin}</ser:nuevoPin> </ser:CambiarPin>`;

    const soapEnvelope = this.buildSoapEnvelope(bodyContent);
    const hmac = this.generateHmac(soapEnvelope);

    const headers = this.httpOptions.headers.set('X-HMAC-Signature', hmac);

    return this.http
      .post(environment.apiUrl + '/UsuariosService.svc', soapEnvelope, {
        ...this.httpOptions,
        headers,
      })
      .pipe(
        map((response) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response as string, 'text/xml');

          const cambiarPinResult =
            xmlDoc.getElementsByTagName('CambiarPinResult')[0];
          if (!cambiarPinResult) {
            throw new Error('Invalid XML response');
          }

          const dataElement = cambiarPinResult.getElementsByTagName('Data')[0];
          if (!dataElement) {
            throw new Error('Invalid XML response');
          }

          return dataElement.textContent === 'true';
        })
      );
  }

}
