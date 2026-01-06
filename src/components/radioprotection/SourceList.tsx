import React, {useEffect, useState} from 'react';
import {Button, FormCard, Text} from "epfl-elements-react-si-extra";
import {useTranslation} from "react-i18next";
import {genericType} from "../../utils/ressources/types";
import "../../../css/styles.scss";

interface SourceProps {
	/**
	 * the list of initially selected members
	 */
	selected: genericType[];
	/**
	 * Action to be done at change selection
	 */
	onChangeSelection?: (currentlySelected: genericType[]) => void;
	type: 'source' | 'ticket_number';
}

export const Source = ({
	selected,
	onChangeSelection,
	type
}: SourceProps) => {
	const { t } = useTranslation();
	const [currentlySelected, setCurrentlySelected] = React.useState<genericType[]>(selected);
	const [inputValue, setInputValue] = React.useState('');
	const [forceRender, setForceRender] = useState(false);

	useEffect(() => {
		const arr: genericType[] = []
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

	function onDelete(item: genericType) {
		const itemStatus = item.status;
		if (item.status == 'New' && onChangeSelection ) {
			const filtered = currentlySelected.filter(s => s[type] != item[type] || s.status != 'New');
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
			const newsourceType: genericType = {status: 'New'};
			newsourceType[type] = inputValue;
			setCurrentlySelected([...currentlySelected, newsourceType]);
			setInputValue('');
			if ( onChangeSelection ) {
				onChangeSelection([...currentlySelected, newsourceType]);
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
						<ul className="nested">
							{type && currentlySelected.map(item => {
									return (<li><FormCard
										key={item[type]}
										keyValue={item[type] ?? ''}
										icon={item.status === 'Deleted' ? '#rotate-ccw' : '#trash-2'}
										onClickIcon={() => onDelete(item)}
										className={item.status === 'Deleted' ? 'form-card form-text-through' : (item.status === 'New' ? 'form-card form-card-dashed' : '')}
									>
										<div>
											<small className="text-muted">
												{item[type]}
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
