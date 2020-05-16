import * as Hemera from 'nats-hemera';

import { SharedLogic } from '@logic/shared.logic';

import { NetWorkService } from '@services/network';
import Boom from 'boom';

interface IResponseData {
	country_iso_code: string;
	region_kladr_id: string;
	region: string;
	region_iso_code: string;
	region_fias_id: string;
}

export class TemplateActions {
	constructor(
		private hemera: Hemera<Hemera.ServerRequest, Hemera.ServerResponse>,
		private joi: any,
		private sharedLogic: SharedLogic,
		private netWorkService: NetWorkService
	) {}

	public registerActions() {
		const shared = this.sharedLogic;
		const axios = this.netWorkService.axios;
		this.hemera.add(
			{
				topic: 'kladr',
				cmd: 'find-id',
				headers: this.joi.any(),
				method: this.joi.any(),
				params: this.joi.any(),
				id: this.joi.string().required(),
				postJoi$: {
					country_iso_code: this.joi.string(),
					region_kladr_id: this.joi.string(),
					region: this.joi.string(),
					region_iso_code: this.joi.string(),
					region_fias_id: this.joi.string(),
				},
			},
			async function(
				this: Hemera<Hemera.ServerRequest, Hemera.ServerResponse>,
				request: Hemera.ServerPattern
			) {
				let path = 'dadata/kladr';
				try {
					const cache = await shared.hitCache(this, request, path);
					return cache;
				} catch (error) {
					if (request.params && request.params.path) {
						path = `${path}/${request.params.path}`;
					}
					const res = await axios.post('4_1/rs/findById/address', {
						query: request.id,
					});
					if (res.data.suggestions[0] !== undefined) {
						const data = res.data.suggestions[0].data;

						const result: IResponseData = {
							country_iso_code: data.country_iso_code,
							region_kladr_id: data.region_kladr_id,
							region: data.region,
							region_iso_code: data.region_iso_code,
							region_fias_id: data.region_fias_id,
						};

						shared.saveToCache(this, request, path, result);
						return result;
					}
					throw Boom.notFound('kladr not found');
				}
			}
		);
	}
}
