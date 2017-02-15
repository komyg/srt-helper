'use babel';

import SrtHelper from '../lib/srt-helper';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('SrtHelper', () =>
{
	let workspaceElement, activationPromise;

	beforeEach(() =>
	{
		workspaceElement = atom.views.getView(atom.workspace);
		activationPromise = atom.packages.activatePackage('srt-helper');
	});

	describe('when the - Untranslated subtilte - string is found', () =>
	{
		it('should replace the - Untranslated subtitle - with the selectedText', () =>
		{
			let fakeEditor, fakeIterator;

			// Build fake iterator object.
			fakeIterator = jasmine.createSpyObj('fakeIterator', ['stop', 'replace']);

			fakeIterator.replace.andCallFake((replacementText) => {
				fakeIterator.newText = replacementText;
			});

			// Build fake text editor.
			fakeEditor = atom.workspace.buildTextEditor();
			spyOn(atom.workspace, 'getActiveTextEditor').andReturn(fakeEditor);
			spyOn(fakeEditor, 'getSelectedText').andReturn('Lorem ipsum')

			SrtHelper.replaceString(fakeIterator);

			expect(fakeIterator.newText).toEqual('Lorem ipsum');

		});
	});

/*
	  describe('when the srt-helper:toggle event is triggered', () => {
		  it('hides and shows the modal panel', () => {
			  // Before the activation event the view is not on the DOM, and no panel
			  // has been created
			  expect(workspaceElement.querySelector('.srt-helper')).not.toExist();

			  // This is an activation event, triggering it will cause the package to be
			  // activated.
			  atom.commands.dispatch(workspaceElement, 'srt-helper:toggle');

			  waitsForPromise(() => {
				  return activationPromise;
			  });

			  runs(() => {
				  expect(workspaceElement.querySelector('.srt-helper')).toExist();

				  let srtHelperElement = workspaceElement.querySelector('.srt-helper');
				  expect(srtHelperElement).toExist();

				  let srtHelperPanel = atom.workspace.panelForItem(srtHelperElement);
				  expect(srtHelperPanel.isVisible()).toBe(true);
				  atom.commands.dispatch(workspaceElement, 'srt-helper:toggle');
				  expect(srtHelperPanel.isVisible()).toBe(false);
			  });
	    });

		it('hides and shows the view', () => {
			// This test shows you an integration test testing at the view level.

			// Attaching the workspaceElement to the DOM is required to allow the
			// `toBeVisible()` matchers to work. Anything testing visibility or focus
			// requires that the workspaceElement is on the DOM. Tests that attach the
			// workspaceElement to the DOM are generally slower than those off DOM.
			jasmine.attachToDOM(workspaceElement);

			expect(workspaceElement.querySelector('.srt-helper')).not.toExist();

			// This is an activation event, triggering it causes the package to be
			// activated.
			atom.commands.dispatch(workspaceElement, 'srt-helper:toggle');

			waitsForPromise(() => {
				return activationPromise;
			});

			runs(() => {
				// Now we can test for view visibility
				let srtHelperElement = workspaceElement.querySelector('.srt-helper');
				expect(srtHelperElement).toBeVisible();
				atom.commands.dispatch(workspaceElement, 'srt-helper:toggle');
				expect(srtHelperElement).not.toBeVisible();
			});
		});
	});
	*/
});
