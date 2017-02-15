'use babel';

import SrtHelperView from './srt-helper-view';
import { CompositeDisposable } from 'atom';

export default
{
	srtHelperView: null,
	subscriptions: null,
	destEditor: null,

 	activate(state)
	{
		// Modal panel that allows the user to choose the destination editor.
		this.srtHelperView = new SrtHelperView();

	    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
	    this.subscriptions = new CompositeDisposable();

	    // Register command that toggles this view
	    this.subscriptions.add(atom.commands.add('atom-workspace', {
	      'srt-helper:srtCopyPaste': () => this.srtCopyPaste()
	    }));
  	},

  	deactivate()
	{
    	this.subscriptions.dispose();
		this.srtHelperView.destroy();
  	},

  	serialize()
	{

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
	 * Callback function that does the actual replacement of the '- Untranslated subtitle -'
	 */
	replaceString(untranslatedSub)
	{
		let currentEditor = atom.workspace.getActiveTextEditor();
		let selectedText = currentEditor.getSelectedText();

		untranslatedSub.stop();
		untranslatedSub.replace(selectedText);
	},

	/*
	 * Replaces the '- Untranslated subtitle -' string by the text that was selected by the user.
	 */
	srtCopyPaste()
  	{
    	if (this.destEditor !== null)
			this.destEditor.scan(new RegExp('^- Untranslated subtitle -$', 'i'), this.replaceString);
		else
			this.srtChooseDestEditor();
  	},

	/*
	 * Shows a modal panel in which the user can choose the destination editor in which the
	 * strings will be replaced.
	 */
	srtChooseDestEditor()
	{
		if (!this.srtHelperView.isPanelVisible())
			this.srtHelperView.showPanel();
	}
};