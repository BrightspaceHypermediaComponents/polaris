import '../d2l-discover-rule-picker-dialog.js';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { clearStore } from '@brightspace-hmc/foundation-engine/state/HypermediaState.js';
import { createComponentAndWait } from '../../../test/test-util.js';
import { default as fetchMock } from 'fetch-mock/esm/client.js';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';
import { default as sinon } from 'sinon/pkg/sinon-esm.js';

const selfHref = 'http://rule-2';
const newEntityHref = 'http://new-rule';
const actionHref = 'http://rule-update-conditions/result';
const entity = {
	actions: [
		{ name: 'update-conditions', method: 'PATCH', href: actionHref, fields: [
			{ name: 'conditions', type: 'text' }
		] }
	],
	entities: [
		{
			rel: ['condition'],
			properties: { type: 'Fruit', value: 'Banana' }
		},
		{
			rel: ['condition'],
			properties: { type: 'Fruit', value: 'Orange' }
		},
		{
			rel: ['condition'],
			properties: { type: 'Entree', value: 'Cake' }
		}
	],
	links: [
		{ rel: ['self'], href: selfHref }
	]
};

const newEntity = {
	class: ['rule', 'creating'],
	actions: [
		{ name: 'update-conditions', method: 'PATCH', href: actionHref, fields: [
			{ name: 'conditions', type: 'text' }
		] }
	],
	links: [
		{ rel: ['self'], href: newEntityHref }
	]
};

describe('d2l-discover-rule-picker-dialog', () => {

	before(() => {
		fetchMock.mock(selfHref, JSON.stringify(entity))
			.mock(newEntityHref, JSON.stringify(newEntity));
	});

	describe('constructor', () => {
		it('constructs the rule picker dialog component', () => {
			runConstructor('d2l-discover-rule-picker-dialog');
		});
	});

	describe('accessibility', () => {
		it('should pass all aXe tests', async() => {
			const el = await fixture(html`<d2l-discover-rule-picker-dialog></d2l-discover-rule-picker-dialog>`);
			const elFull = await createComponentAndWait(html`
				<d2l-discover-rule-picker-dialog href="${selfHref}" token="cake"></d2l-discover-rule-picker-dialog>
			`);
			await expect(el).to.be.accessible();
			await expect(elFull).to.be.accessible();
		});
	});

	describe('functionality', () => {
		let el;
		beforeEach(async() => {
			el = await createComponentAndWait(html`
				<d2l-discover-rule-picker-dialog href="${selfHref}" token="cake"></d2l-discover-rule-picker-dialog>
			`);
			clearStore();
		});
		afterEach(() => fetchMock.resetHistory());

		it('makes a copy of the conditions when the dialog is opened', async() => {
			el.opened = true;
			expect(el._copiedConditions).to.have.lengthOf(0);
			await el.updateComplete;
			expect(el._copiedConditions).to.deep.equal(el.conditions);
		});

		it('resets the conditions back to their original form when cancel is pressed', async() => {
			el.opened = true;
			await el.updateComplete;
			const oldConditions = [...el.conditions];
			// simulate removal
			const rulePicker = el.shadowRoot.querySelector('d2l-discover-rule-picker');
			rulePicker.conditions.splice(0, 1);

			await rulePicker.updateComplete;
			expect(rulePicker.conditions).to.have.lengthOf(2);
			await el.updateComplete;
			// click cancel
			el.shadowRoot.querySelectorAll('d2l-button')[1].click();
			await el.updateComplete;
			expect(el.conditions).to.deep.equal(oldConditions);
		});

		it('updates the state and commits action when done is pressed', async() => {
			el.opened = true;
			await el.updateComplete;
			// simulate removal
			const rulePicker = el.shadowRoot.querySelector('d2l-discover-rule-picker');
			rulePicker.conditions.splice(0, 1);

			await rulePicker.updateComplete;
			expect(rulePicker.conditions).to.have.lengthOf(2);
			await el.updateComplete;

			expect(el._hasAction('updateConditions')).to.be.true;
			const spy = sinon.spy(el.updateConditions, 'commit');
			// click done
			el.shadowRoot.querySelector('d2l-button[primary]').click();
			await el.updateComplete;
			const expectedCommit = {
				conditions: JSON.stringify([
					{ type: 'Fruit', value: 'Orange' },
					{ type: 'Entree', value: 'Cake' }
				])
			};
			expect(el.conditions).to.deep.equal(rulePicker.conditions);
			expect(spy.calledWith(expectedCommit)).to.be.true;
		});
	});

	describe('rule creation', () => {
		let el;
		beforeEach(async() => {
			el = await createComponentAndWait(html`
				<d2l-discover-rule-picker-dialog href="${newEntityHref}" token="cake"></d2l-discover-rule-picker-dialog>
			`);
			clearStore();
		});
		afterEach(() => fetchMock.resetHistory());

		it.skip('throws a rule creation event and resets the dialog when done is pressed', async() => {
			el.opened = true;
			await el.updateComplete;
			const rulePicker = el.shadowRoot.querySelector('d2l-discover-rule-picker');
			// get the default condition
			await rulePicker.updateComplete;
			const defaultCondition = rulePicker.conditions[0];
			const newCondition = {
				properties: {
					type: 'Fruit',
					value: 'Apple'
				}
			};
			// add a condition to a the rule
			rulePicker.conditions[0] = newCondition;
			await rulePicker.updateComplete;
			const listener = oneEvent(el, 'd2l-discover-rule-created');
			// click done button
			el.shadowRoot.querySelector('d2l-button[primary]').click();
			const { detail } = await listener;
			expect(detail.conditions[0], 'event has new condition information').to.equal(newCondition);
			expect(rulePicker.conditions, 'conditions are reset to empty').to.deep.equal([ defaultCondition ]);
		});
	});

});
