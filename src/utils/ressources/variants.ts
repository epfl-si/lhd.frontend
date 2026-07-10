import { t } from 'i18next';
import {notificationType} from "./types";

export const notificationsVariants = {
	'copy-success': {
		type: 'success',
		text: t('copy.success'),
	} as notificationType,
	'copy-error': { type: 'error', text: t('copy.error') },
	'params-error': { type: 'error', text: t('params.error') },
	'disp-success': {
		type: 'success',
		text: 'Dispensation has successfully been created: ',
	} as notificationType,
	'disp-error': { type: 'error', text: 'Dispensation creation failed: ' },
	'disp-update-success': {
		type: 'success',
		text: 'Dispensation has successfully been updated',
	} as notificationType,
	'disp-update-error': {
		type: 'error',
		text: 'Dispensation update failed',
	} as notificationType,
	'chemical-deletion-error': {
		type: 'error',
		text: 'Chemical cannot be deleted because some authorization exists for it.',
	} as notificationType,
	'disp-delete-success': {
		type: 'success',
		text: 'Dispensation has successfully been deleted',
	} as notificationType,
	'disp-delete-error': {
		type: 'error',
		text: 'Dispensation deletion failed',
	} as notificationType,
	'room-update-success': {
		type: 'success',
		text: 'Room has successfully been updated',
	} as notificationType,
	'room-update-error': {
		type: 'error',
		text: 'Room update failed',
	} as notificationType,
	'save-new-unit-error': {
		type: 'error',
		text: 'New unit has not been saved',
	} as notificationType,
	'no-unit-chosen': {
		type: 'error',
		text: 'No unit has been chosen',
	} as notificationType,
	'no-tag-chosen': {
		type: 'error',
		text: 'Tag and comment are mandatory',
	} as notificationType,
	'no-radioprotection-chosen': {
		type: 'error',
		text: 'No radiation has been chosen',
	} as notificationType,
	'save-new-radioprotection-success': {
		type: 'success',
		text: 'New radiation has been saved',
	} as notificationType,
	'save-new-organism-error': {
		type: 'error',
		text: 'New organism has not been saved',
	} as notificationType,
	'save-new-organism-success': {
		type: 'success',
		text: 'New organism has been saved',
	} as notificationType,
	'save-new-chemical-success': {
		type: 'success',
		text: 'New chemical has been saved',
	} as notificationType,
	'save-new-dispensation-success': {
		type: 'success',
		text: 'New dispensation has been saved',
	} as notificationType,
	'no-dispensation-chosen': {
		type: 'error',
		text: 'Dispensation subject and requirements are mandatory. You must choose at least one room, one holder and one unit.',
	} as notificationType,
	'save-new-assessment-success': {
		type: 'success',
		text: 'New assessment has been saved',
	} as notificationType,
	'no-assessment-chosen': {
		type: 'error',
		text: 'Assessment subject and requirements are mandatory. You must choose at least one room and one unit.',
	} as notificationType,
	'no-organism-chosen': {
		type: 'error',
		text: 'Organism name and risk are mandatory',
	} as notificationType,
	'no-chemical-chosen': {
		type: 'error',
		text: 'Chemical name is mandatory',
	} as notificationType,
	'no-room-chosen': {
		type: 'error',
		text: 'No room has been chosen',
	} as notificationType,
	'unit-update-success': {
		type: 'success',
		text: 'Unit has successfully been updated',
	} as notificationType,
	'unit-delete-success': {
		type: 'success',
		text: 'Unit has successfully been deleted',
	} as notificationType,
	'unit-update-error': {
		type: 'error',
		text: 'Unit update failed',
	} as notificationType,
	'hazardForm-update-error': {
		type: 'error',
		text: 'Hazard form update failed',
	} as notificationType,
	'hazardForm-update-success': {
		type: 'success',
		text: 'Hazard form has successfully been updated',
	} as notificationType,
	'bad_graphql_query': {
		type: 'error',
		text: 'Bad GraphQL query',
	} as notificationType,
	'no_data_for_export': {
		type: 'error',
		text: 'No data to export for the selected filter',
	} as notificationType,
	'update_error': {
		type: 'error',
		text: 'Update failed',
	} as notificationType,
	'update_success': {
		type: 'success',
		text: 'Update success',
	} as notificationType,
	'ticket_format_error': {
		type: 'error',
		text: 'The ticket format is not correct (ex. \"SCCTI0123456\")',
	} as notificationType,
};
