import { FormControl, MenuItem, Select } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
	const { i18n } = useTranslation();
	return (
		<FormControl x={{ m: 1, minWidth: 120 }} size="small">
			<Select
				value={i18n.language}
				onChange={event => i18n.changeLanguage(event.target.value)}
				variant="outlined"
			>
				<MenuItem value="fr">Français</MenuItem>
				<MenuItem value="en">English</MenuItem>
			</Select>
		</FormControl>
	);
}
