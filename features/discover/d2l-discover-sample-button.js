/**
 * This button is designed for demoing with a legacy page and will be removed once the rules
 * component is integrated into the Course Offering Information page
 */
import '@brightspace-ui/core/components/button/button.js';
import { html, LitElement } from 'lit-element/lit-element.js';
import { LocalizeDynamicMixin } from '@brightspace-ui/core/mixins/localize-dynamic-mixin.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

class SampleButton extends LocalizeDynamicMixin(RtlMixin(LitElement)) {

	static get properties() {
		return {
			text: { type: String }
		};
	}

	static get localizeConfig() {
		return {
			importFunc: async lang => (await import(`./lang/${lang}.js`)).default
		};
	}

	render() {
		return html`
			<d2l-button @click="${this._onClick}">${this.text}</d2l-button>
		`;
	}

	_onClick() {
		const event = new CustomEvent('d2l-sample-button-click', {
			bubbles: true,
			detail: {
				value: this.text
			}
		});
		this.dispatchEvent(event);
	}
}
customElements.define('d2l-discover-sample-button', SampleButton);
