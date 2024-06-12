import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
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

  listarServicios(): Observable<any> {
    const bodyContent = `<ser:ListarServicios />`;

    const soapEnvelope = this.buildSoapEnvelope(bodyContent);
    const hmac = this.generateHmac(soapEnvelope);

    const headers = this.httpOptions.headers.set('X-HMAC-Signature', hmac);

    return this.http
      .post(environment.apiUrl + '/ServiciosService.svc', soapEnvelope, {
        ...this.httpOptions,
        headers,
      })
      .pipe(
        map((response) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response as string, 'text/xml');

          const listarServiciosResult = xmlDoc.getElementsByTagName('ListarServiciosResult')[0];
          if (!listarServiciosResult) {
            throw new Error('Invalid XML response');
          }

          const dataElement = listarServiciosResult.getElementsByTagName('Data')[0];
          if (!dataElement) {
            throw new Error('Invalid XML response');
          }

          const servicios = Array.from(dataElement.getElementsByTagName('ServicioDtoString')).map((servicio: any) => {
            return {
              ServicioId: this.encryptionService.decrypt(servicio.getElementsByTagName('ServicioId')[0].textContent!),
              NombreServicio: this.encryptionService.decrypt(servicio.getElementsByTagName('NombreServicio')[0].textContent!),
            };
          });

          return servicios;
        })
      );
  }
}
