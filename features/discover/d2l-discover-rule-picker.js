import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import './d2l-discover-attribute-picker.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { HypermediaStateMixin, observableTypes } from '@brightspace-hmc/foundation-engine/framework/lit/HypermediaStateMixin.js';
import { bodyCompactStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeDynamicMixin } from '@brightspace-ui/core/mixins/localize-dynamic-mixin.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';

class RulePicker extends LocalizeDynamicMixin(HypermediaStateMixin(RtlMixin(LitElement))) {

	static get properties() {
		return {
			conditionTypes: { observable: observableTypes.subEntities, rel: 'condition-type', route: [
				{ observable: observableTypes.link, rel: 'available-condition-types' }
			] },
			conditions: { type: Array, observable: observableTypes.subEntities, rel: 'condition' },
			defaultType: { type: String },
			_conditionTypesHash: { type: Object }
		};
	}

	static get styles() {
		return [ bodyCompactStyles, selectStyles,
			css`
				.d2l-picker-rule-container {
					align-items: center;
					display: flex;
					justify-content: center;
					margin-bottom: 1rem;
					margin-top: 1rem;
				}
				.d2l-picker-rule-container-final {
					margin-bottom: 6rem;
				}
				.d2l-picker-rule-attribute-picker {
					flex-grow: 1;
				}
				.d2l-picker-rule-separator {
					margin: 0 0.5rem 0 0.5rem;
				}
				.d2l-picker-and {
					display: flex;
					margin-bottom: 0.5rem;
				}
				.d2l-picker-hr {
					align-self: center;
					border-bottom: 1px solid var(--d2l-color-mica);
					height: 0;
				}
				.d2l-picker-hr-condition-separator {
					margin-left: 1rem;
					width: 100%;
				}
				.d2l-picker-hr-match-separator {
					margin-bottom: 1rem;
					margin-top: 1rem;
				}
				[hidden] {
					display: none !important;
				}
			`,
		];
	}

	static get localizeConfig() {
		return {
			importFunc: async lang => (await import(`./lang/${lang}.js`)).default
		};
	}

	constructor() {
		super();
		this.conditions = [];
		this._conditionTypesHash = {};
	}

	render() {
		return html`
			${this._renderPickerConditions()}
			<d2l-button-subtle id="add-another-condition-button"
				text="${this.localize('text-add-another-condition')}"
				icon="tier1:plus-default"
				@click="${this._addDefaultCondition}"></d2l-button-subtle>
			<div class="d2l-picker-hr-match-separator">
				<div class="d2l-picker-hr"></div>
				<div class="d2l-body-compact">${this.localize('text-rule-matches', 'count', 'xxx')}</div>
			</div>
		`;
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('conditions') && this.conditions.length === 0) {
			this._addDefaultCondition();
		}
		if (changedProperties.has('conditionTypes')) {
			this._buildConditionTypeHash();
		}
	}

	async reload(newConditions) {
		this.conditions = newConditions;
		await this.updateComplete;

		if (!this.conditions || this.conditions.length === 0) {
			this._addDefaultCondition();
		}
	}

	_addDefaultCondition() {
		this.conditions.push({
			properties: {
				type: this.defaultType || (this.conditionTypes && this.conditionTypes[0].properties.type),
				value: ''
			}
		});
		this.requestUpdate();

		this.dispatchEvent(new CustomEvent('d2l-rule-condition-added', {
			bubbles: true,
			composed: true
		}));
	}

	_buildConditionTypeHash() {
		this._conditionTypesHash = {};
		this.conditionTypes.forEach(conditionType => {
			this._conditionTypesHash[conditionType.properties.type] = conditionType;
		});
	}

	_getSelectedConditionHref(condition) {
		if (this._conditionTypesHash[condition.properties.type]) {
			return this._conditionTypesHash[condition.properties.type].href;
		}
		return '';
	}

	_isLastCondition(condition) {
		return this.conditions[this.conditions.length - 1] === condition;
	}

	_isOnlyCondition() {
		return this.conditions?.length === 1;
	}

	_onConditionSelectChange(e) {
		const condition = e.target.condition;

		if (condition.properties.type !== e.target.value) {
			condition.properties.type = e.target.value;
		}

		this.requestUpdate();
	}

	_onConditionValueChange(e) {
		const condition = e.target.condition;
		condition.properties.values = e.detail.attributeList;
	}

	_removeCondition(e) {
		const condition = e.target.condition;

		const index = this.conditions.indexOf(condition);
		if (index > -1) {
			this.conditions.splice(index, 1);
			this.requestUpdate();
		}
	}

	_renderPickerConditions() {
		return html`
		${this.conditions.map((condition, index) => html`
		<div class="d2l-picker-rule-container ${this.conditions.length - 1 === index ? 'd2l-picker-rule-container-final' : ''}">
			<select class="d2l-input-select picker-rule-select"
				aria-label="${this.localize('label-condition-type')}"
				.condition="${condition}"
				value="${condition.properties.type}"
				@blur="${this._onConditionSelectChange}">
				${this.conditionTypes ? this.conditionTypes.map(conditionType => html`
					<option value="${conditionType.properties.type}" ?selected="${condition.properties.type === conditionType.properties.type}">${conditionType.properties.type}</option>
				`) : null}
			</select>
			<div class="d2l-picker-rule-separator d2l-body-compact">
				${this.localize('text-condition-is')}
			</div>
			<d2l-discover-attribute-picker
				href="${this._getSelectedConditionHref(condition)}"
				.token="${this.token}"
				class="d2l-picker-rule-attribute-picker"
				.condition="${condition}"
				@attributes-changed="${this._onConditionValueChange}">
			</d2l-discover-attribute-picker>
			<d2l-button-icon
				class="delete-condition-button"
				?hidden=${this._isOnlyCondition()}
				text="${this.localize('text-remove-condition', 'conditionType', condition.properties.type)}"
				icon="tier1:close-default"
				.condition="${condition}"
				@click="${this._removeCondition}"></d2l-button-icon>
		</div>
		<div class="d2l-picker-and d2l-body-compact" ?hidden="${this._isLastCondition(condition)}">
			${this.localize('text-and')}
			<div class="d2l-picker-hr d2l-picker-hr-condition-separator"></div>
		</div>
		`)}`;
	}
}

customElements.define('d2l-discover-rule-picker', RulePicker);
