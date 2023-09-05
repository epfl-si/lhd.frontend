import { t } from 'i18next';

export const notificationsVariants = {
	'copy-success': {
		type: 'success',
		text: t('copy.success'),
	},
	'copy-error': { type: 'error', text: t('copy.error') },
	'params-error': { type: 'error', text: t('params.error') },
	'disp-success': {
		type: 'success',
		text: 'Dispensation has successfully been created: ',
	},
	'disp-error': { type: 'error', text: 'Dispensation creation failed: ' },
	'disp-update-success': {
		type: 'success',
		text: 'Dispensation has successfully been updated',
	},
	'disp-update-error': {
		type: 'error',
		text: 'Dispensation update failed',
	},
};
