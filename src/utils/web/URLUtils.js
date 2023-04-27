export const copyLinkParams = optionsList => {
	optionsList?.length > 0 &&
		navigator.clipboard.writeText(
			`${window.location.origin}${window.location.pathname}?filters=${optionsList
				.map(o => `${o.value}:${o.label}`)
				.join(',')}`
		);
};

export const setUrlParams = optionsList => {
	window.history.replaceState(
		null,
		null,
		window.location.pathname + optionsList.length > 0
			? `?filters=${optionsList.map(o => `${o.value}:${o.label}`).join(',')}`
			: ''
	);
};
