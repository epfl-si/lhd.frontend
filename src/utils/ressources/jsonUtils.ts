import {lhdUnitsType, profile, roomDetailsType, submissionForm} from "./types";

export function findAllKeysForSubmission(obj: object) {
	let results: any[] = [];

	function search(obj: any) {
		Object.keys(obj).forEach(key => {
			if ( key == 'key' && obj['type'] != 'columns' && obj['key'] != 'status' && obj['key'] != 'delete' && obj['key'] != 'undo' ) {
				results.push({value: obj[key], type: obj['type'] ?? ''});
			} else if ( typeof obj[key] == 'object' && obj[key] ) {
				search(obj[key]);
			}
		})
	}

	search(obj);
	return results;
}


export function compareVersions(oldVersion: any[], newVersion: any[], actualVersion: string | undefined) {
	const version = actualVersion ? actualVersion.split(".") : ['1', '0', '0'];
	// Check if in the new version there are all old fields
	for ( const item1 of oldVersion ) {
		const matchingIndex = newVersion.findIndex(item2 => item1.value === item2.value && item1.type === item2.type);
		if ( matchingIndex === -1 ) {
			// An element has been deleted => major version
			return (+version[0] + 1) + "." + version[1] + "." + version[2];
		}
	}
	if ( oldVersion.length !== newVersion.length ) {
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
			const category = h.hazardFormHistory.hazardForm.hazardCategory.hazardCategoryName;
			const infos = room.hazardAdditionalInfo?.filter(info => info.hazardCategory && info.hazardCategory.hazardCategoryName == category);
			const comment = (infos && infos.length > 0) ? infos[0].comment : undefined;
			const tags = (infos && infos.length > 0 && infos[0].hazardsAdditionalInfoHasTag) ? infos[0].hazardsAdditionalInfoHasTag : [];
			//if (category == selectedHazardCategory) {
			const childrenList: submissionForm[] = [];
			h.children.forEach(child => {
				childrenList.push({
					id: child.id, submission: JSON.parse(child.submission),
					form: withForm ? (action == 'Read' ? JSON.parse(child.hazard_form_child_history.form) : JSON.parse(child.hazard_form_child_history.hazard_form_child.form)) : {}
				});
			})
			subForm.push({
				id: h.id,
				submission: JSON.parse(h.submission),
				form: withForm ? (action == 'Read' ? JSON.parse(h.hazardFormHistory.form) : currentForm) : {},
				children: childrenList,
				room: room,
				category: category,
				comment: comment,
				tags: tags
			});
			//}
		} catch ( error ) {
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
		if ( key in result ) {
			result[key].push(value);
		} else {
			result[key] = [value];
		}
	});
	const dataExport: any[] = [];
	roomsList.forEach(r => {
		let lhdUnits: lhdUnitsType[] = [];
		if ( r.lhdUnits && r.lhdUnits.length > 0 ) {
			if ( result['Unit'] && result['Unit'].length > 0 ) {
				result['Unit'].forEach(u => {
					const ulower = u.toLowerCase();
					const unit = r.lhdUnits.filter(un => un.name.toLowerCase().indexOf(ulower) > -1 ||
						(un.institute && un.institute.name && un.institute.name.toLowerCase().indexOf(ulower) > -1) ||
						(un.institute && un.institute.school && un.institute.school.name && un.institute.school.name.toLowerCase().indexOf(ulower) > -1)
					);
					lhdUnits.push(...unit);
				});
			} else {
				lhdUnits = r.lhdUnits;
			}
		} else {
			lhdUnits = [];
		}
		const hazardName = result['Hazard'] && result['Hazard'].length == 1 ? result['Hazard'][0] : 'search';
		const hazards = hazardName != 'search' && r.hazards && r.hazards.length > 0 ? r.hazards : [null];

		lhdUnits.forEach(u => {
			let profiles: profile[] = [];
			if (u && u.profiles && u.profiles.length > 0) {
				if (result['Profile'] && result['Profile'].length > 0) {
					result['Profile'].forEach(cos => {
						const cosLower = cos.toLowerCase();
						const profile = u.profiles.filter(co => co.person.name.toLowerCase().indexOf(cosLower) > -1 || co.person.surname.toLowerCase().indexOf(cosLower) > -1 || (co.person.email ?? '').toLowerCase().indexOf(cosLower) > -1);
						profiles.push(...profile);
					});
				} else {
					profiles = u.profiles;
				}
			} else {
				profiles = [];
			}

			profiles.forEach(prof => {
				hazards.forEach(haz => {
					if (hazardName == 'search' || (hazardName != 'search' && haz && haz.hazardFormHistory.hazardForm.hazardCategory.hazardCategoryName.toLowerCase().indexOf(hazardName.toLowerCase()) > -1)) {
						const children = haz && haz.children && haz.children.length > 0 ? haz.children : [null];

						children.forEach(child => {
							const catName = hazardName != 'search' && haz ? haz.hazardFormHistory.hazardForm.hazardCategory.hazardCategoryName : null;
							const infos = r.hazardAdditionalInfo?.filter(info => catName && info.hazardCategory && info.hazardCategory.hazardCategoryName == catName);
							const comment = (infos && infos.length > 0) ? infos[0].comment : undefined;
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
								profile: prof ? `${prof.person.name} ${prof.person.surname}` : null,
								profileEmail: prof?.person.email ?? null,
								profileRole: prof ? `${prof.role}` : null,
								profileExpirationDate: prof && prof.expirationDate ? `${prof.expirationDate}` : null,
								hazardCategory: catName,
								hazardComment: decodeURIComponent(comment || ''),
								parent_submission: haz?.submission ? JSON.parse(haz.submission).data : {},
								child_submission: child?.submission ? JSON.parse(child.submission).data : {},
							});
						});
					}
				});
			});
		});
	});
	return dataExport;
}
