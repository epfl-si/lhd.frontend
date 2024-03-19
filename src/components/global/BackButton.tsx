import * as React from 'react';
import {useEffect, useState} from 'react';
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";

interface BackButtonProps {
	onClickButton: () => void;
	icon: string;
}

export const BackButton = ({
	onClickButton,
	icon
}: BackButtonProps) => {
	const [isLittleScreen, setIsLittleScreen] = useState<boolean>(false);

	useEffect(() => {
		toggleDivVisibility();
		window.addEventListener("resize", toggleDivVisibility);
	}, [window]);

	function toggleDivVisibility() {
		if (window.innerWidth <= 1024) {
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
