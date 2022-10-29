import i18next from 'i18next';
import '../lang/dictionary';

const getBody = gql => {
	var split = gql.split('\n');
	split.shift();
	split.pop();
	return split.join('');
};

export const getTypeQuery = query => {
	return query.split(' ')[0].replace(/s$/, '');
};

const normSpaces = message => {
	return message
		.replace(/{/g, ' { ')
		.replace(/}/g, ' } ')
		.replace(/\s+/g, ' ')
		.trim();
};

export const parse = message => {
	var tokens = normSpaces(getBody(message)).split(' ');

	return consumeFields(tokens);
	function consumeField(toks) {
		if (toks[0] === '{') {
			toks.shift();
			const retval = { fields: consumeFields(toks) };
			if (toks.shift() !== '}') {
				throw new Error('Expected }');
			}
			return retval;
		} else {
			const field = { name: toks.shift() };
			if (toks[0] === '{') {
				field.fields = consumeField(toks).fields;
			}
			return field;
		}
	}
	function consumeFields(toks) {
		const fields = [];
		while (toks.length > 0 && toks[0] !== '}') {
			fields.push(consumeField(toks));
		}
		return fields;
	}
};

export const generateFormattedList = (parsedQuery, prefix = '') => {
	const columns = [];
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

export const generateColumns = (query, prefix = '', lang) => {
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

export const formatDataToColumns = (graphqlBody, room, index) => {
	var Row = { id: index };
	const recursiveJsonParsing = (data, keys) => {
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
