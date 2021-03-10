import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import '@brightspace-ui/core/components/inputs/input-text.js';
import './d2l-discover-rule-picker.js';

import { css, html, LitElement } from 'lit-element/lit-element.js';
import { HypermediaStateMixin, observableTypes } from '@brightspace-hmc/foundation-engine/framework/lit/HypermediaStateMixin.js';
import { LocalizeDynamicMixin } from '@brightspace-ui/core/mixins/localize-dynamic-mixin.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

const rels = Object.freeze({
	condition: 'condition',
	updateCondions: 'update-conditions',
});

class RulePickerDialog extends LocalizeDynamicMixin(HypermediaStateMixin(RtlMixin(LitElement))) {
	static get properties() {
		return {
			opened: { type: Boolean },
			conditions: { type: Array, observable: observableTypes.subEntities, rel: rels.condition },
			creating: { type: Boolean, observable: observableTypes.classes, method: classes => classes.includes('creating') },
			updateConditions: { observable: observableTypes.action, name: rels.updateCondions }
		};
	}

	static get styles() {
		return css`
			.d2l-rule-picker-area {
				height: 100%;
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
		this.conditions = [];
		this._copiedConditions = [];
	}

	render() {
		return html`
			<d2l-dialog
				?opened="${this.opened}"
				title-text="${this.creating ? this.localize('text-add-enrollment-rule') : this.localize('text-edit-enrollment-rule')}">
				<div class="d2l-rule-picker-area">${this.localize('text-select-conditions')}</div>
				<d2l-discover-rule-picker
					href="${this.href}"
					.token="${this.token}"
					@d2l-rule-condition-added="${this._onConditionAdded}"
					>
				</d2l-discover-rule-picker>
				<d2l-button @click="${this._onDoneClick}" slot="footer" primary data-dialog-action="done">${this.localize('button-done')}</d2l-button>
				<d2l-button @click="${this._onCancelClick}" slot="footer" data-dialog-action>${this.localize('button-cancel')}</d2l-button>
			</d2l-dialog>
		`;
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('opened') && this.opened) {
			this._copyConditions();
		}
	}

	_copyConditions() {
		this._copiedConditions = this.conditions.map(condition => {
			return {...condition};
		});
	}

	_onCancelClick() {
		this.requestUpdate().then(() => {
			const picker = this.shadowRoot.querySelector('d2l-discover-rule-picker');
			picker.reload(this._copiedConditions);
		});
	}

	_onConditionAdded() {
		const dialog = this.shadowRoot.querySelector('d2l-dialog');
		dialog.resize();
	}

	_onDoneClick() {
		const picker = this.shadowRoot.querySelector('d2l-discover-rule-picker');
		if (this.creating) {
			const event = new CustomEvent('d2l-discover-rule-created', {
				bubbles: true,
				detail: {
					conditions: picker.conditions
				}
			});
			this.dispatchEvent(event);
			picker.reload([]);
		} else {
			this._state.updateProperties({
				conditions: {
					observable: observableTypes.subEntities,
					rel: rels.condition,
					value: picker.conditions
				}
			});
		}
		// action is commited differently because it's a JSON string
		this.updateConditions.commit({
			conditions: JSON.stringify(this.conditions.map(condition => {
				return { type: condition.properties.type, value: condition.properties.value };
			}))
		});
	}
}

customElements.define('d2l-discover-rule-picker-dialog', RulePickerDialog);
