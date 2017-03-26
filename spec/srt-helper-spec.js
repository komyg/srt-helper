'use babel';

import SrtHelper from '../lib/srt-helper';
import { Point } from 'atom';
import { Range } from 'atom';

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
			let fakeEditor, fakeIterator, fakeDestEditor;

			// Build fake iterator object.
			fakeIterator = jasmine.createSpyObj('fakeIterator', ['stop', 'range', 'replace']);

			fakeIterator.replace.andCallFake((replacementText) => {
				fakeIterator.newText = replacementText;
			});

			//fakeDestEditor.setCursorBufferPosition.andReturn('');
			SrtHelper.destEditor = fakeDestEditor;

			// Build fake text editor.
			fakeEditor = atom.workspace.buildTextEditor();
			spyOn(atom.workspace, 'getActiveTextEditor').andReturn(fakeEditor);
			spyOn(fakeEditor, 'getSelectedText').andReturn('Lorem ipsum')
			spyOn(fakeEditor, 'decorateMarker');

			// Make sure this method does not interfere with the test.
			spyOn(SrtHelper, 'scrollTextEditor').andReturn('');

			SrtHelper.replaceString(fakeIterator);

			// Check if the replaced text matches.
			expect(fakeIterator.newText).toEqual('Lorem ipsum');

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
			let chosenEditor = SrtHelper.getEditor('dummy-srt-file.srt');

			// Assert
			expect(chosenEditor.getTitle()).toEqual('dummy-srt-file.srt');
		});

		it('should transform upper case string into title case string', () =>
		{
			let testStr = 'LOREM I1PSUM dolor SIT AMET, 22,';
			let result;

			result = SrtHelper.changeCase(testStr);

			expect(result).toEqual('Lorem I1psum dolor Sit Amet, 22,');
		});

		it('should scroll the text editor to the current cursor', () =>
		{
			let fakeEditor, fakePresenter, fakeRange, fakeRangeStart, fakeRangeEnd;

			// Setup

			fakePresenter = jasmine.createSpyObj('fakePresenter', ['startRow', 'endRow']);
			fakePresenter.startRow.andReturn(0);
			fakePresenter.endRow.andReturn(14);

			fakeEditor = jasmine.createSpyObj('fakeEditor', ['presenter', 'setCursorBufferPosition', 'scrollToBufferPosition']);
			fakeEditor.presenter.andReturn(fakePresenter);

			fakeRange = jasmine.createSpyObj('fakeRange', ['start', 'end']);
			fakeRange.start.andReturn(fakeRangeStart);
			fakeRange.end.andReturn(fakeRangeEnd);

			fakeRangeStart = jasmine.createSpyObj('fakePoint', ['row']);
			fakeRangeStart.row.andReturn(20);

			fakeRangeEnd = jasmine.createSpyObj('fakePoint', ['row']);
			fakeRangeEnd.row.andReturn(20);

			// Test

			SrtHelper.scrollTextEditor(fakeEditor, fakeRange);

			// Assert

			// Check if the cursor was moved.
			expect(fakeEditor.setCursorBufferPosition).toHaveBeenCalled();

			// Since our range is further than the current displayed text,
			// check if the editor was scrolled.
			expect(fakeEditor.scrollToBufferPosition).toHaveBeenCalled();
		});

		it('should set the destinationEditor if the returned value is not null', () =>
		{
			let fakeEditor = 'fakeEditor'

			spyOn(SrtHelper, 'getEditor').andReturn(fakeEditor);

			SrtHelper.chooseDestEditorCallback(null);

			// Should not call setDestEditor, because the value is null (the user clicked the cancel button)
			expect(SrtHelper.getEditor).not.toHaveBeenCalled();

			SrtHelper.chooseDestEditorCallback('dummy-srt-file.srt');

			// Should callsetDestEditor, because the user selected a file.
			expect(SrtHelper.getEditor).toHaveBeenCalledWith('dummy-srt-file.srt');

			expect(SrtHelper.destEditor).toEqual(fakeEditor);

			// Teardown
			SrtHelper.destEditor = null;
		});

		it('should find the subtitle id', () =>
		{
			// Create dummy text editor
			let dummyRange, subtitleId;
			let dummyEditor = atom.workspace.buildTextEditor();
			dummyEditor.insertText('126\n');
			dummyEditor.insertText('00:01:04,620 --> 00:01:07,000\n');
			dummyEditor.insertText('- Untranslated subtitle -\n');
			dummyEditor.insertText('\n');
			dummyEditor.insertText('127\n');
			dummyEditor.insertText('00:01:04,620 --> 00:01:07,000\n');
			dummyEditor.insertText('- Untranslated subtitle -');

			dummyEditor.setCursorBufferPosition([6, 0]);

			// Create dummy range, to simulate the found - Untranslated Subtitle - text.
			dummyRange = new Range(new Point(6, 0), new Point(6, 25));

			// Test function
			subtitleId = SrtHelper.getSubtitleId(dummyEditor, dummyRange);

			// Assert
			expect(subtitleId).toEqual(['127']);
		});

		it('should find the range of a given string', () =>
		{
			// Create dummy text editor
			let dummyRange, range;
			let dummyEditor = atom.workspace.buildTextEditor();
			dummyEditor.insertText('126\n');
			dummyEditor.insertText('00:01:04,620 --> 00:01:07,000\n');
			dummyEditor.insertText('- Untranslated subtitle -\n');
			dummyEditor.insertText('\n');
			dummyEditor.insertText('127\n');
			dummyEditor.insertText('00:01:04,620 --> 00:01:07,000\n');
			dummyEditor.insertText('- Untranslated subtitle -');

			// Test function
			range = SrtHelper.findStrInEditor(dummyEditor, '127');

			// Assert
			expect(range.start.row).toEqual(4);
		});

		it('should find and replace a subtitle time code if its difference is less than 500 milliseconds', () =>
		{
			let foundValue;
			const dummyEditor = atom.workspace.buildTextEditor();
			dummyEditor.insertText('126\n');
			dummyEditor.insertText('00:01:04,620 --> 00:01:07,000\n');
			dummyEditor.insertText('Lorem ipsum\n');
			dummyEditor.insertText('\n');
			dummyEditor.insertText('127\n');
			dummyEditor.insertText('00:01:07,200 --> 00:01:08,000\n');
			dummyEditor.insertText('dolor sit amet\n');
			dummyEditor.insertText('\n');
			dummyEditor.insertText('128\n');
			dummyEditor.insertText('00:01:09,001 --> 00:01:09,200\n');
			dummyEditor.insertText('consectetur adipiscing elit.\n');
			dummyEditor.insertText('\n');
			dummyEditor.insertText('129\n');
			dummyEditor.insertText('00:01:09,001 --> 00:01:09,200\n');
			dummyEditor.insertText('consectetur adipiscing elit.');

			SrtHelper.linkSubtitles(dummyEditor, 500);

			const srtString = '126\n' +
												'00:01:04,620 --> 00:01:07,199\n' +
												'Lorem ipsum\n' +
												'\n' +
												'127\n' +
												'00:01:07,200 --> 00:01:08,000\n' +
												'dolor sit amet\n' +
												'\n' +
												'128\n' +
												'00:01:09,001 --> 00:01:09,200\n' +
												'consectetur adipiscing elit.\n' +
												'\n' +
												'129\n' +
												'00:01:09,001 --> 00:01:09,200\n' +
												'consectetur adipiscing elit.';

			expect(dummyEditor.getText()).toEqual(srtString);
		});

		it('should get the start and end times of a subtitle', () =>
		{
			let subTimeCodeStr = '00:01:04,620 --> 00:01:07,000';

			let timeCode = SrtHelper.getSubtitleTimeCode(subTimeCodeStr);

			expect(timeCode).toEqual({
				start: new Date(0, 0, 0, 0, 1, 4, 620),
				end: new Date(0, 0, 0, 0, 1, 7, 000),
			});
		});

		it('should generate a time code string', () =>
		{
			let sub = { start: new Date(0, 0, 0, 0, 1, 4, 620),
									end: new Date(0, 0, 0, 0, 1, 7, 10) };

			let result = SrtHelper.generateSubtitleTimeCodeStr(sub);

			expect(result).toEqual('00:01:04,620 --> 00:01:07,010');

			sub = { start: new Date(0, 0, 0, 0, 0, 0, 0),
							end: new Date(0, 0, 0, 0, 15, 27, 992) };

			result = SrtHelper.generateSubtitleTimeCodeStr(sub);

			expect(result).toEqual('00:00:00,000 --> 00:15:27,992');
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
			SrtHelper.chooseDestEditorCallback('dummy-srt-file.srt')

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
				//atom.commands.dispatch(workspaceElement, 'srt-helper:srtCopyPaste');
			});
		});

		it ('does not show the view when the destination editor is set', () =>
		{
			SrtHelper.chooseDestEditorCallback('dummy-srt-file.srt');

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
				//atom.commands.dispatch(workspaceElement, 'srt-helper:srtCopyPaste');
			});
		});

		it ('should store the toggleChangeCase and toggleDecoration status', () =>
		{
			SrtHelper.chooseDestEditorCallback('dummy-srt-file.srt');

			expect(workspaceElement.querySelector('.srt-helper')).not.toExist();

			// This is an activation event, triggering it causes the package to be activated.
			atom.commands.dispatch(workspaceElement, 'srt-helper:srtCopyPaste');

			waitsForPromise(() =>
			{
				return activationPromise;
			});

			runs(() =>
			{
				let toggleChangeCase, toggleDecoration;

				// These values must be set at the activation.
				toggleDecoration = SrtHelper.toggleDecoration;
				toggleChangeCase = SrtHelper.toggleChangeCase;

				expect(toggleDecoration).not.toBeNull();
				expect(toggleChangeCase).not.toBeNull();

				// Check if the values changed.
				atom.commands.dispatch(workspaceElement, 'srt-helper:toggleDecorationOnOff');
				expect(toggleDecoration).not.toEqual(SrtHelper.toggleDecoration);

				atom.commands.dispatch(workspaceElement, 'srt-helper:toggleChangeCaseOnOff');
				expect(toggleChangeCase).not.toEqual(SrtHelper.toggleChangeCase);

				// Return the values to their original state.
				atom.commands.dispatch(workspaceElement, 'srt-helper:toggleDecorationOnOff');
				expect(toggleDecoration).toEqual(SrtHelper.toggleDecoration);

				atom.commands.dispatch(workspaceElement, 'srt-helper:toggleChangeCaseOnOff');
				expect(toggleChangeCase).toEqual(SrtHelper.toggleChangeCase);
			});
		});

		afterEach(() =>
		{
			// Set the destination editor to null.
			SrtHelper.destEditor = null;
		});
	});
});
