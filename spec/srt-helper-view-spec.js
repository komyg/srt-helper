'use babel';

import SrtHelperView from '../lib/srt-helper-view';

describe('SrtHelperView', () =>
{
	let srtHelperView;
	let workspaceElement;

	beforeEach(() =>
	{
		srtHelperView = new SrtHelperView();

		// Attaches jasmine to the DOM
		workspaceElement = atom.views.getView(atom.workspace);
		jasmine.attachToDOM(workspaceElement);
	});

	describe('SrtHelperView unit tests', () =>
	{
		it('initAndLoadView - should load and initialize the view', () =>
		{
			// Setup spies
			spyOn(srtHelperView, 'getFileLoadPromise').andCallFake(() =>
			{
				// Setup fake file load promise
				let fakePromise = new Promise((resolve) =>
				{
					resolve('Fake promise');
				});

				return fakePromise;
			});

			// This function is called after the fake promise is resolved.
			spyOn(srtHelperView, 'loadPanelAndList').andCallFake((panel) =>
			{
				expect(panel).toBe('Fake promise');
			});

			spyOn(atom.workspace, 'addModalPanel').andCallThrough();

			// Execute function
			waitsForPromise(() =>
			{
				return srtHelperView.initAndLoadView();
			});

			// Run the tests.
			runs(() =>
			{
				// Check if the necessary functions were called
				expect(srtHelperView.loadPanelAndList).toHaveBeenCalledWith('Fake promise');

				// Check if the modal panel was indeed created and is hidden
				expect(srtHelperView.modalPanel).toBeDefined();
				expect(srtHelperView.modalPanel.isVisible()).toBe(false);
			});

		});

		it('getOpenDocuments - should get all the names of the open documents/text editors', () =>
		{
			let openDocuments;
			let fakeTextEditor = jasmine.createSpyObj('fakeTextEditor', ['getTitle']);

			// Create a fake text editor object that will be returned to this function.
			fakeTextEditor.getTitle.andCallFake(() => {
				return 'test-editor';
			});

			spyOn(atom.workspace, 'getTextEditors').andReturn([fakeTextEditor]);

			openDocuments = srtHelperView.getOpenDocuments();

			expect(openDocuments).toContain('test-editor');
		});

		it('addOpenDocumentsToList - should add all open documents to a list', () =>
		{
			// Setup fake HTML DOM for testing.
			let domElement = document.createElement('div');
			let listElement = document.createElement('ol');
			listElement.id = 'open-files-list';
			domElement.appendChild(listElement);

			// Setup fake function return.
			let openDocuments = ['document1', 'document2', 'document3'];
			spyOn(srtHelperView, 'getOpenDocuments').andReturn(openDocuments);
			spyOn(document, 'createElement').andCallThrough();
			spyOn(document, 'getElementById').andReturn(listElement);

			// Execute function
			srtHelperView.addOpenDocumentsToList();

			// Check if the resulting HTML was created correctly.
			for (let listItem of listElement.childNodes)
			{
				expect(listItem.tagName.toUpperCase()).toBe('LI');

				// Each list item should have only one child SPAN.
				let spanItem = listItem.childNodes;
				expect(spanItem.length).toBe(1);

				// Check if child is of the type SPAN and if it conaints the original documents list
				expect(spanItem[0].tagName.toUpperCase()).toBe('SPAN');
				expect(openDocuments).toContain(spanItem[0].textContent);
			}
		});

		it('documentSelectedEventListener - should change the CSS class of the LI element that was clicked', () =>
		{
			// Setup fake objects.
			let selectedItem = document.createElement('li');

			let lastSelectedItem = document.createElement('li');
			lastSelectedItem.classList.add('selected');
			srtHelperView.lastSelectedItem = lastSelectedItem;

			let fakeEventObj = jasmine.createSpyObj('fakeEventObj', ['target']);
			fakeEventObj.target = selectedItem;

			// Call function
			srtHelperView.documentSelectedEventListener(fakeEventObj);

			// Check if the styles were changed
			expect(lastSelectedItem.classList.contains('selected')).toBe(false);
			expect(selectedItem.classList.contains('selected')).toBe(true);
		});

		it('documentSelectedEventListener - should change the CSS class of the SPAN element that was clicked', () =>
		{
			// Setup fake objects.
			let selectedItemParent = document.createElement('li');
			let selectedItem = document.createElement('span');
			selectedItemParent.appendChild(selectedItem);

			let lastSelectedItem = document.createElement('li');
			lastSelectedItem.classList.add('selected');
			srtHelperView.lastSelectedItem = lastSelectedItem;

			let fakeEventObj = jasmine.createSpyObj('fakeEventObj', ['target']);
			fakeEventObj.target = selectedItem;

			// Call function
			srtHelperView.documentSelectedEventListener(fakeEventObj);

			// Check if the styles were changed
			expect(lastSelectedItem.classList.contains('selected')).toBe(false);
			expect(selectedItemParent.classList.contains('selected')).toBe(true);
		});
	});

	describe('File load integration test', () =>
	{
		it('should load the contents of a file', () =>
		{
			let fileLoadPromise, fileContent, fileLoaded;

			runs(() =>
			{
				fileLoaded = false;

				fileLoadPromise = srtHelperView.getFileLoadPromise('file://' + __dirname + '/dummy-file.txt');
				fileLoadPromise.then((result) =>
				{
					fileContent = result;
					fileLoaded = true;
				});
			});

			// Waits until file is loaded
			waitsFor(() =>
			{
				return fileLoaded;
			});

			runs(() =>
			{
				expect(fileContent).toContain('Lorem ipsum');
			});
		});
	});

	// TODO: The document (DOM) being used in the let openFilesList = document.getElementById('open-files-list'); call is not the view,
	// but actually the test harness docuemnt. Must figure out how to change the DOM.
	xdescribe('SrtHelperView integration test', () =>
	{
		let loadViewPromise;

		beforeEach(() =>
		{
			// Open two files in the text editor
			waitsForPromise(() =>
			{
				return atom.workspace.open('dummy-file.txt');
			});

			waitsForPromise(() =>
			{
				return atom.workspace.open('dummy-srt-file.srt');
			});

		});

		it('should show and hide the modal panel', () =>
		{
			runs(() => {

				// Now we can test for view visibility
				let srtHelperElement = workspaceElement.querySelector('.srt-helper');
				expect(srtHelperElement).not.toBeVisible();
				srtHelperView.showPanel();
			});


			waitsFor(() => {
				return srtHelperView.isViewLoaded;
			});

			runs(() => {
				expect(srtHelperElement).toBeVisible();

				srtHelperView.hidePanel();
				expect(srtHelperElement).not.toBeVisible();
			});

		});

		it('should create a panel with a list containing all open documents', () =>
		{
			// Get the list element that was created.
			let listElement = document.getElementById('open-files-list');
			expect(listElement).toBeDefined();
			expect(listElement).not.toBeNull();

			console.log('Children: ' + listElement.children.length);
			console.log(listElement.innerHTML);

			// Check if all open text editors were added to the list
			let currentTextEditors = atom.workspace.getTextEditors();
			expect(listElement.children.length).toEqual(currentTextEditors.length);
		});
	});
});
