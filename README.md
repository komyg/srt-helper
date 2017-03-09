# SRT Helper

This project is a package for the ![Atom](https://atom.io/) editor. Its goal is to help in populating a *.srt* subtitle file with translated content.

## Requirements

This package expects you to have a *.srt* file template that already has the subtitles time codes from the original subtitle file, like in the example below:

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

### Srt copy paste

This command will copy the currently selected text and paste it in place of the first *- Untranslated subtitle -* tag it finds in the destination editor (the text editor that contains the untranslated subtitles).

This command can be called through the *Packages* menu, through the context-menu or through the hot keys: **ctrl-alt-p**.

### Choose destination editor

This command will open a modal dialog with all the text editors that are currently open in Atom, allowing the user to choose which of them contains the untranslated subtitles.

This command can only be called through the *Packages* menu.

### Choose companion editor

This command will open a modal dialog with all the text editors that are currently open in Atom, allowing the user to choose which of them contains the original subtitles. Once the companion editor is selected, it will be scrolled along side the destination editor using the subtitle ID to orient itself.

This command can only be called through the *Packages* menu.

### Toggle selected text decoration

This command will toggle on and off a blue underline decoration under the text that was transferred to the *.srt* file.

**Note:** this decoration is not persisted between sessions, therefore it will **not** be there the next time you open Atom.

This command can only be called through the *Packages* menu.

### Toggle change case

This command will toggle on and off the automatic change of UPPER CASE words to Title Case words when the text is transferred to the *.srt* file.

This command can only be called through the *Packages* menu.

## Usage

When the **Srt copy paste** command is ran for the first time, it will open a dialog box which allows the user to choose the destination editor, the text editor that contains the untranslated subtitles. Once the destination editor is chosen, then each call to this command will replace the first *- Untranslated subtitle -* tag with the current selected text. If no text is selected, no replacement is made.

If you want to change the destination editor, please run the **Choose destination editor** command.

You can also use the command **Choose companion editor** to select a file that contains the subtitles in the original language. If you use this command, this package will scroll the companion editor with the destination editor in an effort to keep both showing the same subtitles.

![alt tag](https://cloud.githubusercontent.com/assets/25157901/23125798/4f3bd69e-f752-11e6-88cb-dc11e0d5506b.gif)

## Syntax highlight

This package includes a syntax highlight that will mark in orange the following string: **- Untranslated subtitle -**. It will also mark in red any line that has more than 40 characters (this was created to tell the user that he should add a line break, otherwise his subtitle will be too long and might not fit the screen).

This syntax highlight will be used on any *.srt* file as long as this package is activated.

**Note:** Since this package uses lazy loading, the syntax highlight will not appear until the user has used at least once in a give session the commands: **Srt copy paste** or **Choose destination editor**.

## Tests

The tests can be ran through the standard test interface in Atom (they were all written using ![Jasmine](https://jasmine.github.io/))

## Authors

* **Felipe Armoni** - *Initial work*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
