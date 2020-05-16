import Hapi from 'hapi';

const routes = [
	{
		config: { auth: false },
		method: 'get',
		path: '/dadata/kladr_id/{id}',
		handler: async (request: any, hapi: Hapi.ResponseToolkit) =>
			request.hemera.act({
				topic: 'kladr',
				cmd: 'find-id',
				headers: request.headers,
				method: request.method,
				params: request.params,
				id: request.params.id,
				refresh: request.query.refresh ? request.query.refresh : false,
			})
	},
];

module.exports = routes;
