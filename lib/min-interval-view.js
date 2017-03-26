'use babel';
'use strict';

import FileHelper from './file-helper';

export default class MinIntervalView
{
  constructor()
  {
    var self = this;
    this.minSubtitleIntervalCallback = null;

    // Create root element
	  this.element = document.createElement('div');
	  this.element.classList.add('srt-helper');
    this.element.classList.add('min-interval-view');

		// Create modal panel
		this.modalPanel = atom.workspace.addModalPanel({
			item: this.element,
			visible: false
		});

    this.createViewElements();
  }

  /*
   * Creates this view's elements and appends them to the DOM.
   */
  createViewElements()
  {
    // Panel
    let atomPanel = document.createElement('atom-panel');
    atomPanel.classList.add('modal');
    atomPanel.classList.add('padded');
    this.element.appendChild(atomPanel);

    // Panel title
    let panelHeading = document.createElement('div');
    panelHeading.classList.add('panel-heading-centered');
    panelHeading.classList.add('padded');
    atomPanel.appendChild(panelHeading);

    let h1Element = document.createElement('h1');
    h1Element.textContent = 'Please add the minimum interval between subtitles (in milliseconds):';
    panelHeading.appendChild(h1Element);

    // Panel body
    let panelBody = document.createElement('div');
    panelBody.classList.add('panel-body');
    atomPanel.appendChild(panelBody);

    let inputElement = document.createElement('input');
    inputElement.setAttribute('type', 'number');
    inputElement.setAttribute('id', 'min-interval-input');
    inputElement.setAttribute('min', '0');
    inputElement.setAttribute('placeholder', 'Min interval (in milliseconds)');
    inputElement.classList.add('input-text');
		inputElement.classList.add('native-key-bindings');
    panelBody.appendChild(inputElement);

    panelBody.appendChild(document.createElement('br'));

    // Buttons
    let buttonDiv = document.createElement('div');
    buttonDiv.classList.add('block-centered');
    panelBody.appendChild(buttonDiv);

    let okButton = document.createElement('button');
    okButton.setAttribute('id', 'ok-button');
    okButton.textContent = 'Ok';
    okButton.classList.add('inline-block');
    okButton.classList.add('btn');
    okButton.classList.add('btn-lg');
    okButton.classList.add('ok-button');
    buttonDiv.appendChild(okButton);
    okButton.addEventListener('click', this.okButtonClickEventListener.bind(this));

    let cancelButton = document.createElement('button');
    cancelButton.setAttribute('id', 'cancel-button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('inline-block');
    cancelButton.classList.add('btn');
    cancelButton.classList.add('btn-lg');
    cancelButton.classList.add('cancel-button');
    buttonDiv.appendChild(cancelButton);
    cancelButton.addEventListener('click', this.cancelButtonClickEventListener.bind(this));
  }

  // Tear down any state and detach
	destroy()
	{
		this.element.remove();
		this.modalPanel.destroy();
	}

  /*
	 * Sets the panel heading text with the panelHeading string.
	 */
	setPanelHeading(panelHeading)
	{
		let heading = document.getElementById('panel-heading');
		heading.textContent = panelHeading;
	}

  /*
   * Sets the minSubtitleIntervalCallback callback.
   * minSubtitleIntervalCallback(number minInterval) - callback function that is called after the user chose the minimum interval and clicked the ok button or the cancel button.
   * If the user clicked the ok button, the minInterval variable will contain the amount chosen, otherwise it will contain -1.
   */
  setMinSubtitleIntervalCallback(minSubtitleIntervalCallback)
  {
    this.minSubtitleIntervalCallback = minSubtitleIntervalCallback;
  }

  /*
	 * Shows a modal panel that allows the user to choose the minimum interval between subtitles.
	 */
	showPanel()
	{
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

	/*
	 * Retrieves the min interval that was written by the user.
	 */
	okButtonClickEventListener(e)
	{
    const minInterval = document.getElementById('min-interval-input').value;

    this.modalPanel.hide();

    if(minInterval >= 0)
      this.minSubtitleIntervalCallback(minInterval);
    else
      this.minSubtitleIntervalCallback(-1);
	}

	/*
	 * Closes the modal view
	 */
	cancelButtonClickEventListener(e)
	{
		this.modalPanel.hide();
		this.minSubtitleIntervalCallback(-1);
	}
}
