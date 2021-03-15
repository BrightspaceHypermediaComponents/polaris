import '../d2l-discover-attribute-picker.js';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { clearStore } from '@brightspace-hmc/foundation-engine/state/HypermediaState.js';
import { createComponentAndWait } from '../../../test/test-util.js';
import { default as fetchMock } from 'fetch-mock/esm/client.js';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

// returns either the event or the returnValIfTimeout, whichever is resolved first
const timeout = 1000;
async function verifyEventTimeout(listener, returnValIfTimeout) {
	return await Promise.race([
		listener,
		new Promise(resolve => setTimeout(() => resolve(returnValIfTimeout), timeout))
	]);
}

const attributeListA = ['one', 'lemon'];
const attributeListB = ['six', 'potato'];

const assignableValuesA = ['one', 'two', 'three', 'four', 'five'];
const assignableValuesB = ['six', 'seven', 'eight', 'nine', 'ten'];

const conditionTypeAHref = 'http://condition-type-a';
const conditionTypeBHref = 'http://condition-type-b';
const possibleValuesAHref = 'http://possible-values-a/?n=e';
const possibleValuesBHref = 'http://possible-values-b/?n=e';

const conditionTypeA = {
	actions: [{
		name: 'possible-values',
		href: possibleValuesAHref,
		method: 'GET'
	}],
	properties: {
		type: 'conditionTypeA'
	},
	rel: ['condition-type']
};

const conditionTypeB = {
	actions: [{
		name: 'possible-values',
		href: possibleValuesBHref,
		method: 'GET'
	}],
	properties: {
		type: 'conditionTypeB'
	},
	rel: ['condition-type']
};

const possibleValuesA = {
	properties: {
		values: assignableValuesA
	}
};

const possibleValuesB = {
	properties: {
		values: assignableValuesB
	}
};

describe('d2l-discover-attribute-picker', () => {
	before(() => {
		fetchMock
			.mock(conditionTypeAHref, JSON.stringify(conditionTypeA))
			.mock(conditionTypeBHref, JSON.stringify(conditionTypeB))
			.mock(possibleValuesAHref, JSON.stringify(possibleValuesA))
			.mock(possibleValuesBHref, JSON.stringify(possibleValuesB));
	});

	describe('constructor', () => {
		it('constructs the attribute picker component', () => {
			runConstructor('d2l-discover-attribute-picker');
		});
	});

	describe('accessibility', () => {
		it('should pass all aXe tests', async() => {
			const el = await fixture(html`<d2l-discover-attribute-picker></d2l-discover-attribute-picker>`);
			const elFull = await createComponentAndWait(html`
				<d2l-discover-attribute-picker href="${conditionTypeAHref}" token="cake"></d2l-discover-attribute-picker>
			`);
			await expect(el).to.be.accessible();
			await expect(elFull).to.be.accessible();
		});
	});

	describe('rendering', () => {
		let el;
		beforeEach(async() => el = await createComponentAndWait(html`
			<d2l-discover-attribute-picker href="${conditionTypeAHref}" token="cake" .attributeList=${attributeListA}></d2l-discover-attribute-picker>
		`));

		beforeEach(() => clearStore());
		afterEach(() => fetchMock.resetHistory());

		it('assigns the conditionTypes possible values', async() => {
			const conditionD2LPicker = el.shadowRoot.querySelector('d2l-labs-attribute-picker');

			//Wait for the assignable attributes update to go through
			await new Promise(resolve => setTimeout(resolve, 100));
			expect(conditionD2LPicker.assignableAttributes).to.deep.equal(assignableValuesA);
		});

		it('switches the conditionTypes possible values if the href changes', async() => {
			const conditionD2LPicker = el.shadowRoot.querySelector('d2l-labs-attribute-picker');

			//Wait for the assignable attributes update to go through
			await new Promise(resolve => setTimeout(resolve, 100));

			el.href = conditionTypeBHref;
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(conditionD2LPicker.assignableAttributes).to.deep.equal(assignableValuesB);
		});

		it('renders the assigned attribute list values', async() => {
			const conditionD2LPicker = el.shadowRoot.querySelector('d2l-labs-attribute-picker');
			await conditionD2LPicker.updateComplete;
			expect(conditionD2LPicker.attributeList[0]).to.equal(attributeListA[0]);
			expect(conditionD2LPicker.attributeList[1]).to.equal(attributeListA[1]);
		});

		it('Updates the assigned attribute list values if a new collection is passed', async() => {
			const conditionD2LPicker = el.shadowRoot.querySelector('d2l-labs-attribute-picker');
			await conditionD2LPicker.updateComplete;

			el.attributeList = attributeListB;
			await conditionD2LPicker.updateComplete;

			expect(conditionD2LPicker.attributeList.length).to.equal(attributeListB.length);
			expect(conditionD2LPicker.attributeList[0]).to.equal(attributeListB[0]);
			expect(conditionD2LPicker.attributeList[1]).to.equal(attributeListB[1]);
		});
	});

	describe('eventing', () => {
		let el;
		beforeEach(async() => el = await createComponentAndWait(html`
			<d2l-discover-attribute-picker href="${conditionTypeAHref}" token="cake" .attributeList=${attributeListA}></d2l-discover-attribute-picker>
		`));

		it('fires the attributes-changed event when the inner attribute list is modified', async() => {
			const conditionD2LPicker = el.shadowRoot.querySelector('d2l-labs-attribute-picker');
			await conditionD2LPicker.updateComplete;

			const listener = oneEvent(el, 'attributes-changed');

			conditionD2LPicker._addAttribute('Zebra');

			const result = await verifyEventTimeout(listener, 'no event fired');
			expect(result).to.not.equal('no event fired');
			expect(result.detail.attributeList[2]).to.equal('Zebra');
		});
	});

});
