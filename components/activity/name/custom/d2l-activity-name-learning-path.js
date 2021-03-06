import '../../../common/d2l-hc-name.js';
import '@brightspace-ui/core/components/inputs/input-text.js';
import { css, LitElement } from 'lit-element/lit-element.js';
import { customHypermediaElement, html } from '@brightspace-hmc/foundation-engine/framework/lit/hypermedia-components.js';
import { HypermediaStateMixin, observableTypes } from '@brightspace-hmc/foundation-engine/framework/lit/HypermediaStateMixin.js';
import { ifDefined } from 'lit-html/directives/if-defined';
import { LocalizeActivityName } from  '../lang/localization.js';

const rels = Object.freeze({
	specialization: 'https://api.brightspace.com/rels/specialization'
});

class ActivityNameLearningPath extends LocalizeActivityName(HypermediaStateMixin(LitElement)) {
	static get properties() {
		return {
			name: { type: String, observable: observableTypes.property, route: [{observable: observableTypes.link, rel: rels.specialization}]},
			updateName: { type: Object, observable: observableTypes.action, name: 'update-name', route: [{observable: observableTypes.link, rel: rels.specialization}]},
			_specalizationHref: { type: String, observable: observableTypes.link, rel: rels.specialization }
		};
	}

	static get styles() {
		return [ css`` ];
	}

	render() {
		return html`
			${this._hasAction('updateName') ? html`<d2l-input-text @input="${this._onInputName}" label=${this.localize('label-name')} placeholder=${this.localize('action-name')} value="${this.name}"></d2l-input-text>` : null}
			<d2l-hc-name href="${ifDefined(this._specalizationHref)}" .token="${this.token}"></d2l-hc-name>
		`;
	}

	_onInputName(e) {
		if (this.updateName.has) {
			this.updateName.commit({name: { observable: observableTypes.property, value: e.target.value} });
		}
	}

}

customHypermediaElement(
	'd2l-activity-name-learning-path',
	ActivityNameLearningPath,
	'd2l-activity-name',
	[['activity-usage', 'learning-path']]);
