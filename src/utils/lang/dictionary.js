const dictionary = {
	en: {
		'room.name': 'Room',
		'room.occupancies.cosecs.name': 'Cosec',
		'room.occupancies.professors.name': 'Professor',
		'room.occupancies.unit.name': 'Unit',
		'room.occupancies.unit.institute.name': 'Institute',
		'room.occupancies.unit.institute.school.name': 'School',
		'room.occupancies.unit.unitId': 'Unit ID',
		'room.building': 'Building',
		'room.sector': 'Sector',
		'room.floor': 'Floor',
		'room.kind.name': 'Designation',
	},
	fr: {
		'room.name': 'Salle',
		'room.occupancies.cosecs.name': 'Cosec',
		'room.occupancies.professors.name': 'Professeur',
		'room.occupancies.unit.name': 'Unité',
		'room.occupancies.unit.institute.name': 'Institut',
		'room.occupancies.unit.institute.school.name': 'École',
		'room.occupancies.unit.unitId': 'ID Unité',
		'room.building': 'Bâtiment',
		'room.sector': 'Secteur',
		'room.floor': 'Étage',
		'room.kind.name': 'Désignation',
	},
};

export function translate(key, lang) {
	const translation = dictionary[lang];
	return translation ? translation[key] : key;
}
