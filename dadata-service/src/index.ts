import 'module-alias/register';
import 'reflect-metadata';

import HemeraJaeger from 'hemera-jaeger';
import HemeraJoi from 'hemera-joi';
import * as Nats from 'nats';
import Hemera from 'nats-hemera';

import * as config from '@environments';
import AppLogger from '@logger/app.logger';
import { SharedLogic } from '@logic/shared.logic';
import { SystemUtils } from '@utils/system.utils';

import { TemplateActions } from '@actions';
import { NetWorkService } from '@services/network';

// Setup environment config
config.init();

const nats = Nats.connect({
	url: config.getServerConfig().NATS_URL,
	user: config.getServerConfig().NATS_USER,
	pass: config.getServerConfig().NATS_PW,
});

const hemeraLogLevel: any = config.getServerConfig().HEMERA_LOG_LEVEL;
const hemera: any = new Hemera(nats, {
	logLevel: hemeraLogLevel,
	childLogger: true,
	tag: 'hemera-template',
});

async function init() {
	// Setup the logger
	const appLogger = new AppLogger();
	appLogger.setupAppLogger();

	if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
		AppLogger.logger.debug('Waiting 30 seconds for database...');
		await SystemUtils.sleep(30000);
	} else {
		AppLogger.logger.debug(
			`Registration service config: ${JSON.stringify(config.getServerConfig())}`
		);
	}
}

async function start() {
	await init();

	hemera.use(HemeraJoi);
	hemera.use(HemeraJaeger, {
		serviceName: 'dadata',
		jaeger: {
			sampler: {
				type: 'Const',
				options: true,
			},
			options: {
				tags: {
					'nodejs.version': process.versions.node,
				},
			},
			reporter: {
				host: config.getServerConfig().JAEGER_URL,
			},
		},
	});
	await hemera.ready(() => {
		const sharedLogic = new SharedLogic();
		const netWorkService = new NetWorkService(config.getServerConfig().DADATA_TOKEN);

		// Register service actions
		const templateActions = new TemplateActions(hemera, hemera.joi, sharedLogic, netWorkService);
		templateActions.registerActions();

		AppLogger.logger.debug('Dadata service listening...');
	});
}

start();
