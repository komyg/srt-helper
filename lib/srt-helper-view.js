'use babel';

import SrtHelper from './srt-helper';
import FileHelper from './file-helper';

export default class SrtHelperView
{
	constructor()
	{
		this.lastSelectedItem = null;
		this.isViewLoaded = false;

		this.fileSelectedCallback = null;

		// Create root element
	  this.element = document.createElement('div');
	  this.element.classList.add('srt-helper');

		// Create modal panel
		this.modalPanel = atom.workspace.addModalPanel({
			item: this.element,
			visible: false
		});
	}

	/*
	 * Must be called once to load and initialize this view.
	 * Returns the panelLoadPromise (can be used for testing purposes.)
	 */
	initAndLoadView(panelHeading)
	{
		// Load the file-select-panel.html.
		let panelLoadPromise = FileHelper.getFileLoadPromise('file://' + __dirname + '/file-select-panel.html');
		panelLoadPromise.then((panel) =>
		{
			this.loadPanelAndList(panel, panelHeading);
		})
		.catch((error) =>
		{
			console.error('Error loading view', error)
		});

		return panelLoadPromise;
	}

	/*
	 * Loads the panel and the list that contains all of the opened files.
	 */
	loadPanelAndList(panel, panelHeading)
	{
		// Parse the HTML that was received.
		let parser = new DOMParser();
		let panelDocument = parser.parseFromString(panel, 'text/html');

		this.element.appendChild(panelDocument.body);

		// Add the open documents to the panel list.
		this.addOpenDocumentsToList();

		// Add event listeners
		document.getElementById('open-files-list').addEventListener('click', this.documentSelectedEventListener.bind(this));
		document.getElementById('ok-button').addEventListener('click', this.okButtonClickEventListener.bind(this));
		document.getElementById('cancel-button').addEventListener('click', this.cancelButtonClickEventListener.bind(this));

		// Set the panel hading
		this.setPanelHeading(panelHeading);

		// Indicates that the view has finished loading.
		this.isViewLoaded = true;
	}

	// Returns an object that can be retrieved when package is activated
	serialize()
	{

	}

	// Tear down any state and detach
	destroy()
	{
		this.element.remove();
		this.modalPanel.destroy();
	}

	/*
	 * Updates the open-files-list list object with all of the files that are
	 * currently open.
	 */
	addOpenDocumentsToList()
	{
		let openDocuments = this.getOpenDocuments();
		let openFilesList = document.getElementById('open-files-list');

		// Removes children from the list
		while(openFilesList.firstChild)
			openFilesList.removeChild(openFilesList.firstChild);

		for (let i = 0; i < openDocuments.length; i++)
		{
			let listElement = document.createElement('li');
			let spanElement = document.createElement('span');

			spanElement.classList.add('icon-file-text');
			spanElement.textContent = openDocuments[i];

			listElement.appendChild(spanElement);
			openFilesList.appendChild(listElement);
		}
	}

	/*
	 * Gets the name of all of the currently opened documents.
	 */
	getOpenDocuments()
	{
		let openDocuments = new Array();
		let openEditors = atom.workspace.getTextEditors();

		for (let editor of openEditors)
			openDocuments.push(editor.getTitle());

		return openDocuments;
	}

	/*
	 * Set the panel heading text with the panelHeading string.
	 */
	setPanelHeading(panelHeading)
	{
		let heading = document.getElementById('panel-heading');
		heading.textContent = panelHeading;
	}

	/*
	 * Shows a modal panel that allows the user to choose which editor he wants to use as the destination editor.
	 * fileSelectedCallback(string selectedFile) - callback function that is called after the user chose the file from the list and clicked the ok button or the cancel button.
	 * If the user clicked the ok button, the selectedFile variable will contain the name of the selected file, otherwise it will NULL.
	 */
	showPanel(fileSelectedCallback, panelHeading)
	{
		this.fileSelectedCallback = fileSelectedCallback;

		// If the view has already been loaded, update the panel with the current text editors and show the view.
		if (this.isViewLoaded)
		{
			this.addOpenDocumentsToList();
			this.setPanelHeading(panelHeading);
		}

		// Load the view.
		else
			this.initAndLoadView(panelHeading);

		this.modalPanel.show();
	}

	/*
	 * Hides this panel.
	 */
	hidePanel()
	{
		this.modalPanel.hide();
	}

	/*
	 * Check if this panel is visible
	 */
	isPanelVisible()
	{
		return this.modalPanel.isVisible();
	}

	// **** Event Listeners ****

	documentSelectedEventListener(e)
	{
		let selectedItem;

		// Select the correct element to apply the 'selected' style
		if (e.target.nodeName.toUpperCase() === 'LI')
			selectedItem = e.target;

		else if (e.target.nodeName.toUpperCase() === 'SPAN')
			selectedItem = e.target.parentNode;

		else
			return;

		// Remove the last selected item, if it exists.
		if (this.lastSelectedItem != null)
			this.lastSelectedItem.classList.remove('selected');

		selectedItem.classList.add('selected');
		this.lastSelectedItem = selectedItem;
	}

	/*
	 * Retrieves the item that was selected by the user and sets it in the SrtHelper file.
	 */
	okButtonClickEventListener(e)
	{
		if (this.lastSelectedItem !== null)
		{
			this.modalPanel.hide();
			this.fileSelectedCallback(this.lastSelectedItem.textContent);
		}
	}

	/*
	 * Closes the modal view without setting the file.
	 */
	cancelButtonClickEventListener(e)
	{
		this.modalPanel.hide();
		this.fileSelectedCallback(null);
	}
}
