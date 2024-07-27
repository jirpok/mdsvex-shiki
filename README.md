# mdsvex-shiki

Supports most [common transformers](https://shiki.style/packages/transformers) out of the box.

## Configuration

At least one of `theme` or `themes` must be provided, with `themes` taking precedence should both be specified.

```js
const options = {
    // single theme
    theme: 'nord',

    // bar
    displayTitle: true,
    displayLang: true,
}
```

```js
const options = {
    // dual themes
    themes: {
        light: 'github-light',
        dark: 'github-dark',
        // ...
    },
    defaultColor: 'light',
    cssVariablePrefix: '--shiki-',

    // bar
    // ...
}
```

Example

````js
```js (title)
console.log("Hello, world!")
```
````

Output

```html
<div class="highlighter highlighter--has-bar">
    <!-- bar -->
    <div class="highlighter__bar">
        <span class="highlighter__title">title</span>
        <span class="highlighter__lang">js</span>
    </div>
    <!-- Shiki -->
    <pre class="shiki" role="region">
        <!-- ... -->
    </pre>
</div>
```

### Provide the custom highlight function to mdsvex

svelte.config.js

```js
import highlighter from 'mdsvex-shiki'

const config = {
    // ...
    preprocess: [
        // ...
        mdsvex({
            // ...
            highlight: await highlighter(options)
        }),
    ],
}
```
