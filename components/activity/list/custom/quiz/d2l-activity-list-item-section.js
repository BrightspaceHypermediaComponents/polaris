import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/inputs/input-checkbox-spacer.js';
import '@brightspace-ui/core/components/inputs/input-styles.js';
import '@brightspace-ui/core/components/colors/colors';

import { bodyCompactStyles, bodySmallStyles, bodyStandardStyles, heading2Styles, heading3Styles  } from '@brightspace-ui/core/components/typography/styles.js';
import { css, LitElement } from 'lit-element/lit-element.js';
import { customHypermediaElement, html } from '@brightspace-hmc/foundation-engine/framework/lit/hypermedia-components.js';
import { HypermediaStateMixin, observableTypes } from '@brightspace-hmc/foundation-engine/framework/lit/HypermediaStateMixin.js';
import { LocalizeQuizEditor } from './lang/localization.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

const rels = Object.freeze({
	specialization: 'https://api.brightspace.com/rels/specialization'
});
const route = {
	specialization:
		{ observable: observableTypes.link, rel: rels.specialization }
};
const componentClass = class extends SkeletonMixin(HypermediaStateMixin(LocalizeQuizEditor(LitElement))) {
	static get properties() {
		return {
			name: {
				type: String,
				observable: observableTypes.property,
				id: 'name',
				route: [route.specialization]
			},
			typeText: {
				type: String,
				observable: observableTypes.property,
				id: 'typeText',
				route: [route.specialization]
			}
		};
	}

	static get styles() {
		return [
			super.styles,
			heading2Styles, heading3Styles,
			bodyStandardStyles, bodyCompactStyles,
			bodySmallStyles,
			css `
				:host {
					display: block;
					width: 100%;
				}
				.section-item {
					display: flex;
					flex-wrap: nowrap;
					width: 100%;
				}
				.checkbox > * {
					display: inline;
					flex-shrink: 0;
				}
				.section {
					flex-grow: 1;
					margin-left: 0.3rem;
				}
				.section-type {
					color: var(--d2l-color-tungsten);
					margin-inline-start: 2rem;
					max-width: 10rem;
				}
			`];
	}

	constructor() {
		super();
		this.skeleton = true;
	}

	render() {
		return html`
			<div class="section-item d2l-skeletize">
				<div class="checkbox"><d2l-input-checkbox></d2l-input-checkbox></div>
				<div class="section"><span class="d2l-heading-2">${this.name}</span></div>
			</div>
			<div class="d2l-body-small section-type d2l-skeletize">${this.typeText}</div>
		`;
	}

	get _loaded() {
		return !this.skeleton;
	}

	set _loaded(loaded) {
		this.skeleton = !loaded;
	}
};

customHypermediaElement('d2l-activity-list-item-section', componentClass,
	'd2l-activity-list-item-quiz', [['activity-usage', 'section-activity']]);
