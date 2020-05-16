// import * as config from '@environments';
import axios, { AxiosInstance } from 'axios';

export class NetWorkService {
	public axios: AxiosInstance;
	constructor(token: string) {
		this.axios = axios.create({
			baseURL: 'https://suggestions.dadata.ru/suggestions/api/',
			headers: {
				'Authorization': `Token ${token} `,
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		});
	}
}
