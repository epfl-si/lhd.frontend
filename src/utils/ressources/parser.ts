export function formatDate(date: Date, isForExport?: boolean) {
	const parts = new Intl.DateTimeFormat('en-GB', {
		year: '2-digit',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	}).formatToParts(date);
	const map = Object.fromEntries(
		parts.map(p => [p.type, p.value])
	);
	return isForExport ? `${map.day}/${map.month}/${map.year}` :
		`${map.year}-${map.month}-${map.day}_${map.hour}-${map.minute}`;
}

export function getFormattedDate(date: Date, split: String = '/') {
	if (!date) return "";

	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = String(date.getFullYear());

	return `${day}${split}${month}${split}${year}`;
}

export const formatDateForPickers = (date: Date) => {
	try {
		if (!date) return "";
		date = new Date(date);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	} catch ( e ) {
		return date;
	}
};
