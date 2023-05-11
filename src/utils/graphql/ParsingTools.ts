import i18next from 'i18next';
import '../lang/Dictionary';
import { columnType, parameterType } from '../ressources/types';

type fieldType = {
	name: string | undefined;
	fields: fieldType[] | undefined;
};

export const getTypeQuery = (query: string): string => {
	return query.split(' ')[0].replace(/s$/, '');
};

const getBody = (gql: string | undefined): string => {
	var split = gql?.split('\n');
	split?.shift();
	split?.pop();
	return split ? split.join('') : '';
};

const normSpaces = (message: string): string => {
	return message
		.replace(/{/g, ' { ')
		.replace(/}/g, ' } ')
		.replace(/\s+/g, ' ')
		.trim();
};

export const parse = (message: string | undefined): fieldType[] => {
	var tokens: string[] = normSpaces(getBody(message)).split(' ');

	return consumeFields(tokens);
	function consumeField(toks: string[]): fieldType {
		if (toks[0] === '{') {
			toks.shift();
			const retval: fieldType = { name: undefined, fields: consumeFields(toks) };
			if (toks.shift() !== '}') {
				throw new Error('Expected }');
			}
			return retval;
		} else {
			const field: fieldType = { name: toks.shift(), fields: undefined };
			if (toks[0] === '{') {
				field.fields = consumeField(toks).fields;
			}
			return field;
		}
	}
	function consumeFields(toks: string[]): fieldType[] {
		const fields: fieldType[] = [];
		while (toks.length > 0 && toks[0] !== '}') {
			fields.push(consumeField(toks));
		}
		return fields;
	}
};

export const generateFormattedList = (
	parsedQuery: fieldType[],
	prefix: string = ''
): string[] => {
	const columns: string[] = [];
	parsedQuery.forEach(field => {
		if (field.fields) {
			columns.push(
				...generateFormattedList(field.fields, `${prefix}${field.name}.`)
			);
		} else {
			columns.push(`${prefix}${field.name}`);
		}
	});
	return columns;
};

export const generateColumns = (
	query: string,
	prefix: string = ''
): columnType[] => {
	prefix = prefix ? prefix + '.' : '';
	const formattedList = generateFormattedList(parse(query), prefix);
	return formattedList.map(field => {
		return {
			field: field,
			headerName: i18next.t(field),
			width: 130,
		};
	});
};

export const formatDataToColumns = (
	graphqlBody: string | undefined,
	room: Object,
	index: number
): Object => {
	type RowType = {
		id: number;
		[key: string]: any;
	};
	var Row: RowType = { id: index };
	const recursiveJsonParsing = (data: any[], keys: any[]): any[] | null => {
		if (keys.length === 1) {
			return data[keys[0]] ? data[keys[0]] : null;
		} else {
			return data[keys[0]]
				? recursiveJsonParsing(
						data[keys[0]][0] ? data[keys[0]][0] : data[keys[0]],
						keys.slice(1)
				  )
				: null;
		}
	};

	generateFormattedList(parse(graphqlBody)).forEach(item => {
		var splitKey = item.split('.');
		if (splitKey.length === 1) {
			Row[`${getTypeQuery(graphqlBody)}.${item}`] = room[splitKey[0]]
				? room[splitKey[0]]
				: null;
		} else {
			Row[`${getTypeQuery(graphqlBody)}.${item}`] = room[splitKey[0]]
				? recursiveJsonParsing(
						room[splitKey[0]][0] ? room[splitKey[0]][0] : room[splitKey[0]],
						splitKey.slice(1)
				  )
				: null;
		}
	});
	return Row;
};

export const generateAutocompleteList = (tableData: Object[]): parameterType[] => {
	return tableData
		.map(e =>
			Object.entries(e).map(i => {
				const [lab, val] = i;
				return { value: isNaN(val) ? val : String(val), label: lab };
			})
		)
		.flat()
		.filter(e => e.label !== 'id')
		.filter(
			(compVal2, index, self) =>
				index === self.findIndex(compVal1 => compVal1.value === compVal2.value) &&
				compVal2.label !== 'id'
		);
};
