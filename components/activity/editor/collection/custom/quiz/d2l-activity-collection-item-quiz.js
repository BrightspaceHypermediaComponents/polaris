import '../../../../list/custom/quiz/d2l-activity-list-item-question.js';
import '../../../../list/custom/quiz/d2l-activity-list-item-section.js';

import { css, LitElement } from 'lit-element/lit-element.js';
import { HypermediaStateMixin, observableTypes } from '@brightspace-hmc/foundation-engine/framework/lit/HypermediaStateMixin.js';
import { guard } from 'lit-html/directives/guard';
import { html } from '@brightspace-hmc/foundation-engine/framework/lit/hypermedia-components.js';
import { ListItemMixin } from '@brightspace-ui/core/components/list/list-item-mixin.js';

const rels = Object.freeze({
	activityUsage: 'https://activities.api.brightspace.com/rels/activity-usage'
});

const componentClass = class extends HypermediaStateMixin(ListItemMixin(LitElement)) {
	static get properties() {
		return {
			number: {
				type: Number
			},
			_points: {
				type: String,
				observable: observableTypes.property,
				id: 'points'
			},
			_activityHref: { type: String, observable: observableTypes.link, rel: rels.activityUsage }
		};
	}

	static get styles() {
		return [ super.styles, css `` ];
	}

	render() {
		return this._renderListItem({
			//${guard([this._activityHref, this.token], () => html`<d2l-activity-list-item-content href="${this._activityHref}" .token="${this.token}"></d2l-activity-list-item-content>`)}`
			content: html`${guard([this._activityHref, this.token], () => html`
			<d2l-activity-list-item-quiz number="${this.number}" href="${this._activityHref}" .token="${this.token}" points="${this._points}">

			</d2l-activity-list-item-quiz>`)}`,
			// actions: html`actions here`
		});
	}
};

customElements.define('d2l-activity-collection-item-quiz', componentClass);
