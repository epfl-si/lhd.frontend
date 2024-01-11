import React, {useEffect, useState} from 'react';
import {Autocomplete} from "@mui/material";
import {TextField} from "@material-ui/core";
import {FormCard} from "epfl-elements-react/src/stories/molecules/FormCard.tsx";
import {personType} from '../../utils/ressources/types'

interface SelectionProps {
	/**
	 * The complete list of all members that may be selected
	 */
	all: personType[]; //SelectionSource<personType>;
	/**
	 * the list of initially selected members
	 */
	selected: personType[];
	/**
	 * How to render a member
	 */
	draw?: React.FC<personType>;
}

interface SelectionSource<Member> {
	 all: () => Promise<Member[]>;
}

export const MultipleSelection = ({
	all,
	selected,
	draw
}: SelectionProps) => {
	const [currentlySelected, setCurrentlySelected] = React.useState<personType[]>([]);
	const [inputValue, setInputValue] = React.useState('');
	const [forceRender, setForceRender] = useState(false);

	useEffect(() => {
		const arr: personType[] = []
		selected.forEach(s => {
			s.status = 'Default';
			arr.push(s)
		});
		setCurrentlySelected(arr);
	}, [selected]);

	useEffect(() => {
		if (forceRender)
			setForceRender(false);
	}, [forceRender]);

	function onChange(newValue: personType | null) {
		if (newValue) {
			const selectedItem = all.find(u => u.sciper === newValue.sciper);
			if (selectedItem) {
				selectedItem.status = 'New';
				setCurrentlySelected([...currentlySelected, selectedItem]);
				setForceRender(true);
			}
		}
	}

	function onDelete(person: personType) {
		if (person.status === 'Deleted') {
			person.status = 'Default';
		} else {
			if (!selected.find(p => p.sciper == person.sciper)) {
				setCurrentlySelected(currentlySelected.filter(p => p.sciper !== person.sciper));
			} else {
				person.status = 'Deleted';
			}
		}
		setForceRender(true);
	}

	return (
		<div>
			<Autocomplete
				onChange={(event: any, newValue: personType | null) => onChange(newValue)}
				inputValue={inputValue}
				onInputChange={(event, newInputValue) => {
					setInputValue(newInputValue);
				}}
				id="member"
				options={all}
				getOptionLabel={(option) => {
					return option.name + ' ' + option.surname;
				}}
				renderInput={(params) => <TextField {...params} label="Chose person" />}
			/>
			<div style={{marginTop: '10px'}}>
				{currentlySelected.map(person => {
						return (<FormCard
							key={person.sciper + ""}
							icon={person.status === 'Deleted' ? '#rotate-ccw' : '#trash-2'}
							onClickIcon={() => onDelete(person)}
							className={person.status === 'Deleted' ? 'form-card form-text-through' : (person.status === 'New' ? 'form-card form-card-dashed' : '')}
						>
							<div>
								<small className="text-muted">
									{person.name + ' ' + person.surname}
								</small>
							</div>
						</FormCard>)
					}
				)}
			</div>
		</div>
	);
};
