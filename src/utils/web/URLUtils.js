export const copyLinkParams = optionsList => {
	optionsList?.length > 0 &&
		navigator.clipboard.writeText(
			`${window.location.origin}/?filters=${optionsList
				.map(o => `${o.value}:${o.label}`)
				.join(',')}`
		);
};

export const setUrlParams = optionsList => {
	window.history.replaceState(
		null,
		null,
		optionsList.length > 0
			? `/?filters=${optionsList.map(o => `${o.value}:${o.label}`).join(',')}`
			: '/'
	);
};
