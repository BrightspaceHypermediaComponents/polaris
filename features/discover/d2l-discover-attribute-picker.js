import '@brightspace-ui-labs/attribute-picker/attribute-picker.js';

import { css, html, LitElement } from 'lit-element/lit-element.js';
import { HypermediaStateMixin, observableTypes } from '@brightspace-hmc/foundation-engine/framework/lit/HypermediaStateMixin.js';
import { LocalizeDiscoverEntitlement } from './lang/localization.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

class AttributePicker extends LocalizeDiscoverEntitlement(HypermediaStateMixin(RtlMixin(LitElement))) {

	static get properties() {
		return {
			_getPossibleValues: { observable: observableTypes.summonAction, name: 'possible-values' },

			condition: { type: Object },
			attributeList: {type: Array },
			availableAttributes: {type: Array}
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
				font-size: 0.8rem;
				width: 100%;
			}
		`;
	}

	constructor() {
		super();
		this.attributeList = [];
		this.availableAttributes = [];
		this.condition = {};
	}

	render() {

		return html`
			<d2l-labs-attribute-picker
				allow-freeform
				aria-label="${this.localize('label-condition-value')}"
				.attributeList="${this.attributeList}"
				.availableAttributes="${this.availableAttributes}"
				@attributes-changed="${this._onAttributesChanged}">
			</d2l-labs-attribute-picker>
		`;
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('condition')) {
			this.attributeList =  this.condition.properties.values ? this.condition.properties.values : [];
			this.conditionType = this.condition.properties.values;
		}
		if (changedProperties.has('_getPossibleValues')) {
			this._updatePossibleValues();
		}
	}

	async _updatePossibleValues() {
		const availableAttributes = await this._getPossibleValues.summon();
		console.log(availableAttributes);
	}

	_onAttributesChanged(e) {
		this.attributeList = e.detail.attributeList;
		this.condition.properties.values = this.attributeList;

		this.dispatchEvent(new CustomEvent('attributes-changed', {
			bubbles: true,
			composed: true,
			detail: {
				attributeList: this.attributeList
			}
		}));
	}
}

customElements.define('d2l-discover-attribute-picker', AttributePicker);
