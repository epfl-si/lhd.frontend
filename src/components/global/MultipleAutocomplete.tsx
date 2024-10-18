import {Autocomplete, debounce} from "@mui/material";
import {TextField} from "@material-ui/core";
import React, {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useHistory} from "react-router-dom";

interface MultipleAutocompleteProps {
	setSearch: (search: string) => void;
	setPage: (newPage: number) => void;
}

export interface OptionType {
	title: string;
	encodedTitle: string;
}

export const MultipleAutocomplete = ({
																			 setPage,
																			 setSearch
}: MultipleAutocompleteProps) => {
	const history = useHistory();
	const {t} = useTranslation();
	const [options, setOptions] = useState<OptionType[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedOptions, setSelectedOptions] = React.useState<OptionType[]>([]);
	const [inputValue, setInputValue] = React.useState<string>('');

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const queryArray: OptionType[] = []
		urlParams.forEach((value, key) => {
			queryArray.push({title: key + "=" + decodeURIComponent(value), encodedTitle: key + "=" + value});
		});
		setSelectedOptions(queryArray);
		setPage(0);
		setSearch(window.location.search.replace("?",''));
	}, [window.location.search]);

	function onChangeInput(event: any, newValue: string) {
		const val = newValue ?? '';
		setInputValue(val);
	}

	const getOptionsDelayed = useCallback(
		debounce((query: string, callback: (options: OptionType[]) => void) => {
			setOptions([]);
			getOptionsAsync(query).then(callback);
		}, 200),
		[]
	);

	useEffect(() => {
		setIsLoading(true);
		const queryString = inputValue; //.map(v => v.title).join("&");

		getOptionsDelayed(queryString, (options: OptionType[]) => {
			setOptions(options);

			setIsLoading(false);
		});
	}, [inputValue, getOptionsDelayed]);

	const onChange = (event: unknown, value: OptionType[]) => {
		setSelectedOptions(value);
		const queryString = value.map(v => v.title).join("&");
		//setSearch(value);
		setInputValue('');
		setSearch(queryString);
		setPage(0);
		history.push(`/roomcontrol?${(queryString)}`);
	};

	const getOptionLabel = (option: OptionType): string => option.title;

	const filterOptions = (options: OptionType[]): OptionType[] => options;

	const getOptionsAsync = (query: string): Promise<OptionType[]> => {
		return new Promise((resolve) => {
				resolve(
					[
						{ title: "Unit="+query, encodedTitle: "Unit="+ encodeURIComponent(query)},
						{ title: "Room="+query, encodedTitle: "Room="+ encodeURIComponent(query) },
						{ title: "Building="+query, encodedTitle: "Building="+ encodeURIComponent(query) },
						{ title: "Sector="+query, encodedTitle: "Sector="+ encodeURIComponent(query) },
						{ title: "Floor="+query, encodedTitle: "Floor="+ encodeURIComponent(query) },
						{ title: "Designation="+query, encodedTitle: "Designation="+ encodeURIComponent(query) },
						{ title: "Hazard="+query, encodedTitle: "Hazard="+ encodeURIComponent(query) },
					]
				);
		});
	};

	return <Autocomplete
		value={selectedOptions}
				onChange={onChange}
				onInputChange={onChangeInput}
				loading={isLoading}
				blurOnSelect={true}
				sx={{ width: '80%' }}
				multiple
				options={options}
				getOptionLabel={getOptionLabel}
				isOptionEqualToValue={(option, value) => option.title == value.title}
				getOptionDisabled={(option) => option.title.endsWith("=")}
				disableCloseOnSelect
				renderInput={(params) => (
					<TextField
						{...params}
						variant="outlined"
						label={t(`room.search`)}
						placeholder={t(`room.search`)}
					/>
				)}
				filterOptions={filterOptions}
			/>
}
