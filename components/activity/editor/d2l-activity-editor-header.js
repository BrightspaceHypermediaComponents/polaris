import '../description/d2l-activity-description-editor.js';
import '../name/d2l-activity-name-editor.js';
import { css, LitElement } from 'lit-element/lit-element.js';
import { html } from '@brightspace-hmc/foundation-engine/framework/lit/hypermedia-components.js';
import { HypermediaStateMixin } from '@brightspace-hmc/foundation-engine/framework/lit/HypermediaStateMixin.js';

class ActivityEditorHeader extends HypermediaStateMixin(LitElement) {

	static get properties() {
		return {
			subTitle: { type: String, attribute: 'sub-title' }
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
				padding: 1.25rem 1.5rem 2.25rem 1.5rem;
			}
			.d2l-activity-header-content {
				max-width: 790px;
				padding: 0 0.2rem;
				display: grid;
				grid-template-columns: auto;
				grid-template-rows: auto;
				grid-gap: 1.05rem;
			}

			@media only screen and (max-width: 929px) {
				:host {
					padding-left: 1.2rem;
					padding-right: 1.2rem;
				}
			}
		`;
	}
	render() {
		return html`
			<div class="d2l-activity-header-content">
				${ this.subTitle ? html`<div class="d2l-heading-4 d2l-activity-sub-header">${this.subTitle}</div>` : null }
				<d2l-activity-name-editor href="${this.href}" .token="${this.token}"></d2l-activity-name-editor>
				<d2l-activity-description-editor href="${this.href}" .token="${this.token}"></d2l-activity-description-editor>
			</div>
		`;
	}
}

customElements.define('d2l-activity-editor-header', ActivityEditorHeader);
