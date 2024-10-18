import React from 'react';
import "../../../css/styles.scss";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";

interface UnitTabTitleProps {
	title: string;
	icon: string;
}

export const UnitTabTitle = ({
	title,
	icon
}: UnitTabTitleProps) => {

	return <div style={{display: 'flex', justifyContent: 'center'}}>
		<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
			<use xlinkHref={`${featherIcons}${icon}`}></use>
		</svg>
		<span className="tab-text-title">{title}</span>
	</div>
};
