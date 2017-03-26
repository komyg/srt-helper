# SRT Helper

This project is a package for the [Atom](https://atom.io/) editor. Its goal is to help in populating a *.srt* subtitle file with translated content.

## Requirements

This package expects you to have a *.srt* file template that already has the subtitles time codes from the original subtitle file, like in the example below:

```
1
00:02:04,620 --> 00:02:07,000
- Untranslated subtitle -

2
00:02:20,310 --> 00:02:26,110
- Untranslated subtitle -

3
00:02:30,970 --> 00:02:35,920
- Untranslated subtitle -
```

## Commands

This package has the following commands:

### Activate

This command will only active this package. It can be used just to show the syntax highlight or for testing purposes.

Note: this package can also be activated using the **srt copy paste** and the **choose destination editor commands**.

### Srt copy paste

This command will copy the currently selected text and paste it in place of the first *- Untranslated subtitle -* tag it finds in the destination editor (the text editor that contains the untranslated subtitles).

This command can be called through the *Packages* menu, through the context-menu or through the hot keys: **ctrl-alt-p**.

### Choose destination editor

This command will open a modal dialog with all the text editors that are currently open in Atom, allowing the user to choose which of them contains the untranslated subtitles.

### Choose companion editor

This command will open a modal dialog with all the text editors that are currently open in Atom, allowing the user to choose which of them contains the original subtitles. Once the companion editor is selected, it will be scrolled along side the destination editor using the subtitle ID to orient itself.

### Link subtitles

This command opens a modal dialog in which the user can choose the minimum interval between subtitles (in milliseconds). Once the interval is chosen, each subtitle that has an interval between itself and the next subtitle that is less than or equal to the chosen default interval, will have its end timecode updated to the start of the next subtitle minus one millisecond.

For example, if we say that the default interval between subtitles is 500 milliseconds, then in the example below the interval between the subtitle 4 and the subtitle 5 is of 5260 milliseconds, so they will remain unchanged. However the interval between the subtitles 5 and 6 is of 460 milliseconds, so the end of the subtitle 5 will be changed to the start of the subtitle 6 minus 1 millisecond.

```
4
00:01:40,350 --> 00:01:44,950
- Untranslated subtitle -

5
00:01:50,210 --> 00:01:52,280
- Untranslated subtitle -

6
00:01:52,740 --> 00:01:54,740
- Untranslated subtitle -
```

The updated example with the subtitles 5 and 6 linked is below (notice that the end value for the subtitle 5 was changed from *0:01:52,280* to *00:01:52,739*):

```
4
00:01:40,350 --> 00:01:44,950
- Untranslated subtitle -

5
00:01:50,210 --> 00:01:52,739
- Untranslated subtitle -

6
00:01:52,740 --> 00:01:54,740
- Untranslated subtitle -
```

### Toggle selected text decoration

This command will toggle on and off a blue underline decoration under the text that was transferred to the *.srt* file.

Note: this decoration is not persisted between sessions, therefore it will **not** be there the next time you open Atom.

### Toggle change case

This command will toggle on and off the automatic change of UPPER CASE words to Title Case words when the text is transferred to the *.srt* file.

## Usage

When the **srt copy paste** command is ran for the first time, it will open a dialog box which allows the user to choose the destination editor, the text editor that contains the untranslated subtitles. Once the destination editor is chosen, then each call to this command will replace the first *- Untranslated subtitle -* tag with the current selected text. If no text is selected, no replacement is made.

If you want to change the destination editor, please run the **choose destination editor** command.

You can also use the command **choose companion editor** to select a file that contains the subtitles in the original language. If you use this command, this package will scroll the companion editor with the destination editor in an effort to keep both showing the same subtitles.

![alt tag](https://cloud.githubusercontent.com/assets/25157901/23125798/4f3bd69e-f752-11e6-88cb-dc11e0d5506b.gif)

## Syntax highlight

This package includes a syntax highlight that will mark in orange the following string: **- Untranslated subtitle -**. It will also mark in red any line that has more than 40 characters (this was created to tell the user that he should add a line break, otherwise his subtitle will be too long and might not fit the screen).

This syntax highlight will be used on any *.srt* file as long as this package is activated.

Note: Since this package uses lazy loading, the syntax highlight will not appear until the user has used at least once in a give session the commands: **srt copy paste** or **choose destination editor**.

## Tests

The tests can be ran through the standard test interface in Atom (they were all written using [Jasmine](https://jasmine.github.io/))

## Authors

* **Felipe Armoni** - *Initial work*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
