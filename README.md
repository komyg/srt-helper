# SRT Helper

This project is a package for the ![Atom](https://atom.io/) editor. Its goal is to help in populating a srt subtitle file with translated content.

## Requirements

This package expects you to have a srt file template that already has the subtitles time codes from the original subtitle file, like in the example below:

```
1
00:01:04,620 --> 00:01:07,000
- Untranslated subtitle -

2
00:01:20,310 --> 00:01:26,110
- Untranslated subtitle -

3
00:01:30,970 --> 00:01:35,920
- Untranslated subtitle -
```

## Commands

This package has two commands:

### Choose destination editor

This command will open a modal dialog with all the text editors that are currently open in Atom, allowing the user to choose which of them contains the untranslated subtitles.

This command can only be called through the *Packages* menu.

### Srt copy paste

This command will copy the currently selected text and paste it in place of the first *- Untranslated subtitle -* tag it finds in the destination editor (the text editor that contains the untranslated subtitles).

This command can be called through the *Packages* menu, through the context-menu or through the hot keys: **ctrl-alt-m**.

## Usage

When the **Srt copy paste** command is ran for the first time, it will open a dialog box which allows the user to choose the destination editor, the text editor that contains the untranslated subtitles. Once the destination editor is chosen, then each call to this command will replace the first *- Untranslated subtitle -* tag with the current selected text. If no text is selected, no replacement is made.

If you want to change the destination editor, please run the **Choose destination editor** command.

## Tests

The tests can be ran through the standard test interface in Atom (they were all written using ![Jasmine](https://jasmine.github.io/))

## Authors

* **Felipe Armoni** - *Initial work*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
