import {OptionType} from "../ressources/types";

export function getQueryStringArray () {
	const urlParams = new URLSearchParams(window.location.search);
	const queryArray: OptionType[] = []
	urlParams.forEach((value, key) => {
		queryArray.push({title: key + "=" + decodeURIComponent(value), encodedTitle: key + "=" + value});
	});
	return queryArray;
}
