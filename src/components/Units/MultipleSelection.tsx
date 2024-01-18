import React, {useEffect, useRef, useState} from 'react';
import {Autocomplete} from "@mui/material";
import {TextField} from "@material-ui/core";
import {FormCard} from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import {DebounceInput} from "epfl-elements-react/src/stories/molecules/inputFields/DebounceInput.tsx";
import "epfl-elements-react/src/stories/molecules/button.css";
import "epfl-elements-react/src/stories/molecules/inputFields/autocomplete.css";
import {fetchUnitDetails} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";

interface SelectionProps<Member> {
	/**
	 * objectName
	 */
	objectName: string;
	/**
	 * The complete list of all members that may be selected
	 */
	all?: Member[];
	/**
	 * the list of initially selected members
	 */
	selected: Member[];
	/**
	 * Action to be done at change selection
	 */
	onChangeSelection?: (currentlySelected: Member[]) => void;
}

export const MultipleSelection = <Member extends Record<string, any>>({
	objectName,
	all,
	selected,
	onChangeSelection
}: SelectionProps<Member>) => {
	const [currentlySelected, setCurrentlySelected] = React.useState<Member[]>(selected);
	const [filteredSuggestions, setFilteredSuggestions] = useState<Member[]>([]);
	const [inputValue, setInputValue] = React.useState('');
	const [forceRender, setForceRender] = useState(false);
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
	}, [selected, all]);

	useEffect(() => {
		if (forceRender)
			setForceRender(false);
	}, [forceRender]);

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
					return false; //TODO
				}
			});
			setFilteredSuggestions(filtered);
		}
	}

	// const fetchPersonsFromLDAP = async (autocompleteValue: string) => {
	// 	const results = await fetch(`https://search-api.epfl.ch/api/ldap?q=${autocompleteValue}`, {
	// 		headers: {
	// 			accept: '*/*',
	// 			'content-type': 'application/json',
	// 			'sec-fetch-dest': 'empty',
	// 			'sec-fetch-mode': 'cors',
	// 			'sec-fetch-site': 'cross-site'
	// 		},
	// 		referrerPolicy: 'no-referrer-when-downgrade',
	// 		method: 'GET',
	// 		mode: 'cors',
	// 		credentials: 'omit',
	// 	});
	//
	// 	console.log(results);
	// 	if (results.status === 200) {
	//
	// 	}
	// }

	function onDelete(item: Member) {
		const itemStatus = item.status;
		(item as any).status = 'Default';
		(item as any).status = itemStatus === 'Deleted' ? (selected.includes(item) ? 'Default' : 'New') : 'Deleted';
		setForceRender(true);
		if ( onChangeSelection ) {
			onChangeSelection(currentlySelected);
		}
	}

	function onChangeInput(newValue: string) {
		if (newValue) {
			setInputValue(newValue);

			let filtered: Member[] = [];
			if (objectName == 'Unit') {
				filtered = all?.filter((suggestion) => {
					const alreadySelected = !!currentlySelected.find(s => s.id == suggestion.id);
					return getUnitTitle(suggestion).toLowerCase().includes(newValue.toLowerCase()) && !alreadySelected;
				}) || [];
			} else if (objectName == 'Person') {
				//TODO call LDAP
			}

			setFilteredSuggestions(filtered);
		} else {
			setFilteredSuggestions([]);
		}
	}

	function getUnitTitle(unit: Member) {
		return (unit.institute?.school?.name).concat(' ').concat(unit.institute?.name).concat(' ').concat(unit.name);
	}

	function getPersonTitle(person: Member) {
		return person.name + ' ' + person.surname;
	}

	return (
		<div ref={inputRef} >
			<DebounceInput
				input={inputValue}
				id="member"
				onChange={onChangeInput}
				placeholder="type somethings"
			/>
			<div style={{position: 'absolute', zIndex: '1', backgroundColor: 'white', boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)'}}>
				{filteredSuggestions.length > 0 && (
					<ul>
						{filteredSuggestions.map((suggestion, index) => {
							return (
								<li
									key={index}
									onClick={() => onChange(suggestion)}
									style={{ cursor: 'pointer', display: 'block',}}
								>
									{
										objectName == 'Person'
											? getPersonTitle(suggestion)
											: (objectName == 'Unit'
												? getUnitTitle(suggestion)
												: '')
									}
								</li>
							)})}
					</ul>
				)}
			</div>
			<div style={{marginTop: '10px'}}>
				{currentlySelected.map(item => {
						return (<FormCard
							key={item.sciper ? item.sciper : item.name}
							icon={item.status === 'Deleted' ? '#rotate-ccw' : '#trash-2'}
							onClickIcon={() => onDelete(item)}
							className={item.status === 'Deleted' ? 'form-card form-text-through' : (item.status === 'New' ? 'form-card form-card-dashed' : '')}
						>
							<div>
								<small className="text-muted">
									{
										objectName == 'Person'
											? getPersonTitle(item)
											: (objectName == 'Unit'
											? getUnitTitle(item)
											: '')
									}
								</small>
							</div>
						</FormCard>)
					}
				)}
			</div>
		</div>
	);
};
