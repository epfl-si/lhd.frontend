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
	'disp-delete-success': {
		type: 'success',
		text: 'Dispensation has successfully been deleted',
	},
	'disp-delete-error': {
		type: 'error',
		text: 'Dispensation deletion failed',
	},
	'room-update-success': {
		type: 'success',
		text: 'Room has successfully been updated',
	},
	'room-update-error': {
		type: 'error',
		text: 'Room update failed',
	},
	'save-new-unit-error': {
		type: 'error',
		text: 'New unit has not been saved',
	},
	'no-unit-chosen': {
		type: 'error',
		text: 'No unit has been chosen',
	},
	'no-room-chosen': {
		type: 'error',
		text: 'No room has been chosen',
	},
	'unit-update-success': {
		type: 'success',
		text: 'Unit has successfully been updated',
	},
	'unit-update-error': {
		type: 'error',
		text: 'Unit update failed',
	},
	'hazardForm-update-error': {
		type: 'error',
		text: 'Hazard form update failed',
	},
	'hazardForm-update-success': {
		type: 'success',
		text: 'Hazard form has successfully been updated',
	},
	'bad_graphql_query': {
		type: 'error',
		text: 'Bad GraphQL query',
	},
};
