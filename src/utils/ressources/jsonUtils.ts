export function findAllKeysForSubmission(obj: object) {
	let results: any[] = [];

	function search(obj: object) {
		Object.keys(obj).forEach(key => {
			if (key == 'key' && obj['type'] != 'columns' && obj['key'] != 'status' && obj['key'] != 'delete' && obj['key'] != 'undo') {
				results.push({value: obj[key], type: obj['type'] ?? ''});
			} else if (typeof obj[key] == 'object' && obj[key]) {
				search(obj[key]);
			}
		})
	}

	search(obj);
	return results;
}


export function compareVersions(oldVersion: object[], newVersion: object[], actualVersion: string | undefined) {
	const version =  actualVersion ? actualVersion.split(".") : ['1', '0', '0'];
	// Check if in the new version there are all old fields
	for (const item1 of oldVersion) {
		const matchingIndex = newVersion.findIndex(item2 => item1.value === item2.value && item1.type === item2.type);
		if (matchingIndex === -1) {
			// An element has been deleted => major version
			return (+version[0] + 1) + "." + version[1] + "." + version[2];
		}
	}
	if (oldVersion.length !== newVersion.length) {
		// There are new element in the form
		return version[0] + "." + (+version[1] + 1) + "." + version[2];
	} else {
		return version[0] + "." + version[1] + "." + (+version[2] + 1);
	}
}
