export function checkForHazardSubmissions(obj1: object, obj2: object): boolean {
	if (!obj2){
		console.log("New object has been created");
		return false;
	}

	const obj1Keys = Object.keys(obj1);
	const obj2Keys = Object.keys(obj2);

	if (obj1Keys.length !== obj2Keys.length || !obj1Keys.every(key => obj2.hasOwnProperty(key)) || !obj2Keys.every(key => obj1.hasOwnProperty(key))) {
		console.log("Objects have different properties");
		return false;
	}

	for (const key of obj1Keys) {
		if (obj1[key] !== obj2[key]) {
			console.log(`Objects have different value for property "${key}"`);
			return false;
		}
	}

	console.log("Objects are equals");
	return true;
}
