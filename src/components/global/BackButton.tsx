import * as React from 'react';
import {useEffect, useState} from 'react';
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";

interface BackButtonProps {
	onClickButton: () => void;
	icon: string;
	alwaysPresent: boolean;
}

export const BackButton = ({
	onClickButton,
	icon,
	alwaysPresent
}: BackButtonProps) => {
	const [isLittleScreen, setIsLittleScreen] = useState<boolean>(false);

	useEffect(() => {
		toggleDivVisibility();
		window.addEventListener("resize", toggleDivVisibility);
	}, [window]);

	function toggleDivVisibility() {
		if (window.innerWidth <= 1024 || alwaysPresent) {
			setIsLittleScreen(true);
		} else {
			setIsLittleScreen(false);
		}
	}

	return <div style={{display: (isLittleScreen ? 'flex' : 'none'), marginBottom: '10px'}}>
		<Button
			onClick={onClickButton}
			size="icon"
			iconName={icon}/>
	</div>
}
