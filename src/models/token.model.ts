export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  exp: number;
  refresh_token: string;
}
