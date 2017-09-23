'use babel';

import SrtHelperView from './srt-helper-view';
import MinIntervalView from './min-interval-view';
import { CompositeDisposable } from 'atom';
import { Point } from 'atom';
import { Range } from 'atom';

export default
{
	srtHelperView: null,
	minIntervalView: null,
	subscriptions: null,
	destEditor: null,
	companionEditor: null,
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

		this.minIntervalView = new MinIntervalView();
		this.minIntervalView.setMinSubtitleIntervalCallback(this.linkSubsCallback.bind(this));

	  // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
	  this.subscriptions = new CompositeDisposable();

	  // Register commands
		this.subscriptions.add(atom.commands.add('atom-workspace', {
	    'srt-helper:activate': () => this.activatePackage()
	  }));

	  this.subscriptions.add(atom.commands.add('atom-workspace', {
	    'srt-helper:srtCopyPaste': () => this.srtCopyPaste()
	  }));

		this.subscriptions.add(atom.commands.add('atom-workspace', {
	    'srt-helper:srtChooseDestEditor': () => this.srtChooseDestEditor()
	  }));

		this.subscriptions.add(atom.commands.add('atom-workspace', {
	    'srt-helper:srtChooseCompanionEditor': () => this.srtChooseCompanionEditor()
	  }));

		this.subscriptions.add(atom.commands.add('atom-workspace', {
	    'srt-helper:srtLinkSubs': () => this.srtLinkSubs()
	  }));

		this.subscriptions.add(atom.commands.add('atom-workspace', {
	    'srt-helper:toggleDecorationOnOff': () => this.toggleDecorationOnOff()
	  }));

		this.subscriptions.add(atom.commands.add('atom-workspace', {
	    'srt-helper:toggleChangeCaseOnOff': () => this.toggleChangeCaseOnOff()
	  }));
	},

	/*
	 * Activates this package.
	 * Note: this function is here in case the user wants to activate this package to use just the syntax highlight.
	 * However it is more useful for testing purposes.
	 */
	activatePackage()
	{

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
	 * Gets the editor that contains the file name. If no editor if found, returns null.
	 */
	getEditor(fileName)
	{
		let i, textEditor;
		let editors = atom.workspace.getTextEditors();

		textEditor = null;

		for (i = 0; i < editors.length; i++)
		{
			if (editors[i].getTitle() == fileName)
			{
				textEditor = editors[i];
				break;
			}
		}

		return textEditor;
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
	 * Retrieves the subtitle ID immediatly above the current subtitle text.
	 * Note: the range should point to the - Untranslated Subtitle - found.
	 */
	getSubtitleId(editor, range)
	{
		let subtitleId;
		let rangeCopy = range.copy();

		// Start the range 4 rows earlier
		if (rangeCopy.start.row - 4 > 0)
			rangeCopy.start.row = rangeCopy.start.row - 4;
		else
			rangeCopy.start.row = 0;

		editor.backwardsScanInBufferRange(new RegExp('^\\d+$'), rangeCopy, (iterator) =>
		{
			iterator.stop();
			subtitleId = iterator.match;
		});

		return subtitleId;
	},

	/*
	 * Returns the range corresponding to the first position of a given text.
	 * If the string is not found, returns NULL.
	 */
	findStrInEditor(editor, str)
	{
		let foundRange = null;

		editor.scan(new RegExp('^' + str + '$'), (iterator) =>
		{
			iterator.stop();
			foundRange = iterator.range;
		});

		return foundRange;
	},

	scrollCompanionEditor(destEditorRange)
	{
		let subtitleId, subtitleIdRange;

		subtitleId = this.getSubtitleId(this.destEditor, destEditorRange);

		subtitleIdRange = this.findStrInEditor(this.companionEditor, subtitleId);
		subtitleIdRange.start.row = subtitleIdRange.start.row + 2;
		subtitleIdRange.end.row = subtitleIdRange.start.row + 2;

		this.scrollTextEditor(this.companionEditor, subtitleIdRange);
	},

	/*
	 * Sets the cursor of a text editor to a given range and scrolls to it, if necessary.
	 * Returns the position to which the text was scrolled to, or Point (-1, -1) if no scrolling was done.
	 */
	scrollTextEditor(editor, range)
	{
		// Adjustment of visible rows in the editor, to make sure that we will scroll
		// the editor when towards the end the of the visible page. This constant is also
		// used to offset the scroll range, so we don't 'exactly' center the page on the next
		// '- Untraslated Subtitle -', but we scroll it a bit upwards.
		const visibleRowAdjustment = 8;

		// Get visible rows.
		let startRow = editor.element.getFirstVisibleScreenRow() + visibleRowAdjustment;
		let endRow = editor.element.getLastVisibleScreenRow() - visibleRowAdjustment;
		let scrollPosition = new Point(-1, -1);

		// Move the cursor to the replaced text.
		// Note: don't use autoscroll, because it doesn't center the text editor.
		editor.setCursorBufferPosition(range.start, { autoscroll: false });

		// If the range is not visible, scroll the editor to it and center it.
		if (!(range.start.row >= startRow && range.end.row < endRow))
		{
			scrollPosition = new Point(range.start.row + visibleRowAdjustment, 0)
			editor.scrollToBufferPosition(scrollPosition, { center: true });
		}

		return scrollPosition;
	},

	/*
	 * Callback function that does the actual replacement of the '- Untranslated subtitle -'
	 */
	replaceString(untranslatedSub)
	{
		let currentEditor = atom.workspace.getActiveTextEditor();
		let selectedText = currentEditor.getSelectedText();
		let scrollPosition;

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
			scrollPosition = this.scrollTextEditor(this.destEditor, untranslatedSub.range);

			if (this.companionEditor != null && this.companionEditor.alive && scrollPosition.row >= 0)
				this.scrollCompanionEditor(untranslatedSub.range);
		}
	},

	/*
	 * Retrieves the time code of a subtitle
	 */
	getSubtitleTimeCode(timeCodeStr)
	{
		let startTime, endTime;
		let str, startTimeStr, endTimeStr;
		let hours, minutes, seconds, miliseconds;

		str = timeCodeStr.split(' --> ');
		startTimeStr = str[0];
		endTimeStr = str[1];

		str = startTimeStr.split(',');
		miliseconds = Number(str[1]);
		str = str[0].split(':');
		hours = Number(str[0]);
		minutes = Number(str[1]);
		seconds = Number(str[2]);

		startTime = new Date(0, 0, 0, hours, minutes, seconds, miliseconds);

		str = endTimeStr.split(',');
		miliseconds = Number(str[1]);
		str = str[0].split(':');
		hours = Number(str[0]);
		minutes = Number(str[1]);
		seconds = Number(str[2]);

		endTime = new Date(0, 0, 0, hours, minutes, seconds, miliseconds);

		return { start: startTime, end: endTime };
	},

	/*
	 * Generates a subtitle time code from the supplied data.
	 */
	generateSubtitleTimeCodeStr(subtitle)
	{
		let timeCodeStr;

		timeCodeStr = ('00' + subtitle.start.getHours()).substr(-2, 2) + ':';
		timeCodeStr = timeCodeStr + ('00' + subtitle.start.getMinutes()).substr(-2, 2) + ':';
		timeCodeStr = timeCodeStr + ('00' + subtitle.start.getSeconds()).substr(-2, 2) + ',';
		timeCodeStr = timeCodeStr + ('000' + subtitle.start.getMilliseconds()).substr(-3, 3);

		timeCodeStr = timeCodeStr + ' --> ';

		timeCodeStr = timeCodeStr + ('00' + subtitle.end.getHours()).substr(-2, 2) + ':';
		timeCodeStr = timeCodeStr + ('00' + subtitle.end.getMinutes()).substr(-2, 2) + ':';
		timeCodeStr = timeCodeStr + ('00' + subtitle.end.getSeconds()).substr(-2, 2) + ',';
		timeCodeStr = timeCodeStr + ('000' + subtitle.end.getMilliseconds()).substr(-3, 3);

		return timeCodeStr;
	},

	/*
	 * Links all the subtitles in the 'editor' that have an interval between them of less
	 * than or equal to 'minInterval'.
	 */
	linkSubtitles(editor, minInterval)
	{
		let previousIterator = null;
		let previousSubTimeCode, currentSubTimeCode;

		editor.scan(new RegExp('^\\d+:\\d+:\\d+,\\d+ --> \\d+:\\d+:\\d+,\\d+$', 'g'), iterator => {

			if (previousIterator === null)
			{
				previousIterator = iterator;
				previousSubTimeCode = this.getSubtitleTimeCode(iterator.match[0]);
			}
			else
			{
				currentSubTimeCode = this.getSubtitleTimeCode(iterator.match[0]);

				// If the interval between each subtitle is less than the minInterval, join them.
				let timeDiff = currentSubTimeCode.start.getTime() - previousSubTimeCode.end.getTime();
				if (timeDiff >= 0 && timeDiff <= minInterval)
				{
					// Set the end of the previous subtitle as the start of the current one, minus 1 millisecond.
					previousSubTimeCode.end = new Date(currentSubTimeCode.start.getTime() - 1);
					previousIterator.replace(this.generateSubtitleTimeCodeStr(previousSubTimeCode));
				}

				// Next iteration.
				previousIterator = iterator;
				previousSubTimeCode = currentSubTimeCode;
			}

		});
	},

	/*
	 * Replaces the '- Untranslated subtitle -' string by the text that was selected by the user.
	 */
	srtCopyPaste()
  {
  	if (this.destEditor !== null && this.destEditor.alive)
			this.destEditor.scan(new RegExp('^- Untranslated subtitle -$', 'i'), this.replaceString.bind(this));
		else
			this.srtChooseDestEditor(this.chooseDestEditorCallback.bind(this), 'Please select the destination file');
  },

	/*
	 * Shows a modal panel in which the user can choose the destination editor in which the
	 * strings will be replaced.
	 */
	srtChooseDestEditor()
	{
		if (!this.srtHelperView.isPanelVisible())
			this.srtHelperView.showPanel(this.chooseDestEditorCallback.bind(this), 'Please select the destination file');
	},

	/*
	 * Shows a panel in which the user can choose the companion editor, which will be scrolled down
	 * while the strings are being replaced by the user.
	 */
	srtChooseCompanionEditor()
	{
		if (!this.srtHelperView.isPanelVisible())
			this.srtHelperView.showPanel(this.chooseCompanionEditorCallback.bind(this), 'Please select the companion file');
	},

	/*
	 * Shows a panel in which the user can choose the minimum interval between subtitles.
	 * After the user clicks ok, all subtitls that have an interval less or equal to the chosen number
	 * will be adjusted.
	 */
	srtLinkSubs()
	{
		if (this.destEditor !== null && this.destEditor.alive)
			this.minIntervalView.showPanel();
		else
			this.srtChooseDestEditor(this.chooseDestEditorCallback.bind(this), 'Please select the destination file');
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
		let textEditor;

		if (editorFileName != null)
			textEditor = this.getEditor(editorFileName);

		if (textEditor != null)
			this.destEditor = textEditor;
	},

	/*
	 * Callback that is executed when the companion editor is choosen by the user.
	 */
	chooseCompanionEditorCallback(editorFileName)
	{
		let textEditor;

		if (editorFileName != null)
			textEditor = this.getEditor(editorFileName);

		if (textEditor != null)
			this.companionEditor = textEditor;
	},

	/*
	 * Callback that is executed when the user chooses the minimum interval between subtitles.
	 */
	linkSubsCallback(minInterval)
	{
		if (minInterval >= 0)
			this.linkSubtitles(this.destEditor, minInterval);
	}
};
