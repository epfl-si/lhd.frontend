import React, {useEffect, useState} from 'react';
import {Autocomplete} from "@mui/material";
import {TextField} from "@material-ui/core";
import {FormCard} from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import "epfl-elements-react/src/stories/molecules/button.css";

interface SelectionProps<Member> {
	/**
	 * objectName
	 */
	objectName: string;
	/**
	 * The complete list of all members that may be selected
	 */
	all: Member[];
	/**
	 * the list of initially selected members
	 */
	selected: Member[];
	/**
	 * How to render a member
	 */
	draw?: React.FC<Member>;
	/**
	 * Action to be done at change selection
	 */
	onChangeSelection?: (currentlySelected: Member[]) => void;
}

export const MultipleSelection = <Member extends Record<string, any>>({
	objectName,
	all,
	selected,
	draw,
	onChangeSelection
}: SelectionProps<Member>) => {
	const [currentlySelected, setCurrentlySelected] = React.useState<Member[]>(selected);
	const [inputValue, setInputValue] = React.useState('');
	const [forceRender, setForceRender] = useState(false);

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
			setForceRender(true);
			if ( onChangeSelection ) {
				onChangeSelection([...currentlySelected, newValue]);
			}
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

	return (
		<div>
			<Autocomplete
				onChange={(event: any, newValue: Member | null) => onChange(newValue)}
				inputValue={inputValue}
				onInputChange={(event, newInputValue) => {
					setInputValue(newInputValue);
				}}
				id="member"
				options={all}
				getOptionLabel={(option) => {
					if (objectName == 'Person') {
						return option.name + ' ' + option.surname;
					} else if (objectName == 'Unit') {
						return option.name;
					}
				}}
				renderInput={(params) => <TextField {...params} label="Chose " />}
			/>
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
											? item.name + ' ' + item.surname
											: (objectName == 'Unit'
											? (item.institute?.school?.name).concat(' ').concat(item.institute?.name).concat(' ').concat(item.name)
											: '')
									}
								</small>
							</div>
						</FormCard>)
					}
				)}
			</div>
			<div style={{marginTop: '50px'}}>
			</div>
		</div>
	);
};
