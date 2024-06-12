import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root',
})
export class PagosService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'text/xml',
      Accept: 'text/xml',
    }),
    responseType: 'text' as 'json', // To handle XML response as text
  };

  constructor(private http: HttpClient, private encryptionService: EncryptionService) {}

  private generateHmac(message: string): string {
    return this.encryptionService.generateHmacMd5(message.trim());
  }

  private buildSoapEnvelope(bodyContent: string): string {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://atm.com/service/"> <soapenv:Header/> <soapenv:Body> ${bodyContent} </soapenv:Body> </soapenv:Envelope>`;
  }

  realizarPago(servicioId: string, cuentaId: string, monto: string): Observable<any> {
    const payload = this.encryptPayload({
      ServicioId: servicioId,
      CuentaId: cuentaId,
      Monto: monto,
    });

    const bodyContent = `<ser:RealizarPago> <ser:pagoDto> <ser:ServicioId>${payload.ServicioId}</ser:ServicioId> <ser:CuentaId>${payload.CuentaId}</ser:CuentaId> <ser:Monto>${payload.Monto}</ser:Monto> </ser:pagoDto> </ser:RealizarPago>`;

    const soapEnvelope = this.buildSoapEnvelope(bodyContent);
    const hmac = this.generateHmac(soapEnvelope);

    const headers = this.httpOptions.headers.set('X-HMAC-Signature', hmac);

    return this.http
      .post(environment.apiUrl + '/PagosService.svc', soapEnvelope, {
        ...this.httpOptions,
        headers,
      })
      .pipe(
        map((response) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response as string, 'text/xml');

          const realizarPagoResult = xmlDoc.getElementsByTagName('RealizarPagoResult')[0];
          if (!realizarPagoResult) {
            throw new Error('Invalid XML response');
          }

          const dataElement = realizarPagoResult.getElementsByTagName('Ok')[0];
          if (!dataElement) {
            throw new Error('Invalid XML response');
          }

          return dataElement.textContent === 'true';
        })
      );
  }

  private encryptPayload(payload: any): any {
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        payload[key] = this.encryptionService.encrypt(payload[key]);
      }
    }
    return payload;
  }
}
