export interface FrontMatter {
    [key: string]: any;
    __content?: string;
}

export interface ConfigFile {
    title: string;
    baseUrl: string;
    name: string;
    icon: string;
    build?: BuildOptions;
    author?: Author;
    socials?: Array<SocialLink>;
    sections?: Record<string, SiteSection>;

    theme?: any;
}

export type SectionType = 'blog' | 'link';

export interface SiteSection {
    title: string;
    description: string;
    archive?: boolean;
    feed?: boolean;
    type: SectionType;
}

export interface Author {
    name: string;
    email: string;
    url: string;
}

export interface BuildOptions {
    include?: Array<string>;
    exclude?: Array<string>;
}

export interface Site {
    title: string;
    baseUrl: string;
    name: string;
    icon: string;
    author?: Author;
    sections?: Record<string, SiteSection>;
    socials?: Array<SocialLink>;
    pages: Array<PageMetadata>;
    theme?: any;
}

export interface SocialLink {
    type: string;
    url: string;
}

export interface PageMetadata {
    id: string; // the unique id for this page
    title: string; // the title to be displayed in the address bar
    path: string; // the path to the file relative to root
    category: string; // the category in which this post is filed
    description: string; // the description for the page
    date: number; // when was it created
    published: boolean; // is the file published
    tags: Array<string>; // associated tags with page
    expiry?: number; // when does this page expire?
    series?: string; // is the page part of a series, then the series name
    alias: Array<string>; // alias paths for the page
    contentPath: string; // the path to JSON file that contains the content
    type: PageType; // the type of the page
    readingTime: number; // the time to read in minutes
}

export enum PageType {
    Markdown,
    Html,
    Text,
    Unknown
}