import React, {useEffect, useRef, useState} from 'react';
import {FormCard} from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import {Text} from "epfl-elements-react/src/stories/molecules/inputFields/Text.tsx";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {useTranslation} from "react-i18next";
import {lhdUnitsType} from "../../utils/ressources/types";
import "../../../css/styles.scss";

interface SubUnitsProps {
	parentName: string;
	/**
	 * the list of initially selected members
	 */
	selected: lhdUnitsType[];
	/**
	 * Action to be done at change selection
	 */
	onChangeSelection?: (currentlySelected: lhdUnitsType[]) => void;
}

export const SubUnits = ({
	parentName,
	selected,
	onChangeSelection
}: SubUnitsProps) => {
	const { t } = useTranslation();
	const [currentlySelected, setCurrentlySelected] = React.useState<lhdUnitsType[]>(selected);
	const [inputValue, setInputValue] = React.useState('');
	const [forceRender, setForceRender] = useState(false);

	useEffect(() => {
		const arr: lhdUnitsType[] = []
		selected.forEach(s => {
			s.status = 'Default';
			arr.push(s)
		});
		setCurrentlySelected(arr);
	}, [selected]);

	useEffect(() => {
		if (forceRender)
			setForceRender(false);
	}, [forceRender, currentlySelected]);

	function onDelete(item: lhdUnitsType) {
		const itemStatus = item.status;
		if (item.status == 'New' && onChangeSelection ) {
			const filtered = currentlySelected.filter(s => s.name != item.name || s.status != 'New');
			setCurrentlySelected(filtered);
			if ( onChangeSelection ) {
				onChangeSelection(filtered);
			}
		} else {
			item.status = itemStatus === 'Deleted' ? 'Default' : 'Deleted';
			setForceRender(true);
			if ( onChangeSelection ) {
				onChangeSelection(currentlySelected);
			}
		}
	}

	function onAdd() {
		if (inputValue) {
			const newSubUnit: lhdUnitsType = {subUnits: [], cosecs: [], id: 0, professors: [], status: 'New', name: parentName + " (" + inputValue + ")"};
			setCurrentlySelected([...currentlySelected, newSubUnit]);
			setInputValue('');
			if ( onChangeSelection ) {
				onChangeSelection([...currentlySelected, newSubUnit]);
			}
		}
	}

	function onChangeInput(newValue: string) {
		setInputValue(newValue);
	}

	return (
		<div>
			<div style={{display: 'flex', flexDirection: 'row'}}>
				<Text
					id="input_subUnit"
					onChange={onChangeInput}
					placeholder={t('unit_details.addNewUnit')}
					type="text"
					value={inputValue}
					style={{flex: 'auto'}}
				/>
				<Button
					iconName="#plus-circle"
					onClick={onAdd}
					size="icon"
					style={{display: 'flex', marginLeft: '10px'}}
				/>
			</div>
			<div className="form-card-div">
				<ul>
					<li>
						<span>{currentlySelected.length>0 ? parentName : t('unit_details.noSubUnits')}</span>
						<ul className="nested">
							{currentlySelected.map(item => {
									return (<li><FormCard
										key={item.name}
										keyValue={item.name}
										icon={item.status === 'Deleted' ? '#rotate-ccw' : '#trash-2'}
										onClickIcon={() => onDelete(item)}
										className={item.status === 'Deleted' ? 'form-card form-text-through' : (item.status === 'New' ? 'form-card form-card-dashed' : '')}
									>
										<div>
											<small className="text-muted">
												{item.name}
											</small>
										</div>
									</FormCard></li>)
								}
							)}
						</ul>
					</li>
				</ul>
			</div>
		</div>
	);
};
