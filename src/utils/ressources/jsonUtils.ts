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
	const txt = label.charAt(0).toUpperCase() + label.slice(1);
	return txt.replaceAll('_', ' ');
}

export function convertToTable(roomsList: roomDetailsType[], hazardName: string) {
	const dataExport = [];
	roomsList.forEach(r => {
		const lhdUnits = r.lhd_units && r.lhd_units.length > 0 ? r.lhd_units : [null];
		const hazards = hazardName != 'search' && r.hazards && r.hazards.length > 0 ? r.hazards : [null];

		lhdUnits.forEach(u => {
			const cosecs = u && u.cosecs && u.cosecs.length > 0 ? u.cosecs : [null];
			const professors = u && u.professors && u.professors.length > 0 ? u.professors : [null];

			cosecs.forEach(cos => {
				professors.forEach(prof => {

					hazards.forEach(haz => {
						if (hazardName == 'search' || (hazardName != 'search' && haz && haz.hazard_form_history.hazard_form.hazard_category.hazard_category_name.toLowerCase().indexOf(hazardName.toLowerCase()) > -1)) {
							const children = haz && haz.children && haz.children.length > 0 ? haz.children : [null];

							children.forEach(child => {
								dataExport.push({
									room: r.name,
									building: r.building,
									sector: r.sector,
									floor: r.floor,
									vol: r.vol,
									vent: r.vent,
									site: r.site,
									kind: r.kind?.name ?? null,
									unit: u?.name ?? null,
									institute: u?.institute?.name ?? null,
									school: u?.institute?.school?.name ?? null,
									cosec: cos ? `${cos.name} ${cos.surname}` : null,
									cosecEmail: cos?.email ?? null,
									professor: prof ? `${prof.name} ${prof.surname}` : null,
									professorEmail: prof?.email ?? null,
									hazardCategory: hazardName != 'search' && haz ? haz.hazard_form_history.hazard_form.hazard_category.hazard_category_name : null,
									parent_submission: haz?.submission ? JSON.parse(haz.submission).data : {},
									child_submission: child?.submission ? JSON.parse(child.submission).data : {},
								});
							});
						}
					});
				});
			});
		});
	});
	return dataExport;
}
