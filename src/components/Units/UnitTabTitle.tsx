import React from 'react';
import "../../../css/styles.scss";

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
			<use xlinkHref={`${icon}`}></use>
		</svg>
		<span className="tab-text-title">{title}</span>
	</div>
};
