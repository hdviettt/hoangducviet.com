Title: About Themes

URL Source: https://support.typora.io/About-Themes/

Markdown Content:
[日本語 (ja)](https://support.typora.io/ja/About-Themes/)

## Change Themes

Typora has 6 built-in themes, which can be selected using the **Themes menu** in the menu bar. You can also download, install, modify or write your own custom theme to stylize Typora.

Typora uses CSS to style everything. Each theme shown in the Themes menu is one `.css` file under “Typora’s theme folder”. So you can add/modify themes by adding/modifying the corresponding CSS files under “Typora’s theme folder”.

## Use Themes Under Light Mode and Dark Mode

You can set separate themes for light mode and dark mode (on macOS / Windows). When the system’s color scheme changes, the corresponding theme you chose will be applied.

![Image 1: Screen Shot 2020-12-05 at 17.01.49](https://support.typora.io/media/new-97/Screen%20Shot%202020-12-05%20at%2017.01.49.png)

Your theme can also use a media query for [prefers color scheme](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme) to write a responsive theme for both light mode and dark mode.

## Naming Rule

When writing your own theme, you need to use these file naming rules for theme css: do not use capitalized letters or non-alphabet characters except `-`. Replace any whitespace with `-` and Typora will convert them to a readable label in the menu item. For example, for `my-first-typora-theme.css`, Typora will show “My First Typora Theme” under the “Themes” menu.

## Get Typora Themes

We have an official website [Typora Theme Gallery](http://theme.typora.io/) for designers/developers to share their custom themes with others. You can download themes from there.

![Image 2: Screen Shot 2020-12-05 at 22.09.28](https://support.typora.io/media/new-97/Screen%20Shot%202020-12-05%20at%2022.09.28.png)

## Custom Themes Installation

1.   Open the Theme Folder. (see instructions below)
2.   Copy or move the `.css` file and related resources, like fonts or images, into the newly opened folder.
3.   Restart Typora, then select it from the `Themes` menu.

## Open Theme Folder

### macOS

Open the preference panel and click the “Open Theme Folder” button.

![Image 3: typora-preference-mac](https://support.typora.io/media/about-themes/Snip20160921_1.png)

On macOS, it is usually `/Users/{username}/Library/Application Support/abnerworks.Typora/themes/`.

### Windows/Linux

Open the preference panel using `File` → `Preference` from the menubar and then click “Open Theme Folder”:

![Image 4: typora-preference-electron](https://support.typora.io/media/about-themes/Snip20160921_2.png)

## Modify Current Styles

Sometimes you may just want to change the font family for all themes or change the font color for headings of specific themes. In this case, you do not need to copy/modify a whole existing CSS file, using [Add Custom CSS](https://support.typora.io/Add-Custom-CSS/) is enough.

## Writing My Own Theme

Please see [Write Custom Theme for Typora](http://theme.typora.io/doc/Write-Custom-Theme/).

## Debug Theme CSS

You can open Chrome/Safari DevTools to debug element styles. For more details, you can [click here](https://support.typora.io/Debug-Themes/).

*   On macOS, please follow [https://support.apple.com/en-hk/guide/safari/sfri20948/mac](https://support.apple.com/en-hk/guide/safari/sfri20948/mac) to enable the `Develop` menu within Safari, then inspect Typora’s webview from Safari menu → Develop → [your macOS device name] → Typora.
*   On Windows/Linux, you can open DevTools from the `View` ->`Toggle DevTools` menu item.
