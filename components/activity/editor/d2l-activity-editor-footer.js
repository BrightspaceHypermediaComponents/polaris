import '@brightspace-ui/core/components/alert/alert-toast.js';
import '@brightspace-ui/core/components/backdrop/backdrop.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import '../../common/d2l-hc-visibility-editor.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { HypermediaStateMixin, observableTypes } from '@brightspace-hmc/foundation-engine/framework/lit/HypermediaStateMixin.js';
import { getUniqueId } from '@brightspace-ui/core/helpers/uniqueId.js';
import { LocalizeFoundationEditor } from './lang/localization.js';

const rels = Object.freeze({
	specialization: 'https://api.brightspace.com/rels/specialization'
});

class ActivityEditorFooter extends LocalizeFoundationEditor(HypermediaStateMixin(LitElement)) {

	static get properties() {
		return {
			up: { type: Object, observable: observableTypes.link, rel: 'up'},
			_backdropOpen: { type: Boolean },
			_dialogOpen: { type: Boolean },
			_toastOpen: { type: Boolean },
			_isNew: {
				type: Boolean,
				observable: observableTypes.classes,
				method: classes => classes.includes('creating'),
				route: [{observable: observableTypes.link, rel: rels.specialization}]
			}
		};
	}

	static get styles() {
		return [css`
			:host {
				align-items: baseline;
				box-sizing: border-box;
				display: flex;
				justify-content: space-between;
				max-width: 1230px;
				padding: 0 1.5rem;
			}
			.d2l-activity-editor-save-buttons-visibility {
				display: inline-block;
				margin-left: 0.6rem;
				order: 1;
				width: 120px;
			}
			.d2l-activity-editor-save-button {
				margin-right: 0.4rem;
			}
			.d2l-activity-editor-save-buttons {
				display: flex;
			}
			.d2l-desktop-button {
				display: none;
			}
			.d2l-mobile-button {
				display: inline-block;
			}
			@media only screen and (min-width: 615px) {
				.d2l-activity-editor-save-buttons-visibility {
					width: 300px;
				}
				.d2l-desktop-button {
					display: inline-block;
				}
				.d2l-mobile-button {
					display: none;
				}
			}
		`];
	}

	constructor() {
		super();
		this.saveButtons = getUniqueId();
	}

	render() {
		return html`
			<div class="d2l-activity-editor-save-buttons" id="${this.saveButtons}">
				<d2l-hc-visibility-editor class="d2l-activity-editor-save-buttons-visibility" href="${this.href}" .token="${this.token}" ?disabled="${!this._loaded}"></d2l-hc-visibility-editor>
				<d2l-button class="d2l-activity-editor-save-button d2l-desktop-button" primary @click="${this._onSaveClick}" ?disabled="${!this._loaded}">${this.localize('action-saveClose')}</d2l-button>
				<d2l-button class="d2l-activity-editor-save-button d2l-mobile-button" primary @click="${this._onSaveClick}" ?disabled="${!this._loaded}">${this.localize('action-save')}</d2l-button>
				<d2l-button class="d2l-activity-editor-save-button" @click="${this._onCancelClick}" ?disabled="${!this._loaded}">${this.localize('action-cancel')}</d2l-button>
			</div>

			<d2l-alert-toast ?open="${this._toastOpen}" type="success"
				announce-text="${this.localize('text-saveComplete')}">
					${this.localize('text-saveComplete')}
			</d2l-alert-toast>

			<d2l-backdrop for-target="${this.saveButtons}" no-animate-hide ?shown="${this._backdropOpen}"></d2l-backdrop>
			<d2l-dialog ?opened="${this._dialogOpen}" @d2l-dialog-close="${this._closeDialog}" title-text="${this._isNew ? this.localize('text-newDialogSaveTitle') : this.localize('text-editDialogSaveTitle')}">
				<div>${this._isNew ? this.localize('text-newDialogSaveContent') : this.localize('text-editDialogSaveContent')}</div>
				<d2l-button slot="footer" primary data-dialog-action="okay">${this.localize('label-ok')}</d2l-button>
			</d2l-dialog>
			`;
	}

	_closeDialog() {
		this._dialogOpen = false;
		this._backdropOpen = false;
	}

	_onCancelClick() {
		this._pageRedirect();
	}

	async _onSaveClick() {
		this._backdropOpen = true;
		try {
			await this.updateComplete;
			await this._state.push();
		} catch (err) {
			this._dialogOpen = true;
			return;
		}

		this._toastOpen = true;
		this._backdropOpen = false;

		this._pageRedirect();
	}

	_pageRedirect() {
		if (this.up) {
			window.location.href = this.up;
		}
	}
}

customElements.define('d2l-activity-editor-footer', ActivityEditorFooter);
