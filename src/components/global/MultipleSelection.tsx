import React, {useEffect, useRef, useState} from 'react';
import {FormCard} from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import {DebounceInput} from "epfl-elements-react/src/stories/molecules/inputFields/DebounceInput.tsx";
import "epfl-elements-react/src/stories/molecules/button.css";
import "epfl-elements-react/src/stories/molecules/inputFields/autocomplete.css";
import {
	fetchPeopleFromFullText, fetchunitsFromFullText
} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {useTranslation} from "react-i18next";
import "./multipleSelection.css"
import "../../../css/styles.scss";
import {personType} from "../../utils/ressources/types";

interface SelectionProps<Member> {
	/**
	 * objectName
	 */
	objectName: string;
	/**
	 * the list of initially selected members
	 */
	selected: Member[];
	/**
	 * Action to be done at change selection
	 */
	onChangeSelection?: (currentlySelected: Member[]) => void;
	/**
	 * Method to get the title for card
	 */
	getCardTitle: (currentlySelected: Member) => string;
	/**
	 * Method to fetch data
	 */
	fetchData: (search: string) => Promise<Member[]>;
}

export const MultipleSelection = <Member extends Record<string, any>>({
	objectName,
	selected,
	onChangeSelection,
	getCardTitle,
	fetchData
}: SelectionProps<Member>) => {
	const { t } = useTranslation();
	const [currentlySelected, setCurrentlySelected] = React.useState<Member[]>(selected);
	const [filteredSuggestions, setFilteredSuggestions] = useState<Member[]>([]);
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
		const arr: Member[] = []
		selected.forEach(s => {
			(s as any).status = 'Default';
			arr.push(s)
		});
		setCurrentlySelected(arr);
	}, [selected]);

	function onChange(newValue: Member | null) {
		if (newValue) {
			(newValue as any).status = 'New';
			setCurrentlySelected([...currentlySelected, newValue]);
			if ( onChangeSelection ) {
				onChangeSelection([...currentlySelected, newValue]);
			}
			const filtered = filteredSuggestions.filter((suggestion) => {
				if (objectName == 'Unit') {
					return suggestion.id != newValue.id;
				} else if (objectName == 'Person') {
					return suggestion.sciper != newValue.sciper;
				} else if (objectName == 'NewUnit') {
					return suggestion.unitId != newValue.unitId;
				} else if (objectName == 'NewRoom') {
					return suggestion.id != newValue.id;
				}
			});
			setFilteredSuggestions(filtered);
		}
	}

	function onDelete(item: Member) {
		const itemStatus = item.status;
		(item as any).status = itemStatus === 'Deleted' ? (selected.includes(item) ? 'Default' : 'New') : 'Deleted';
		setCurrentlySelected([...currentlySelected]);
		if ( onChangeSelection ) {
			onChangeSelection(currentlySelected);
		}
	}

	function onChangeInput(newValue: string) {
		if (newValue) {
			setInputValue(newValue);
			fetchData(newValue).then(r => {
				let filtered: Member[] =  r.filter((suggestion) => {
					if (objectName == 'Unit') {
						return !currentlySelected.find(s => s.id == suggestion.id);
					} else if (objectName == 'Person') {
						return !currentlySelected.find(s => s.sciper == suggestion.sciper);
					} else if (objectName == 'NewUnit') {
						return !currentlySelected.find(s => s.unitId == suggestion.unitId);
					} else if (objectName == 'NewRoom') {
						return !currentlySelected.find(s => s.id == suggestion.id);
					}
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
			/>
			<div className="resultDiv">
				{filteredSuggestions.length > 0 && (
					<ul className="ulList">
						{objectName == 'Person' ? <li className="divider li-multiselection-divider">LHD</li> : <></>}
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
											{getCardTitle(suggestion)}
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
										{getCardTitle(suggestion)}
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
							keyValue={objectName == 'Person' ? item.sciper + "" : item.name}
							icon={item.status === 'Deleted' ? '#rotate-ccw' : '#trash-2'}
							onClickIcon={() => onDelete(item)}
							className={item.status === 'Deleted' ? 'form-card form-text-through' : (item.status === 'New' ? 'form-card form-card-dashed' : '')}
							key={objectName == 'Person' ? item.sciper + "" : item.name}>
							<div className="displayFlexColumn">
								<small className="text-muted" style={{fontWeight: "bold"}}>
									{getCardTitle(item)}
								</small>
								{
									objectName == 'Unit' ?
										<div className="displayFlexColumn">
											{item.cosecs && item.cosecs.length > 0 && <small>Cosec: {item.cosecs?.map((i: personType) => i.name.concat(' ').concat(i.surname)).join(', ')}</small>}
											{item.professors && item.professors.length > 0 && <small>Prof: {item.professors?.map((i: personType) => i.name.concat(' ').concat(i.surname)).join(', ')}</small>}
										</div>
									: <></>
								}
							</div>
						</FormCard>)
					}
				)}
			</div>
		</div>
	);
};
