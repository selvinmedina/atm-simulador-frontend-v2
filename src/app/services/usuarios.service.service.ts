import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../../models/user.model';
import { Token } from '../../models/token.model';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'text/xml',
      'Accept': 'text/xml',
    }),
    responseType: 'text' as 'json', // To handle XML response as text
  };

  constructor(private http: HttpClient) {}

  login(nombreUsuario: string, pin: string): Observable<Token> {
    const xmlData = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://atm.com/service/">
      <soapenv:Header/>
      <soapenv:Body>
        <ser:Login>
          <ser:usuarioDto>
            <ser:NombreUsuario>${nombreUsuario}</ser:NombreUsuario>
            <ser:Pin>${pin}</ser:Pin>
          </ser:usuarioDto>
        </ser:Login>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

    return this.http
      .post(environment.apiUrl + '/UsuariosService.svc', xmlData, this.httpOptions)
      .pipe(
        map(response => {
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

          const tokenElement = dataElement.getElementsByTagName('access_token')[0];
          const tokenTypeElement = dataElement.getElementsByTagName('token_type')[0];
          const expiresInElement = dataElement.getElementsByTagName('expires_in')[0];
          const expElement = dataElement.getElementsByTagName('exp')[0];
          const refreshTokenElement = dataElement.getElementsByTagName('refresh_token')[0];

          if (!tokenElement || !tokenTypeElement || !expiresInElement || !expElement) {
            throw new Error('Invalid XML response');
          }

          const token = tokenElement ? tokenElement.textContent : '';
          const tokenType = tokenTypeElement ? tokenTypeElement.textContent : '';
          const expiresIn =
            expiresInElement && expiresInElement.textContent ? +expiresInElement.textContent : 0;
          const exp = expElement && expElement.textContent ? +expElement.textContent : 0;
          const refreshToken = refreshTokenElement ? refreshTokenElement.textContent : '';

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

    const xmlData = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://atm.com/service/">
      <soapenv:Header/>
      <soapenv:Body>
        <ser:GetUserData>
          <ser:token>${token}</ser:token>
        </ser:GetUserData>
      </soapenv:Body>
    </soapenv:Envelope>
    `;

    return this.http
      .post(environment.apiUrl + '/UsuariosService.svc', xmlData, this.httpOptions)
      .pipe(
        map(response => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response as string, 'text/xml');

          const getUserDataResult = xmlDoc.getElementsByTagName('GetUserDataResult')[0];
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

          const userId = userIdElement.textContent;

          return {
            UserId: userId,
          } as User;
        })
      );
  }

  register(nombreUsuario: string, pin: string): Observable<any> {
    const xmlData = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://atm.com/service/">
      <soapenv:Header/>
      <soapenv:Body>
        <ser:Registro>
          <ser:usuarioDto>
            <ser:NombreUsuario>${nombreUsuario}</ser:NombreUsuario>
            <ser:Pin>${pin}</ser:Pin>
          </ser:usuarioDto>
        </ser:Registro>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

    return this.http
      .post(environment.apiUrl + '/UsuariosService.svc', xmlData, this.httpOptions)
      .pipe(
        map(response => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response as string, 'text/xml');

          const registroResult = xmlDoc.getElementsByTagName('RegistroResult')[0];
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

          const userIdElement = dataElement.getElementsByTagName('UsuarioId')[0];
          const nombreUsuarioElement = dataElement.getElementsByTagName('NombreUsuario')[0];
          const pinElement = dataElement.getElementsByTagName('Pin')[0];

          if (!userIdElement || !nombreUsuarioElement || !pinElement) {
            throw new Error('Invalid XML response');
          }

          return {
            UsuarioId: userIdElement.textContent,
            NombreUsuario: nombreUsuarioElement.textContent,
            Pin: pinElement.textContent,
          };
        })
      );
  }
}
