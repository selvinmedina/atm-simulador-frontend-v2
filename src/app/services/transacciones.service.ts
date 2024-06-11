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
export class TransaccionesService {
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

  private buildSoapEnvelope(bodyContent: string): string {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://atm.com/service/"> <soapenv:Header/> <soapenv:Body> ${bodyContent} </soapenv:Body> </soapenv:Envelope>`;
  }

  listarTransacciones(): Observable<any> {
    const bodyContent = `<ser:ListarTransacciones> </ser:ListarTransacciones>`;

    const soapEnvelope = this.buildSoapEnvelope(bodyContent);
    const hmac = this.generateHmac(soapEnvelope);

    const headers = this.httpOptions.headers.set('X-HMAC-Signature', hmac);

    return this.http
      .post(environment.apiUrl + '/TransaccionesService.svc', soapEnvelope, {
        ...this.httpOptions,
        headers,
      })
      .pipe(
        map((response) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response as string, 'text/xml');

          const listarTransaccionesResult =
            xmlDoc.getElementsByTagName('ListarTransaccionesResult')[0];
          if (!listarTransaccionesResult) {
            throw new Error('Invalid XML response');
          }

          const dataElement =
            listarTransaccionesResult.getElementsByTagName('Data')[0];
          if (!dataElement) {
            throw new Error('Invalid XML response');
          }

          const transacciones = Array.from(
            dataElement.getElementsByTagName('TransaccionDtoString')
          ).map((transaccion: any) => {
            return {
              TransaccionId: this.encryptionService.decrypt(
                transaccion.getElementsByTagName('TransaccionId')[0]
                  .textContent!
              ),
              CuentaId: this.encryptionService.decrypt(
                transaccion.getElementsByTagName('CuentaId')[0].textContent!
              ),
              TipoTransaccion: this.encryptionService.decrypt(
                transaccion.getElementsByTagName('TipoTransaccion')[0]
                  .textContent!
              ),
              Monto: this.encryptionService.decrypt(
                transaccion.getElementsByTagName('Monto')[0].textContent!
              ),
              FechaTransaccion: this.encryptionService.decrypt(
                transaccion.getElementsByTagName('FechaTransaccion')[0]
                  .textContent!
              ),
              Estado: this.encryptionService.decrypt(
                transaccion.getElementsByTagName('Estado')[0].textContent!
              ),
            };
          });

          return transacciones;
        })
      );
  }
}
