import { LoginButton } from '@epfl-si/react-appauth';
import { Box } from '@material-ui/core';
import LanguageSwitcher from '../Table/LanguageSwitcher';

export default function ControlsBar() {
	return (
		<Box
			display="flex"
			flexDirection="row"
			alignItems="center"
			justifyContent="flex-end"
			gridGap={8}
			width="100%"
		>
			<LanguageSwitcher />
			<LoginButton />
		</Box>
	);
}
