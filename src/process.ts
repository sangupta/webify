import fs from 'fs';
import path from 'path';
import * as yamlFront from 'yaml-front-matter';
import { computeWPM, extractDate, getRelativePath } from './utils.js';
import { TEXT_FILE_EXTENSIONS, WORDS_PER_MINUTE } from './const.js';
import { processMarkdownContent } from './markdown.js';
import { FrontMatter, PageMetadata, PageType } from './types.js';

export async function processFile(root: string, dist: string, file: string): Promise<PageMetadata | undefined> {
    const relativePath = getRelativePath(root, file);
    const extension = path.extname(file);
    const contentPath = getContentPath(root, dist, file);

    console.log('Processing file: ', relativePath);
    const stats = fs.lstatSync(file);

    if (stats.isSymbolicLink()) {
        console.log('  skipping symkink: ', file);
        return;
    }

    if (stats.isDirectory()) {
        // create same in dist
        if (file.startsWith(root)) {
            const suffix = file.substring(root.length);
            const folder = path.join(dist, suffix);
            fs.mkdirSync(folder);
            return;
        }

        console.warn('  Unable to create child folder: ', file);
    }

    // non-text file, process as is
    if (!TEXT_FILE_EXTENSIONS.includes(path.extname(file))) {
        copyProcessingFile(root, dist, file);
        return;
    }

    // check if the file has some kind of yaml front matter
    const fileContents = (fs.readFileSync(file, 'utf8') || '').trim();
    const frontMatter: FrontMatter = yamlFront.loadFront(fileContents);

    const contentsWithoutMatter: string = frontMatter.__content || '';
    delete frontMatter.__content;

    const hasFrontMatter = Object.keys(frontMatter).length > 0;

    if (!hasFrontMatter) {
        // copy this file as is
        copyProcessingFile(root, dist, file);
        return;
    }

    // this file needs to be processed
    // create the metadata
    const metadata: PageMetadata = {
        id: relativePath,
        title: frontMatter.title || path.parse(file).name,
        path: ensureStartingSlash(removeExtension(frontMatter.path || relativePath)),
        contentPath: getRelativeContentPath(root, dist, file),
        category: frontMatter.category || '',
        description: frontMatter.description || '',
        date: extractDate(frontMatter.date, stats),
        published: frontMatter.published || true,
        tags: frontMatter.tags || [],
        expiry: extractDate(frontMatter.expiry),
        series: frontMatter.series || '',
        type: getType(extension),
        readingTime: computeWPM(contentsWithoutMatter, WORDS_PER_MINUTE),
        alias: frontMatter.alias || [],
    };

    // check if this is markdown or html
    switch (extension) {
        case '.md':
        case '.markdown':
            // const processed = await processMarkdownContent(contentsWithoutMatter, frontMatter);
            writeProcessedFile(contentPath, PageType.Markdown, {
                data: Buffer.from(contentsWithoutMatter).toString('base64'),
                ...metadata
            });
            break;

        case '.html':
        case '.htm':
        case '.txt':
        case '.text':
            writeProcessedFile(contentPath, PageType.Html, {
                data: Buffer.from(contentsWithoutMatter).toString('base64'),
                ...metadata
            });
            break;

        default:
            console.warn('  Unknown file type with front-matter: ', extension);
    }

    // if published, and not expired, then write data to the site
    // all done, include in the site
    return metadata;
}

/**
 * Copy the file from root path to the dist path.
 * 
 * @param root 
 * @param dist 
 * @param file 
 */
function copyProcessingFile(root: string, dist: string, file: string): void {
    const suffix = file.substring(root.length);
    console.log('  copying file: ', suffix);
    const dest = path.join(dist, suffix);
    fs.copyFileSync(file, dest);
}

/**
 * 
 * @param root the root folder for the website
 * @param dist the dist folder for the website
 * @param file the file being processed
 * @returns the modified path for the content file
 */
function getContentPath(root: string, dist: string, file: string): string {
    const suffix = file.substring(root.length);
    const dest = path.join(dist, suffix);

    // replace extension in dest to json
    const destPath = path.parse(dest);
    const modified = path.join(destPath.dir, destPath.name + '.json');
    return modified;
}

function getRelativeContentPath(root: string, dist: string, file: string): string {
    const relative = getContentPath(root, dist, file);
    if (relative.startsWith(dist)) {
        return relative.substring(dist.length);
    }

    return relative;
}

/**
 * Write the processed file at the given path ensuring
 * to convert any object to JSON-string before writing.
 * 
 * @param contentPath 
 * @param data 
 */
function writeProcessedFile(contentPath: string, pageType: PageType, data: Record<string, any>): void {
    console.log('  writing file: ', contentPath);
    if (pageType) {
        data.type = pageType;
    }

    const dataAsJson = JSON.stringify(data, null, 2);
    fs.writeFileSync(contentPath, dataAsJson);
}

/**
 * Get the type of the file based on the extension.
 * 
 * @param extension the file extension
 * @returns the type of the file
 */
function getType(extension: string): PageType {
    switch (extension) {
        case '.md':
        case '.markdown':
            return PageType.Markdown;

        case '.html':
        case '.htm':
            return PageType.Html;

        case '.txt':
        case '.text':
            return PageType.Text;

        default:
            return PageType.Unknown;
    }
}

/**
 * Remove extension from file path
 * 
 * @param file the file path to remove extension from
 * @returns the file path without extension
 */
function removeExtension(file: string): string {
    const ext = path.extname(file);
    return file.substring(0, file.length - ext.length);
}

/**
 * Ensure that the path starts with a slash
 * 
 * @param str the string to ensure starts with a slash
 * @returns the string with a starting slash
 */
function ensureStartingSlash(str: string): string {
    if (str.startsWith('/')) {
        return str;
    }

    return '/' + (str || '');
}
