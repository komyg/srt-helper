'use babel';

import SrtHelperView from './srt-helper-view';
import { CompositeDisposable } from 'atom';
import { Point } from 'atom';

export default
{
	srtHelperView: null,
	subscriptions: null,
	destEditor: null,
	toggleChangeCase: null,
	toggleDecoration: null,

 	activate(state)
	{
		var self = this;

		// Get serialized state.
		if (typeof(state) === 'undefined' || state === null)
		{
			this.toggleChangeCase = true;
			this.toggleDecoration = true;
		}
		else
		{
			if (typeof(state.toggleChangeCase) === 'undefined' || state.toggleChangeCase === null)
				this.toggleChangeCase = true;
			else
				this.toggleChangeCase = state.toggleChangeCase;

			if (typeof(state.toggleDecoration) === 'undefined' || state.toggleDecoration === null)
				this.toggleDecoration = true;
			else
				this.toggleDecoration = state.toggleDecoration;
		}

		// Modal panel that allows the user to choose the destination editor.
		this.srtHelperView = new SrtHelperView();

	    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
	    this.subscriptions = new CompositeDisposable();

	    // Register commands
	    this.subscriptions.add(atom.commands.add('atom-workspace', {
	      'srt-helper:srtCopyPaste': () => this.srtCopyPaste()
	    }));

		this.subscriptions.add(atom.commands.add('atom-workspace', {
	      'srt-helper:srtChooseDestEditor': () => this.srtChooseDestEditor()
	    }));

		this.subscriptions.add(atom.commands.add('atom-workspace', {
	      'srt-helper:toggleDecorationOnOff': () => this.toggleDecorationOnOff()
	    }));

		this.subscriptions.add(atom.commands.add('atom-workspace', {
	      'srt-helper:toggleChangeCaseOnOff': () => this.toggleChangeCaseOnOff()
	    }));
  	},

  	deactivate()
	{
    	this.subscriptions.dispose();
		this.srtHelperView.destroy();
  	},

  	serialize()
	{
		let state = { 'toggleDecoration': this.toggleDecoration, 'toggleChangeCase': this.toggleChangeCase };
		return state;
  	},

	/*
	 * Sets the destination editor that will be used for the string replacement.
	 * Returns true if the editor was found and the variable was succesfully set, otherwise returns false
	 */
	setDestEditor(fileName)
	{
		let i, result;
		let editors = atom.workspace.getTextEditors();

		result = false;

		for (i = 0; i < editors.length; i++)
		{
			if (editors[i].getTitle() == fileName)
			{
				this.destEditor = editors[i];
				result = true;
				break;
			}
		}

		return result;
	},

	/*
	 * Changes the case of the words all the of the received string from UPPER CASE to Title Case.
	 */
	changeCase(str)
	{
		let titleCaseStr;
		let r = new RegExp('\\b[A-Z0-9]+\\b', 'g');

		titleCaseStr = str.replace(r, (text) =>
		{
			return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
		});

		return titleCaseStr;
	},

	/*
	 * Sets the cursor of a text editor to a given range and scrolls to it, if necessary.
	 */
	scrollTextEditor(editor, range)
	{
		// Get visible rows.
		let startRow = editor.presenter.startRow;
		let endRow = startRow + editor.presenter.endRow - 4;

		// Move the cursor to the replaced text.
		// Note: don't use autoscroll, because it doesn't center the text editor.
		editor.setCursorBufferPosition(range.start, { autoscroll: false });

		// If the range is not visible, scroll the editor to it and center it.
		if (!(range.start.row >= startRow && range.end.row < endRow))
		{
			let scrollPosition = new Point(range.start.row + 4, 0)
			editor.scrollToBufferPosition(scrollPosition, { center: true });
		}
	},

	/*
	 * Callback function that does the actual replacement of the '- Untranslated subtitle -'
	 */
	replaceString(untranslatedSub)
	{
		let currentEditor = atom.workspace.getActiveTextEditor();
		let selectedText = currentEditor.getSelectedText();

		untranslatedSub.stop();

		// Only replaces text if there is a selection.
		if (selectedText !== '')
		{
			if (this.toggleDecoration)
			{
				let range = currentEditor.getSelectedBufferRange();
				let marker = currentEditor.markBufferRange(range, { invalidate: 'never' });
				currentEditor.decorateMarker(marker, {type: 'highlight', class: 'copied-text'});
			}

			if (this.toggleChangeCase)
				selectedText = this.changeCase(selectedText);

			// Replace the text.
			untranslatedSub.replace(selectedText);

			// Set the cursor position to the copied text and scrolls the editor to it, if necessary.
			this.scrollTextEditor(this.destEditor, untranslatedSub.range);
		}
	},

	/*
	 * Replaces the '- Untranslated subtitle -' string by the text that was selected by the user.
	 */
	srtCopyPaste()
  	{
    	if (this.destEditor !== null && this.destEditor.alive)
			this.destEditor.scan(new RegExp('^- Untranslated subtitle -$', 'i'), this.replaceString.bind(this));
		else
			this.srtChooseDestEditor(this.chooseDestEditorCallback.bind(this));
  	},

	/*
	 * Shows a modal panel in which the user can choose the destination editor in which the
	 * strings will be replaced.
	 */
	srtChooseDestEditor()
	{
		if (!this.srtHelperView.isPanelVisible())
			this.srtHelperView.showPanel(this.chooseDestEditorCallback.bind(this));
	},

	/*
	 * Toggles the decoration of the text that was already selected.
	 */
	toggleDecorationOnOff()
	{
		if (this.toggleDecoration)
			this.toggleDecoration = false;
		else
			this.toggleDecoration = true;
	},

	/*
	 * Toggles the chaning of the selected text case from CAPTIAL CASE to Title Case.
	 */
	toggleChangeCaseOnOff()
	{
		if (this.toggleChangeCase)
			this.toggleChangeCase = false;
		else
			this.toggleChangeCase = true;
	},

	/*
	 * Callback that is executed when the destination editor is choosen by the user.
	 */
	chooseDestEditorCallback(editorFileName)
	{
		if (editorFileName != null)
			this.setDestEditor(editorFileName);
	}
};
