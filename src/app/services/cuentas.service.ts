import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root',
})
export class CuentasService {
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

  private generateHmac(message: string): string {
    return this.encryptionService.generateHmacMd5(message.trim());
  }

  private encryptPayload(payload: any): any {
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        payload[key] = this.encryptionService.encrypt(payload[key]);
      }
    }
    return payload;
  }

  private buildSoapEnvelope(bodyContent: string): string {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://atm.com/service/"> <soapenv:Header/> <soapenv:Body> ${bodyContent} </soapenv:Body> </soapenv:Envelope>`;
  }

  listarCuentas(): Observable<any> {
    const bodyContent = `<ser:ListarCuentas> </ser:ListarCuentas>`;

    const soapEnvelope = this.buildSoapEnvelope(bodyContent);
    const hmac = this.generateHmac(soapEnvelope);

    const headers = this.httpOptions.headers.set('X-HMAC-Signature', hmac);

    return this.http
      .post(environment.apiUrl + '/CuentasService.svc', soapEnvelope, {
        ...this.httpOptions,
        headers,
      })
      .pipe(
        map((response) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response as string, 'text/xml');

          const listarCuentasResult = xmlDoc.getElementsByTagName(
            'ListarCuentasResult'
          )[0];
          if (!listarCuentasResult) {
            throw new Error('Invalid XML response');
          }

          const dataElement =
            listarCuentasResult.getElementsByTagName('Data')[0];
          if (!dataElement) {
            throw new Error('Invalid XML response');
          }

          const cuentas = Array.from(
            dataElement.getElementsByTagName('CuentaDtoString')
          ).map((cuenta: any) => {
            return {
              CuentaId: this.encryptionService.decrypt(
                cuenta.getElementsByTagName('CuentaId')[0].textContent!
              ),
              UsuarioId: this.encryptionService.decrypt(
                cuenta.getElementsByTagName('UsuarioId')[0].textContent!
              ),
              NumeroCuenta: this.encryptionService.decrypt(
                cuenta.getElementsByTagName('NumeroCuenta')[0].textContent!
              ),
              Saldo: this.encryptionService.decrypt(
                cuenta.getElementsByTagName('Saldo')[0].textContent!
              ),
              Activa: this.encryptionService.decrypt(
                cuenta.getElementsByTagName('Activa')[0].textContent!
              ),
            };
          });

          return cuentas;
        })
      );
  }

  transferir(
    cuentaOrigenId: string,
    cuentaDestinoId: string,
    monto: string
  ): Observable<any> {
    const transferDto = this.encryptPayload({
      cuentaOrigenId,
      cuentaDestinoId,
      monto,
    });

    const bodyContent = `<ser:Transferir> <ser:cuentaOrigenId>${transferDto.cuentaOrigenId}</ser:cuentaOrigenId> <ser:cuentaDestinoId>${transferDto.cuentaDestinoId}</ser:cuentaDestinoId> <ser:monto>${transferDto.monto}</ser:monto> </ser:Transferir>`;

    const soapEnvelope = this.buildSoapEnvelope(bodyContent);
    const hmac = this.generateHmac(soapEnvelope);

    const headers = this.httpOptions.headers.set('X-HMAC-Signature', hmac);

    return this.http
      .post(environment.apiUrl + '/CuentasService.svc', soapEnvelope, {
        ...this.httpOptions,
        headers,
      })
      .pipe(
        map((response) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response as string, 'text/xml');

          const transferirResult =
            xmlDoc.getElementsByTagName('TransferirResult')[0];
          if (!transferirResult) {
            throw new Error('Invalid XML response');
          }

          const dataElement = transferirResult.getElementsByTagName('Data')[0];
          if (!dataElement) {
            throw new Error('Invalid XML response');
          }

          return dataElement.textContent === 'true';
        })
      );
  }
}
