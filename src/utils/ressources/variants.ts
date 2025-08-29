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
	'chemical-deletion-error': {
		type: 'error',
		text: 'Chemical cannot be deleted because some authorization exists for it.',
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
	'no-radioprotection-chosen': {
		type: 'error',
		text: 'No radiation has been chosen',
	},
	'save-new-radioprotection-success': {
		type: 'success',
		text: 'New radiation has been saved',
	},
	'save-new-organism-error': {
		type: 'error',
		text: 'New organism has not been saved',
	},
	'save-new-organism-success': {
		type: 'success',
		text: 'New organism has been saved',
	},
	'save-new-chemical-success': {
		type: 'success',
		text: 'New chemical has been saved',
	},
	'no-organism-chosen': {
		type: 'error',
		text: 'Organism name and risk are mandatory',
	},
	'no-chemical-chosen': {
		type: 'error',
		text: 'Chemical name is mandatory',
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
	'no_data_for_export': {
		type: 'error',
		text: 'No data to export for the selected filter',
	},
	'update_error': {
		type: 'error',
		text: 'Update failed',
	},
	'update_success': {
		type: 'success',
		text: 'Update success',
	},
};
