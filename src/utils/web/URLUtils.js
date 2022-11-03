export const copyLinkParams = optionsList => {
	optionsList?.length > 0 &&
		navigator.clipboard.writeText(
			`${window.location.origin}/?filters=${optionsList
				.map(o => `${o.value}:${o.label}`)
				.join(',')}`
		);
};
