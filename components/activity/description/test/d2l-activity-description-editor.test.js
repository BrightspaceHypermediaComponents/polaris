/* eslint-disable no-undef */
import '../d2l-activity-description-editor.js';
import { addToMock, mockLink } from '../../../../test/data/fetchMock.js';
import { assert, elementUpdated, html } from '@open-wc/testing';
import { createComponentAndWait, delayAndAwaitForElement, fireEventAndWait } from '../../../../test/test-util.js';
import { learningPathExisting, learningPathMissingAction, learningPathNew, learningPathUpdated } from '../../../../test/data/learningPath.js';
import { clearStore } from '@brightspace-hmc/foundation-engine/state/HypermediaState.js';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';
import sinon from 'sinon/pkg/sinon-esm.js';

// use the learningPathUpdated description as the text when updating textareas
const updatedDescriptionText = 'updated description text';
const textAreaLabel = 'd2l-input-textarea';

async function _createDescriptionEditor(path) {
	return await createComponentAndWait(html`<d2l-activity-description-editor href="${path}" token="test-token"></d2l-activity-description-editor>`);
}

async function _fireTextareaInputEvent(element, updatedText) {
	const textarea = element.shadowRoot.querySelector(textAreaLabel);
	textarea.value = updatedText;
	await fireEventAndWait(textarea, 'input', element);
}

describe('d2l-activity-description-editor', () => {

	before(async() => {
		mockLink.reset();
		await addToMock('/learning-path/new', learningPathNew, _createDescriptionEditor, false);
		await addToMock('/learning-path/existing', learningPathExisting, _createDescriptionEditor);
		await addToMock('/learning-path/missing-action', learningPathMissingAction, _createDescriptionEditor, false);
		await addToMock('/description/update', learningPathUpdated, _createDescriptionEditor);
	});
	after(() => {
		mockLink.reset();
	});

	describe('constructor', () => {

		it('should construct', () => {
			runConstructor('d2l-activity-description-editor');
		});
	});

	describe('Component', () => {

		beforeEach(async() => {
			clearStore();
		});

		afterEach(() => {
			mockLink.resetHistory();
		});

		it('should initialize using defined path and expected values', async() => {
			const element = await _createDescriptionEditor('/learning-path/new');

			// paths should be followed
			assert.isTrue(mockLink.called('path:/learning-path/new'), '/learing-path/new was not called');
			assert.isTrue(mockLink.called('path:/learning-path/new/object'), '/learing-path/new/object was not called');

			assert.equal(element.description, learningPathNew.properties.description, 'description property should match');
		});

		describe('path:/learning-path/existing', () => {
			let element;
			beforeEach(async() => {
				clearStore();
				element = await _createDescriptionEditor('/learning-path/existing');
				assert.equal(element.description, learningPathExisting.properties.description, 'description should match response');
			});

			it('description should be set when one is provided', async() => {
				// new path should be followed
				assert.isTrue(mockLink.called('path:/learning-path/existing'), '/learing-path/exiting was not called');
				assert.isTrue(mockLink.called('path:/learning-path/existing/object'), '/learning-path/existing/object was not called');

				assert.equal(element.shadowRoot.querySelector(textAreaLabel).value,
					learningPathExisting.properties.description, 'textarea value does not match');

				assert.equal(element.description, learningPathExisting.properties.description, 'description property should match');
			});

			it('updating should commit state', async() => {
				const spy = sinon.spy(element.updateDescription);
				await _fireTextareaInputEvent(element, updatedDescriptionText);

				assert.equal(element.description, updatedDescriptionText, 'description was updated to match');
				assert.isTrue(spy.commit.called, 'Commit should be called when input event is triggered');
			});

			/* 	These are out of scope, but provided basic mock up for save / cancel
			*	Still need to figure out how to wait for element to be updated after push / reset
			*/
			it('pushing state should save description', async() => {
				await _fireTextareaInputEvent(element, updatedDescriptionText);

				element._state.push();
				await delayAndAwaitForElement(element, 100);

				assert.isTrue(mockLink.called('path:/description/update'), 'Updated path was not called');
				assert.equal(element.description, updatedDescriptionText, 'description should be updated after a push');

				const textarea = element.shadowRoot.querySelector(textAreaLabel);
				assert.equal(textarea.value, updatedDescriptionText, 'textarea value should be updated');
			});

			it('reset state should revert description and textarea', async() => {
				await _fireTextareaInputEvent(element, updatedDescriptionText);

				assert.equal(element.description, updatedDescriptionText, 'description should be updated');

				const spy = sinon.spy(element);
				element._state.reset();
				await elementUpdated(element);

				assert.equal(element.description, learningPathExisting.properties.description, 'description should be reset');
				assert.isTrue(spy.render.called);

				const textarea2 = element.shadowRoot.querySelector(textAreaLabel);
				assert.equal(textarea2.value, learningPathExisting.properties.description, 'textarea value should be reset');
			});

		});
		describe('path:/learning-path/missing-action', () => {
			let element;
			beforeEach(async() => {
				clearStore();
				element = await _createDescriptionEditor('/learning-path/missing-action');
				assert.equal(element.description, learningPathMissingAction.properties.description, 'description should match response');
			});

			it('description should not be updated because action is missing', async() => {
				await _fireTextareaInputEvent(element, updatedDescriptionText);

				assert.equal(element.description, learningPathMissingAction.properties.description, 'description property should match');
			});
		});
	});
});
