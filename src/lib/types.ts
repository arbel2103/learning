export interface TextBlock {
  id: string
  type: 'text'
  value: string
  bold?: boolean
}

export interface CanvasBlock {
  id: string
  type: 'canvas'
  heightPx: number
  imageKey: string
  rev: number
}

export interface ImageBlock {
  id: string
  type: 'image'
  blobKey: string
  caption: string
}

export interface FileBlock {
  id: string
  type: 'file'
  blobKey: string
  fileName: string
  mime: string
  size: number
}

export interface LinkBlock {
  id: string
  type: 'link'
  url: string
  title: string
}

export type Block = TextBlock | CanvasBlock | ImageBlock | FileBlock | LinkBlock
export type BlockType = Block['type']

export interface Subtopic {
  id: string
  name: string
  lineNumbers: boolean
  blocks: Block[]
}

export interface Topic {
  id: string
  name: string
  subtopics: Subtopic[]
}

export interface Project {
  id: string
  name: string
  topics: Topic[]
}

export interface Selection {
  projectId: string | null
  topicId: string | null
  subtopicId: string | null
}
