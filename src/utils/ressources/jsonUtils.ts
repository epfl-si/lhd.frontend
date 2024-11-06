import {roomDetailsType, submissionForm} from "./types";

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

export function readOrEditHazard(room: roomDetailsType, action: string, currentForm: any, withForm: boolean): submissionForm[] {
	const subForm: submissionForm[] = [];
	room.hazards.forEach(h => {
		try {
			const category = h.hazard_form_history.hazard_form.hazard_category.hazard_category_name;
			//if (category == selectedHazardCategory) {
			const childrenList: submissionForm[] = [];
			h.children.forEach(child => {
				childrenList.push({id: child.id, submission: JSON.parse(child.submission),
					form: withForm ? (action == 'Read' ? JSON.parse(child.hazard_form_child_history.form) : JSON.parse(child.hazard_form_child_history.hazard_form_child.form)) : {}});
			})
			subForm.push({id: h.id, submission: JSON.parse(h.submission), form: withForm ? (action == 'Read' ? JSON.parse(h.hazard_form_history.form) : currentForm) : {},
				children: childrenList, room: room, category: category});
			//}
		} catch (error) {
			console.error(error);
		}
	});
	return subForm;
}

export function splitCamelCase(str: string) {
	const label = str.replace(/([a-z])([A-Z])/g, '$1 $2') // Insert a space between lowercase and uppercase letters
	return label.charAt(0).toUpperCase() + label.slice(1);
}
