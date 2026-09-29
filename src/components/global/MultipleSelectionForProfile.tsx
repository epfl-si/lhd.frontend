import React, {useEffect, useRef, useState} from 'react';
import {DebounceInput, FormCard} from "epfl-elements-react-si-extra";
import {useTranslation} from "react-i18next";
import "./multipleSelection.css"
import "../../../css/styles.scss";
import {personType, profile} from "../../utils/ressources/types";

interface SelectionProps {
	/**
	 * the list of initially selected members
	 */
	selected: profile[];
	/**
	 * Action to be done at change selection
	 */
	onChangeSelection?: (currentlySelected: profile[]) => void;
	/**
	 * Method to get the title for card
	 */
	getCardTitle: (currentlySelected: profile) => string;
	/**
	 * Method to get the title for suggestion
	 */
	getSuggestionTitle: (currentlySelected: personType) => string;
	/**
	 * Method to fetch data
	 */
	fetchData: (search: string) => Promise<personType[]>;
}

export const MultipleSelectionForProfile = ({
	selected,
	onChangeSelection,
	getCardTitle,
	getSuggestionTitle,
	fetchData
}: SelectionProps) => {
	const { t } = useTranslation();
	const [currentlySelected, setCurrentlySelected] = React.useState<profile[]>(selected);
	const [filteredSuggestions, setFilteredSuggestions] = useState<personType[]>([]);
	const [inputValue, setInputValue] = React.useState('');
	const inputRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
				setFilteredSuggestions([]);
				setInputValue('');
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [inputRef]);

	useEffect(() => {
		const arr: profile[] = []
		selected.forEach(s => {
			(s as any).status = 'Default';
			arr.push(s)
		});
		setCurrentlySelected(arr);
	}, [selected]);

	function onChange(newValue: personType | null) {
		if (newValue) {
			setCurrentlySelected([...currentlySelected, {expirationDate: new Date, role: 'Cosec', status: "New", person: newValue}]);
			if ( onChangeSelection ) {
				onChangeSelection([...currentlySelected, {expirationDate: new Date, role: 'Cosec', status: "New", person: newValue}]);
			}
			const filtered = filteredSuggestions.filter((suggestion) => {
				return suggestion.sciper != newValue.sciper;
			});
			setFilteredSuggestions(filtered);
		}
	}

	function onDelete(item: profile) {
		const itemStatus = item.status;
		item.status = itemStatus === 'Deleted' ? (selected.includes(item) ? 'Default' : 'New') : 'Deleted';
		setCurrentlySelected([...currentlySelected]);
		if ( onChangeSelection ) {
			onChangeSelection(currentlySelected);
		}
	}

	function onChangeInput(newValue: string) {
		if (newValue) {
			setInputValue(newValue);
			fetchData(newValue).then(r => {
				let filtered: personType[] =  r.filter((suggestion) => {
					return !currentlySelected.find(s => s.person.sciper == suggestion.sciper);
				}) || [];
				setFilteredSuggestions(filtered);
			});
		} else {
			setFilteredSuggestions([]);
		}
	}

	let lhd = true;
	return (
		<div ref={inputRef} >
			<DebounceInput
				input={inputValue}
				id="member"
				onChange={onChangeInput}
				placeholder={t(`generic.search`)}
				style={{fontSize: 'small'}}
			/>
			<div className={'resultDiv'}>
				{filteredSuggestions.length > 0 && (
					<ul className="ulList" style={{fontSize: 'small'}}>
						<li className="divider li-multiselection-divider">LHD</li>
						{filteredSuggestions.map((suggestion, index) => {
							if (lhd && suggestion.type == 'DirectoryPerson') {
								lhd = false;
								return (
									<>
										<li className="divider li-multiselection-divider">LDAP</li>
										<li
											key={index}
											onClick={() => onChange(suggestion)}
											className="liItem"
										>
											{getSuggestionTitle(suggestion)}
										</li>
									</>
								)
							} else {
								return (
									<li
										key={index}
										onClick={() => onChange(suggestion)}
										className="liItem"
									>
										{getSuggestionTitle(suggestion)}
									</li>
								)
							}
						})}
					</ul>
				)}
			</div>
			<div className="form-card-div">
				{currentlySelected && currentlySelected.map(item => {
						return (<FormCard
							keyValue={item.person.sciper + item.role}
							icon={item.expirationDate ? (item.status === 'Deleted' ? '#rotate-ccw' : '#trash-2') : ''}
							tooltip={item.status === 'Deleted' ? t(`room_details.undoDeletionUnit`) : t(`room_details.deleteUnit`)}
							onClickIcon={() => onDelete(item)}
							className={item.status === 'Deleted' ? 'form-card form-text-through' : (item.status === 'New' ? 'form-card form-card-dashed' : '')}
							key={item.person.sciper + item.role}>
							<div className="displayFlexColumn">
								<small className="text-muted" style={{fontWeight: "bold"}}>
									{getCardTitle(item)}
								</small>
							</div>
						</FormCard>)
					}
				)}
			</div>
		</div>
	);
};
