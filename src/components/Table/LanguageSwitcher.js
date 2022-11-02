import { Box, Switch } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
	const { i18n } = useTranslation();
	return (
		<Box display="flex" flexDirection="row" alignItems="center">
			EN{' '}
			<Switch
				onChange={event =>
					event.target.checked
						? i18n.changeLanguage('fr')
						: i18n.changeLanguage('en')
				}
			/>{' '}
			FR
		</Box>
	);
}
