import {Components} from "@formio/react";
const FieldComponent = Components.components.field;
const SelectComponent = Components.components.select;

export class LHDSelectComponent extends SelectComponent {
	static schema() {
		return FieldComponent.schema({
			type: 'lhdselect',
			dataSrc: 'json',
			data: {
				"json": []
			}
		});
	}

	/**
	 * This is the Form Builder information on how this component should show
	 * up within the form builder. The "title" is the label that will be given
	 * to the button to drag-and-drop on the buidler. The "icon" is the font awesome
	 * icon that will show next to it, the "group" is the component group where
	 * this component will show up, and the weight is the position within that
	 * group where it will be shown. The "schema" field is used as the default
	 * JSON schema of the component when it is dragged onto the form.
	 */
	static get builderInfo() {
		return {
			title: 'LHD Select',
			icon: 'terminal',
			group: 'basic',
			schema: LHDSelectComponent.schema()
		};
	}

	// @ts-ignore
	get emptyValue() {
		return [];
	}

	render() {
		return super.render(`<div>
			<select
			value={this.dataValue}
			onChange={this.updateValue.bind(this)}
			/>
		</div>`);
	}
}
