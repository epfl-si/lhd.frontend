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
			const infos = room.hazardAdditionalInfo?.filter(info => info.hazard_category && info.hazard_category.hazard_category_name == category);
			const comment = (infos && infos.length > 0) ? infos[0].comment : undefined;
			//if (category == selectedHazardCategory) {
			const childrenList: submissionForm[] = [];
			h.children.forEach(child => {
				childrenList.push({id: child.id, submission: JSON.parse(child.submission),
					form: withForm ? (action == 'Read' ? JSON.parse(child.hazard_form_child_history.form) : JSON.parse(child.hazard_form_child_history.hazard_form_child.form)) : {}});
			})
			subForm.push({id: h.id, submission: JSON.parse(h.submission), form: withForm ? (action == 'Read' ? JSON.parse(h.hazard_form_history.form) : currentForm) : {},
				children: childrenList, room: room, category: category, comment: comment});
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

export function convertToTable(roomsList: roomDetailsType[], search: string) {
	const result: Record<string, string[]> = {};

	search.split('&').forEach(pair => {
		const [key, value] = pair.split('=');
		if (key in result) {
			result[key].push(value);
		} else {
			result[key] = [value];
		}
	});
	const dataExport = [];
	roomsList.forEach(r => {
		let lhdUnits = [];
		if (r.lhd_units && r.lhd_units.length > 0) {
			if (result['Unit'] && result['Unit'].length > 0) {
				result['Unit'].forEach(u => {
					const ulower = u.toLowerCase();
					const unit = r.lhd_units.filter(un => un.name.toLowerCase().indexOf(ulower) > -1 ||
						(un.institute && un.institute.name && un.institute.name.toLowerCase().indexOf(ulower) > -1) ||
						(un.institute && un.institute.school && un.institute.school.name && un.institute.school.name.toLowerCase().indexOf(ulower) > -1)
					);
					lhdUnits.push(...unit);
				});
			} else {
				lhdUnits = r.lhd_units;
			}
		} else {
			lhdUnits = [null];
		}
		const hazardName = result['Hazard'] && result['Hazard'].length == 1 ? result['Hazard'][0] : 'search';
		const hazards = hazardName != 'search' && r.hazards && r.hazards.length > 0 ? r.hazards : [null];

		lhdUnits.forEach(u => {
			//const cosecs = u && u.cosecs && u.cosecs.length > 0 ? u.cosecs : [null];
			//const professors = u && u.professors && u.professors.length > 0 ? u.professors : [null];
			let cosecs = [];
			if (u && u.cosecs && u.cosecs.length > 0) {
				if (result['Cosec'] && result['Cosec'].length > 0) {
					result['Cosec'].forEach(cos => {
						const cosLower = cos.toLowerCase();
						const cosec = u.cosecs.filter(co => co.name.toLowerCase().indexOf(cosLower) > -1 || co.surname.toLowerCase().indexOf(cosLower) > -1 || co.email.toLowerCase().indexOf(cosLower) > -1);
						cosecs.push(...cosec);
					});
				} else {
					cosecs = u.cosecs;
				}
			} else {
				cosecs = [null];
			}

			let professors = [];
			if (u && u.professors && u.professors.length > 0) {
				if (result['Prof'] && result['Prof'].length > 0) {
					result['Prof'].forEach(pr => {
						const profLower = pr.toLowerCase();
						const cosec = u.professors.filter(p => p.name.toLowerCase().indexOf(profLower) > -1 || p.surname.toLowerCase().indexOf(profLower) > -1 || p.email.toLowerCase().indexOf(profLower) > -1);
						professors.push(...cosec);
					});
				} else {
					professors = u.professors;
				}
			} else {
				professors = [null];
			}

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
