const { describe, it, xit } = require('mocha');

var expect = require('chai').expect;

var message = `name
occupancies { 
  cosecs { 
    name 
  }
  professors { 
    name 
  }
  unit {
    name
    institute {
      name
      school {
        name
      }
    }
    unitId
  }
}
building
sector
floor
kind {
  name
}`;

const normSpaces = message => {
	return message
		.replace(/{/g, ' { ')
		.replace(/}/g, ' } ')
		.replace(/\s+/g, ' ')
		.trim();
};

const parse1 = message => {
	var tokens = normSpaces(message).split(' ');

	class parserState {
		constructor() {
			this.fields = [];
			this.appendingFieldsTo = [this];
		}
		newField(field) {
			this.appendingFieldsTo[0].fields.push({ name: field });
		}
		addLevel() {
			this.appendingFieldsTo.unshift(
				this.appendingFieldsTo[0].fields[this.appendingFieldsTo[0].fields.length - 1]
			);
			this.appendingFieldsTo[0].fields = [];
		}
		removeLevel() {
			this.appendingFieldsTo.shift();
		}
		getTree() {
			return this.fields;
		}
	}
	const state = new parserState();
	tokens.forEach(tok => {
		if (tok === '{') {
			state.addLevel();
		} else if (tok === '}') {
			state.removeLevel();
		} else {
			state.newField(tok);
		}
	});
	return state.getTree();
};

const parse2 = message => {
	var tokens = normSpaces(message).split(' ');
	var topFields = { fields: [] };
	var appendingFieldsTo = [topFields];
	tokens.forEach(tok => {
		if (tok === '{') {
			appendingFieldsTo.unshift(
				appendingFieldsTo[0].fields[appendingFieldsTo[0].fields.length - 1]
			);
			appendingFieldsTo[0].fields = [];
		} else if (tok === '}') {
			appendingFieldsTo.shift();
		} else {
			appendingFieldsTo[0].fields.push({ name: tok });
		}
	});
	return topFields.fields;
};

const parse = message => {
	var tokens = normSpaces(message).split(' ');

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

describe('normSpaces', () => {
	it('normalizes spaces', () => {
		expect(
			normSpaces(
				`occupancy{


  cosecs
        `
			)
		).to.equal('occupancy { cosecs');
	});
});

describe('parse2', () => {
	it('parses easy strings', () => {
		expect(parse('name')).to.deep.equal([{ name: 'name' }]);
	});
	it('parses nested strings', () => {
		expect(
			parse(`name {
      name
    }`)
		).to.deep.equal([{ name: 'name', fields: [{ name: 'name' }] }]);
		expect(
			parse(`name
    occupancies { 
      cosecs { 
        name 
      }
    }`)
		).to.deep.equal([
			{ name: 'name' },
			{
				name: 'occupancies',
				fields: [{ name: 'cosecs', fields: [{ name: 'name' }] }],
			},
		]);
	});
	it('parses hard strings', () => {
		expect(parse(message)).to.deep.equal([
			{ name: 'name' },
			{
				name: 'occupancies',
				fields: [
					{ name: 'cosecs', fields: [{ name: 'name' }] },
					{ name: 'professors', fields: [{ name: 'name' }] },
					{
						name: 'unit',
						fields: [
							{ name: 'name' },
							{
								name: 'institute',
								fields: [
									{ name: 'name' },
									{ name: 'school', fields: [{ name: 'name' }] },
								],
							},
							{ name: 'unitId' },
						],
					},
				],
			},
			{ name: 'building' },
			{ name: 'sector' },
			{ name: 'floor' },
			{ name: 'kind', fields: [{ name: 'name' }] },
		]);
	});
});
