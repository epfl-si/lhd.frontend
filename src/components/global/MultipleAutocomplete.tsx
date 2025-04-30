import {Autocomplete, debounce} from "@mui/material";
import {TextField} from "@material-ui/core";
import React, {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useHistory} from "react-router-dom";
import {splitCamelCase} from "../../utils/ressources/jsonUtils";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";

interface MultipleAutocompleteProps {
	setSearch: (search: string) => void;
	setPage: (newPage: number) => void;
	setCategory?: (newCategory: string) => void;
	parent: string;
	category?: string;
	columns?: string[];
}

export interface OptionType {
	title: string;
	encodedTitle: string;
}

export const MultipleAutocomplete = ({
																			 setPage,
																			 setSearch,
																			 parent,
																			 category,
																			 columns,
																			 setCategory
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
			if (key != 'Category') {
				queryArray.push({title: key + "=" + decodeURIComponent(value), encodedTitle: key + "=" + value});
			} else if ( setCategory ) {
				setCategory(value);
			}
		});
		setSelectedOptions(queryArray);
		setPage(0);
		setSearch(queryArray.map(qs => qs.title).join('&'));
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
		[columns]
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
		const queryString = value.map(v => v.encodedTitle).join("&");
		setInputValue('');
		setSearch(queryString);
		setPage(0);
		history.push(`/${parent}?${category ? 'Category=' + category + '&' : ''}${(queryString)}`);
	};

	const getOptionLabel = (option: OptionType): string => option.title;

	const filterOptions = (options: OptionType[]): OptionType[] => options;

	const getOptionsAsync = (query: string): Promise<OptionType[]> => {
		return new Promise((resolve) => {
			if (parent == 'hazardscontrol') {
				const filterArray: OptionType[] = [{ title: "Room=" + query, encodedTitle: "lab_display=" + encodeURIComponent(query)}];
				columns?.forEach(col => {
					filterArray.push({ title: splitCamelCase(col) + "=" + query, encodedTitle: col + "=" + encodeURIComponent(query)})
				})
				resolve(filterArray);
			} else {resolve(
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
			}
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
