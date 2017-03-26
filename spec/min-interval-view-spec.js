'use babel';

import FileHelper from '../lib/file-helper';
import MinIntervalView from '../lib/min-interval-view';

describe('MinIntervalView', () =>
{
	let minIntervalView;

	beforeEach(() =>
	{
		minIntervalView = new MinIntervalView();
	});

	describe('MinIntervalView unit tests', () =>
	{
		it('setPanelHeading - should set the panel heading', () =>
		{
			// Setup
			let fakeHeading = jasmine.createSpyObj('fakeHeading', ['textContent']);
			spyOn(document, 'getElementById').andReturn(fakeHeading);

			// Test
			minIntervalView.setPanelHeading('Lorem ipsum');

			// Assert
			expect(fakeHeading.textContent).toEqual('Lorem ipsum');
		});

	});

	describe('MinIntervalView integration tests', () =>
	{
		let activationPromise;
		let workspaceElement;

		beforeEach(() =>
		{
			// Get activation promise
			activationPromise = atom.packages.activatePackage('srt-helper');

			// Attaches jasmine to the DOM
			workspaceElement = atom.views.getView(atom.workspace);
			jasmine.attachToDOM(workspaceElement);

			// Activate the package.
			atom.commands.dispatch(workspaceElement, 'srt-helper:activate');

			// Wait for the package activation to finish.
			waitsForPromise(() =>
			{
				return activationPromise;
			});
		});

		xit('should return a number when the ok button is pressed', () =>
		{
			let buttonClicked = false;

			spyOn(minIntervalView, 'minSubtitleIntervalCallback').andCallFake(interval => {
				console.log('Callback called!')
				expect(interval).toEqual(500);
				buttonClicked = true;
			});

			// Shows the modal panel.
			minIntervalView.showPanel();

			// Check if the panel is visible
			let minIntervalViewElement = workspaceElement.querySelector('.min-interval-view');
			//expect(minIntervalViewElement).toBeVisible();

			// Set the min interval value
			let inputText = minIntervalViewElement.querySelector('.input-text');
			inputText.value = 500;

			// Presse the ok button.
			let okButton = minIntervalViewElement.querySelector('.ok-button');
			okButton.click();
		});

	});

});
