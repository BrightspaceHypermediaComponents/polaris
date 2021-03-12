import '@brightspace-ui-labs/attribute-picker/attribute-picker.js';

import { css, html, LitElement } from 'lit-element/lit-element.js';
import { HypermediaStateMixin, observableTypes } from '@brightspace-hmc/foundation-engine/framework/lit/HypermediaStateMixin.js';
import { LocalizeDynamicMixin } from '@brightspace-ui/core/mixins/localize-dynamic-mixin.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

class AttributePicker extends LocalizeDynamicMixin(HypermediaStateMixin(RtlMixin(LitElement))) {

	static get properties() {
		return {
			_getPossibleValues: { observable: observableTypes.summonAction, name: 'possible-values' },
			attributeList: {type: Array },
			assignableAttributes: {type: Array}
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

	static get localizeConfig() {
		return {
			importFunc: async lang => (await import(`./lang/${lang}.js`)).default
		};
	}

	constructor() {
		super();
		this.attributeList = [];
		this.assignableAttributes = ['apple', 'banana'];
	}

	render() {

		return html`
			<d2l-labs-attribute-picker
				allow-freeform
				aria-label="${this.localize('label-condition-value')}"
				.attributeList="${this.attributeList}"
				.assignableAttributes="${this.assignableAttributes}"
				@attributes-changed="${this._onAttributesChanged}">
			</d2l-labs-attribute-picker>
		`;
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		changedProperties.forEach((oldValue, propName) => {
			switch (propName) {
				case '_getPossibleValues' :
					this._updatePossibleValues();
					break;
			}
		});
	}

	_onAttributesChanged(e) {
		this.attributeList = e.detail.attributeList;

		this.dispatchEvent(new CustomEvent('attributes-changed', {
			bubbles: true,
			composed: true,
			detail: {
				attributeList: this.attributeList
			}
		}));
	}

	async _updatePossibleValues() {
		this.assignableAttributes = [];
		const sirenReponse = await this._getPossibleValues.summon();
		this.assignableAttributes = sirenReponse.properties.values;
	}
}

customElements.define('d2l-discover-attribute-picker', AttributePicker);
