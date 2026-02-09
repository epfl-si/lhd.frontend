export function formatDate(date: Date, isForExport?: boolean) {
	const parts = new Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	}).formatToParts(date);
	const map = Object.fromEntries(
		parts.map(p => [p.type, p.value])
	);
	return isForExport ? `${map.month}/${map.day}/${map.year} ${map.hour}:${map.minute}` :
		`${map.year}-${map.month}-${map.day}_${map.hour}-${map.minute}`;
}

export function getFormattedDate(date: Date, split: String = '/') {
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = String(date.getFullYear());

	return `${day}${split}${month}${split}${year}`;
}
