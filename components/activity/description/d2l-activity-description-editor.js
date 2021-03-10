import '@brightspace-ui/core/components/inputs/input-textarea.js';
import { css, LitElement } from 'lit-element/lit-element.js';
import { customHypermediaElement, html } from '@brightspace-hmc/foundation-engine/framework/lit/hypermedia-components.js';
import { HypermediaStateMixin, observableTypes } from '@brightspace-hmc/foundation-engine/framework/lit/HypermediaStateMixin.js';
import { LocalizeFoundationDescription } from './lang/localization.js';
import ResizeObserver from 'resize-observer-polyfill';

const rels = Object.freeze({
	specialization: 'https://api.brightspace.com/rels/specialization'
});

const ro = new ResizeObserver(entries => {
	entries.forEach(entry => {
		if (!entry || !entry.target || !entry.target.resizedCallback) {
			return;
		}
		entry.target.resizedCallback(entry.contentRect && entry.contentRect.width);
	});
});

class ActivityDescriptionEditor extends LocalizeFoundationDescription(HypermediaStateMixin(LitElement)) {

	static get properties() {
		return {
			description: { type: String, observable: observableTypes.property, route: [{observable: observableTypes.link, rel: rels.specialization}]},
			updateDescription: { type: Object, observable: observableTypes.action, name: 'update-description',
				route: [{observable: observableTypes.link, rel: rels.specialization}]
			},
			_minRowCount: { type: Number }
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
			}
			:host([hidden]) {
				display: none;
			}
		`;
	}

	constructor() {
		super();
		this._minRowCount = 1;
	}

	connectedCallback() {
		super.connectedCallback();
		ro.observe(this);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		ro.unobserve(this);
	}

	render() {
		return html`
			<d2l-input-textarea
				@input="${this._onInputDescription}"
				label="${this.localize('label-description')}"
				value="${this.description}"
				rows="${this._minRowCount}"
				max-rows="5"
				?skeleton="${!this._loaded}"></d2l-input-textarea>
			`;
	}

	resizedCallback(width) {
		const breakPoint = 726;
		this._minRowCount = width >= breakPoint ? 1 : 5;
	}

	_onInputDescription(e) {
		if (this._hasAction('updateDescription')) {
			this.updateDescription.commit({description: { observable: observableTypes.property, value: e.target.value} });
		}
	}
}

customHypermediaElement('d2l-activity-description-editor', ActivityDescriptionEditor);
