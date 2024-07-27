import {
    transformerMetaHighlight,
    transformerMetaWordHighlight,
    transformerNotationDiff,
    transformerNotationErrorLevel,
    transformerNotationHighlight,
    transformerNotationWordHighlight,
} from '@shikijs/transformers'
import { codeToHtml } from 'shiki'
import { specialCharsToHTMLEntities } from './utils.js'

/**
 * Highlighter configuration object.
 * @typedef {Object} Config
 * @property {string} theme
 * @property {Object.<string, string>} themes
 * @property {string} defaultColor
 * @property {string} cssVariablePrefix
 * @property {boolean} displayTitle
 * @property {boolean} displayLang
 */

/**
 * @param {Config} config
 * @returns {function(string, string, string): Promise<string>}
 */
export default async (config) => {
    const { theme, themes, defaultColor, cssVariablePrefix, displayTitle, displayLang } = config

    if (!theme && !themes) {
        throw new Error('[mdsvex-shiki] Either theme or themes must be provided.')
    }

    /**
     * Highlight individual code block.
     * @param {string} code
     * @param {string} lang
     * @param {string} meta
     * @returns {Promise<string>}
     */
    return async (code, lang, meta) => {
        // get title and strip it from meta
        const matchTitle = meta?.match(/\(([^)]+)\)/)
        const title = matchTitle?.[1].trim()
        meta = meta?.replace(matchTitle?.[0], '').trim()

        // handle missing lang
        lang = lang ?? 'text'

        // don't display lang for plain text
        const displayLangExceptions = ['text', 'plain']

        // Shiki options
        const options = {
            lang, // code block lang
            ...(themes ? { themes, defaultColor, cssVariablePrefix } : { theme }),
            transformers: [
                {
                    pre(node) {
                        node.properties['role'] = `region`
                    },

                    root(node) {
                        const barChildren = []
                        // create title
                        if (displayTitle && matchTitle) {
                            barChildren.push({
                                type: 'element',
                                tagName: 'span',
                                properties: {
                                    className: ['highlighter__title'],
                                },
                                children: [{ type: 'text', value: title }],
                            })
                        }

                        // create lang
                        if (displayLang && !displayLangExceptions.includes(lang)) {
                            barChildren.push({
                                type: 'element',
                                tagName: 'span',
                                properties: {
                                    className: ['highlighter__lang'],
                                },
                                children: [{ type: 'text', value: lang }],
                            })
                        }

                        const wrapperChildren = []

                        // create bar and push lang and title
                        if (barChildren.length) {
                            wrapperChildren.push({
                                type: 'element',
                                tagName: 'div',
                                properties: { className: ['highlighter__bar'] },
                                children: barChildren,
                            })
                        }

                        // push Shiki content
                        if (node.children.length) {
                            wrapperChildren.push(...node.children)
                        }

                        // wrap bar and Shiki content
                        const wrapper = {
                            type: 'element',
                            tagName: 'div',
                            properties: { className: ['highlighter'] },
                            children: wrapperChildren,
                        }

                        // replace root children
                        node.children = [wrapper]
                    },
                },
                ...(meta
                    ? [
                          // NOTE: meta transformers will likely be deprecated
                          transformerMetaHighlight(),
                          transformerMetaWordHighlight(),
                      ]
                    : [
                          transformerNotationDiff(),
                          transformerNotationHighlight(),
                          transformerNotationWordHighlight(),
                          transformerNotationErrorLevel(),
                      ]),
            ],
            ...(meta && { meta: { __raw: meta } }),
        }

        let html = await codeToHtml(code, options)

        return specialCharsToHTMLEntities(html)
    }
}
