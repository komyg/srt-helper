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

	describe('SrtHelper Unit Tests', () =>
	{
		it('should replace the - Untranslated subtitle - with the selectedText', () =>
		{
			let fakeEditor, fakeIterator, fakeDestEditor, fakePoint, fakeRange;

			fakePoint = [1, 2];

			// Build fake iterator object.
			fakeIterator = jasmine.createSpyObj('fakeIterator', ['stop', 'range', 'replace']);

			fakeIterator.replace.andCallFake((replacementText) => {
				fakeIterator.newText = replacementText;
			});

			// Build fake dest editor to test changing its cursor.
			fakeDestEditor = jasmine.createSpyObj('fakeDestEditor', ['setCursorBufferPosition']);
			fakeRange = jasmine.createSpyObj('fakeRange', ['start']);
			fakeIterator.range = fakeRange;
			fakeRange.start = fakePoint;

			//fakeDestEditor.setCursorBufferPosition.andReturn('');
			SrtHelper.destEditor = fakeDestEditor;

			// Build fake text editor.
			fakeEditor = atom.workspace.buildTextEditor();
			spyOn(atom.workspace, 'getActiveTextEditor').andReturn(fakeEditor);
			spyOn(fakeEditor, 'getSelectedText').andReturn('Lorem ipsum')
			spyOn(fakeEditor, 'decorateMarker');

			SrtHelper.replaceString(fakeIterator);

			// Check if the replaced text matches.
			expect(fakeIterator.newText).toEqual('Lorem ipsum');

			// Check if the buffer is set to the position of the repaced text.
			expect(fakeDestEditor.setCursorBufferPosition).toHaveBeenCalledWith(fakePoint, { autoscroll: false });

			// Check if the text that was copied was also highlited
			expect(fakeEditor.decorateMarker).toHaveBeenCalled();

			// Teardown
			SrtHelper.destEditor = null;
		});

		it('should select an editor from all open editors', () =>
		{
			// Setup
			let fakeTextEditor1 = jasmine.createSpyObj('fakeTextEditor', ['getTitle']);
			let fakeTextEditor2 = jasmine.createSpyObj('fakeTextEditor', ['getTitle']);
			let fakeTextEditorsArray = new Array();

			fakeTextEditor1.getTitle.andCallFake(() => { return 'dummy-file.txt' });
			fakeTextEditor2.getTitle.andCallFake(() => { return 'dummy-srt-file.srt' });

			fakeTextEditorsArray.push(fakeTextEditor1);
			fakeTextEditorsArray.push(fakeTextEditor2);

			spyOn(atom.workspace, 'getTextEditors').andReturn(fakeTextEditorsArray);

			// destEditor should be null the first time.
			expect(SrtHelper.destEditor).toBeNull();

			// Call function
			SrtHelper.setDestEditor('dummy-srt-file.srt');

			// Assert
			expect(SrtHelper.destEditor.getTitle()).toEqual('dummy-srt-file.srt');

			// Teardown
			SrtHelper.destEditor = null;
		});
	});

	describe('SrtHelper integration tests', () =>
	{
		beforeEach(() =>
		{
			let dummyFileTxtEditor;

			jasmine.attachToDOM(workspaceElement);

			// Open two dummy files in the text editor
			waitsForPromise(() =>
			{
				return atom.workspace.open('dummy-file.txt').then((editor) => {
					dummyFileTxtEditor = editor;
				});
			});

			waitsForPromise(() =>
			{
				return atom.workspace.open('dummy-srt-file.srt');
			});

			runs(() =>
			{
				atom.workspace.getActivePane().activateItem(dummyFileTxtEditor);
			});
		});

		it('should set the destination editor as dummy-srt-file', () =>
		{
			expect(SrtHelper.destEditor).toBeNull();

			// Choose destination editor.
			SrtHelper.setDestEditor('dummy-srt-file.srt')

			expect(SrtHelper.destEditor.getTitle()).toEqual('dummy-srt-file.srt');

			// Get the active text editor
			let activeEditor = atom.workspace.getActiveTextEditor();
			expect(activeEditor.getTitle()).toBe('dummy-file.txt');

			// Select some text from it.
			activeEditor.selectLeft(27);
			let selection = activeEditor.getSelectedText();

			// Add this text to the destination editor.
			SrtHelper.srtCopyPaste();

			// Check if the operation succeded.
			expect(SrtHelper.destEditor.getText()).toMatch(selection);
		});

		it('shows the view when the destination editor is not set', () =>
		{
			SrtHelper.destEditor = null;

			expect(workspaceElement.querySelector('.srt-helper')).not.toExist();

			// This is an activation event, triggering it causes the package to be activated.
			atom.commands.dispatch(workspaceElement, 'srt-helper:srtCopyPaste');

			waitsForPromise(() =>
			{
				return activationPromise;
			});

			runs(() =>
			{
				// Now we can test for view visibility
				let srtHelperElement = workspaceElement.querySelector('.srt-helper');
				expect(srtHelperElement).toBeVisible();
				atom.commands.dispatch(workspaceElement, 'srt-helper:srtCopyPaste');
			});
		});

		it ('does not show the view when the destination editor is set', () =>
		{
			SrtHelper.setDestEditor('dummy-srt-file.srt');

			expect(workspaceElement.querySelector('.srt-helper')).not.toExist();

			// This is an activation event, triggering it causes the package to be activated.
			atom.commands.dispatch(workspaceElement, 'srt-helper:srtCopyPaste');

			waitsForPromise(() =>
			{
				return activationPromise;
			});

			runs(() =>
			{
				// Now we can test for view visibility
				let srtHelperElement = workspaceElement.querySelector('.srt-helper');
				expect(srtHelperElement).not.toBeVisible();
				atom.commands.dispatch(workspaceElement, 'srt-helper:srtCopyPaste');
			});
		});

		afterEach(() =>
		{
			// Set the destination editor to null.
			SrtHelper.destEditor = null;
		});
	});
});
