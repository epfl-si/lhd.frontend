import React, {useEffect, useRef, useState} from 'react';
import {FormCard} from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import {DebounceInput} from "epfl-elements-react/src/stories/molecules/inputFields/DebounceInput.tsx";
import "epfl-elements-react/src/stories/molecules/button.css";
import "epfl-elements-react/src/stories/molecules/inputFields/autocomplete.css";
import {fetchPeopleFromFullText} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {useTranslation} from "react-i18next";
import "./multipleSelection.css"

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
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
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
					return suggestion.sciper != newValue.sciper;
				}
			});
			setFilteredSuggestions(filtered);
		}
	}

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

			if (objectName == 'Unit') {
				let filtered: Member[] = [];
				filtered = all?.filter((suggestion) => {
					const alreadySelected = !!currentlySelected.find(s => s.id == suggestion.id);
					return getUnitTitle(suggestion).toLowerCase().includes(newValue.toLowerCase()) && !alreadySelected;
				}) || [];
				setFilteredSuggestions(filtered);
			} else if (objectName == 'Person') {
				fetchPeople(newValue).then(r => {

					let filtered: Member[] =  r?.filter((suggestion) => {
						return !currentlySelected.find(s => s.sciper == suggestion.sciper);
					}) || [];

					setFilteredSuggestions(filtered);
				});
			}
		} else {
			setFilteredSuggestions([]);
		}
	}

	const fetchPeople = async (newValue: string): Promise<Member[]> => {
		const results = await fetchPeopleFromFullText(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			newValue
		);
		if (results.status === 200) {
			if (results.data) {
				return results.data;
			} else {
				console.error('Bad GraphQL results', results);
			}
		}
		return [];
	};

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
				placeholder={objectName == 'Person' ? t(`unit_details.personPlaceholder`) : t(`room_details.unitPlaceholder`)}
			/>
			<div className="resultDiv">
				{filteredSuggestions.length > 0 && (
					<ul className="ulList">
						{filteredSuggestions.map((suggestion, index) => {
							return (
								<li
									key={index}
									onClick={() => onChange(suggestion)}
									className="liItem"
								>
									{
										objectName == 'Person' ?
											<>
												{suggestion.type == 'Person' ?
													<span className="spanLHD">
													LHD <span style={{fontSize: 'small'}}>✔️</span> </span> : <></>}
												<span>{getPersonTitle(suggestion)}</span>

											</>
											: objectName == 'Unit' ?
												getUnitTitle(suggestion)
												: ''
									}
								</li>
							)})}
					</ul>
				)}
			</div>
			<div style={{marginTop: '10px'}}>
				{currentlySelected.map(item => {
						return (<FormCard
							key={objectName == 'Person' ? item.sciper : item.name}
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
