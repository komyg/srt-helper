'use babel';

import SrtHelper from './srt-helper.js';

export default class SrtHelperView
{
	constructor(serializedState)
	{
		this.lastSelectedItem = null;

		// Create root element
	    this.element = document.createElement('div');
	    this.element.classList.add('srt-helper');

		// Load the file-select-panel.html.
		let panelLoadPromise = this.getFileLoadPromise('file://' + __dirname + '/file-select-panel.html');
		panelLoadPromise.then(this.loadPanelAndList.bind(this))
			.catch((error) => { console.error('Error loading view', error) });

		// Create modal panel
		this.modalPanel = atom.workspace.addModalPanel({
			item: this.element,
      		visible: false
    	});
	}

	loadPanelAndList(panel)
	{
		this.element.innerHTML = panel;

		// Add the open documents to the panel list.
		this.addOpenDocumentsToList();

		// Add event listeners
		document.getElementById('open-files-list').addEventListener('click', this.documentSelectedEventListener.bind(this));
		document.getElementById('ok-button').addEventListener('click', this.okButtonClickEventListener.bind(this));
		document.getElementById('cancel-button').addEventListener('click', this.cancelButtonClickEventListener.bind(this));
	}

	// Returns an object that can be retrieved when package is activated
	serialize() { }

	// Tear down any state and detach
	destroy()
	{
		this.element.remove();
		this.modalPanel.destroy();
	}

	/*
	 * Load a file using XMLHttpRequest.
	 * Returns a promise that can be used for the loading.
	 */
	getFileLoadPromise(fileUrl)
	{
		let promise = new Promise((resolve, reject) =>
		{
			let request = new XMLHttpRequest();
			request.open('GET', fileUrl);

			request.onload = () =>
			{
				if (request.status === 200)
					resolve(request.responseText);

				else
					reject(Error(request.statusText));
			};

			request.onError = () =>
			{
				reject(Error('Network error.'))
			};

			request.send();
		});

		return promise;
	}

	/*
	 * Updates the open-files-list list object with all of the files that are
	 * currently open.
	 */
	addOpenDocumentsToList()
	{
		let openDocuments = this.getOpenDocuments();
		let openFilesList = document.getElementById('open-files-list');
		for (let i = 0; i < openDocuments.length; i++)
		{
			let listElement = document.createElement('li');
			listElement.textContent = openDocuments[i];
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
	 * Shows a modal panel that allows the user to choose which editor he wants to use as the destination editor.
	 */
	showPanel()
	{
		this.modalPanel.show();
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
		let selectedItem = e.target;

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
			SrtHelper.setDestEditor(this.lastSelectedItem.textContent);
			this.modalPanel.hide();
		}
	}

	/*
	 * Closes the modal view without setting the file.
	 */
	cancelButtonClickEventListener(e)
	{
		this.modalPanel.hide();
	}
}
