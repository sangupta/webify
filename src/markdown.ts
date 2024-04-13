import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { FrontMatter } from './types'
import { Value } from 'unified/lib'

export async function processMarkdownContent(contents: string, frontMatter: FrontMatter): Promise<any> {
    const data = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .process(contents);

    return data.value;
}
