declare module 'rss-parser' {
  interface FeedItem {
    title?: string
    link?: string
    pubDate?: string
    isoDate?: string
    content?: string
    summary?: string
    'content:encoded'?: string
    enclosure?: {
      url?: string
    }
    'media:content'?: {
      $: {
        url?: string
      }
    }
    'media:thumbnail'?: {
      $: {
        url?: string
      }
    }
    [key: string]: any
  }

  interface FeedOutput {
    title?: string
    description?: string
    link?: string
    items: FeedItem[]
    [key: string]: any
  }

  interface ParserOptions {
    timeout?: number
    headers?: Record<string, string>
    [key: string]: any
  }

  class Parser {
    constructor(options?: ParserOptions)
    parseURL(url: string): Promise<FeedOutput>
    parseString(xml: string): Promise<FeedOutput>
  }

  export = Parser
}
