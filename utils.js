/**
 * Prevent mdsvex ParseError by replacing characters syntactically important to
 * Svelte with their respective HTML entities. Note that remark/rehype seems to
 * decode the characters back, which is likely why they come interpreted on the
 * client.
 * @param {string} html
 * @returns {string}
 */
export function specialCharsToHTMLEntities(html) {
    return html.replace(
        /[{}`]/g,
        (char) => ({ '{': '&lbrace;', '}': '&rbrace;', '`': '&grave;' }[char])
    )
}
